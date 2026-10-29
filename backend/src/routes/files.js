const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const supabase = require('../db/supabase');

// Lazy dynamic import for archiver v8+ (ES Module: new ZipArchive) & v7 fallback
let cachedArchiverMod = null;
async function createZipArchive(options) {
  if (!cachedArchiverMod) {
    cachedArchiverMod = await import('archiver');
  }
  if (typeof cachedArchiverMod.ZipArchive === 'function') {
    return new cachedArchiverMod.ZipArchive(options);
  }
  const fn = cachedArchiverMod.default || cachedArchiverMod;
  return fn('zip', options);
}

// Storage directories for uploaded text files & temporary upload chunks
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/text_files');
const CHUNKS_DIR = path.resolve(__dirname, '../../uploads/.chunks');
const INDEX_PATH = path.join(UPLOAD_DIR, '.files_index.json');

// In-memory metadata index & Supabase metadata cache
let localIndexLoaded = false;
const localIndexMap = new Map();

let lastChunkCleanupAt = 0;
const CHUNK_CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const CHUNK_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

const CLOUD_META_TTL_MS = 30 * 1000; // 30 seconds metadata cache
let cloudMetaCache = {
  fetchedAt: 0,
  map: new Map()
};

/**
 * Ensure upload & temporary chunk directories exist
 */
function ensureDirs() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(CHUNKS_DIR)) {
    fs.mkdirSync(CHUNKS_DIR, { recursive: true });
  }
}

/**
 * Check if Supabase persistence is configured
 */
function isSupabaseEnabled() {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_URL.includes('placeholder')
  );
}

/**
 * Fast O(N) zero-allocation byte line counter matching content.split(/\r?\n/).length
 */
function countLinesFast(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input || ''), 'utf8');
  const len = buf.length;
  if (len === 0) return 0;

  let lines = 1;
  for (let i = 0; i < len; i++) {
    const b = buf[i];
    if (b === 10) {
      lines++;
    } else if (b === 13 && buf[i + 1] !== 10) {
      lines++;
    }
  }
  return lines;
}

/**
 * Sanitize filename to prevent Directory Traversal, hidden dotfile collision, and invalid characters
 */
function sanitizeFilename(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';
  let clean = path.basename(rawName.trim().replace(/[/\\?%*:|"<>]/g, '_'));
  clean = clean.replace(/^\.+/, '');
  if (!clean) return '';
  if (!path.extname(clean)) {
    clean += '.txt';
  }
  return clean;
}

/**
 * Flush in-memory local index to .files_index.json
 */
function saveLocalIndexToDisk() {
  try {
    ensureDirs();
    const obj = {};
    for (const [k, v] of localIndexMap.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(INDEX_PATH, JSON.stringify(obj), 'utf8');
  } catch (err) {
    console.warn('[Files API] Failed to write .files_index.json:', err.message);
  }
}

/**
 * Reconcile in-memory metadata index with UPLOAD_DIR without reading unchanged file bodies
 */
function syncLocalIndex() {
  ensureDirs();

  if (!localIndexLoaded) {
    localIndexLoaded = true;
    if (fs.existsSync(INDEX_PATH)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            if (v && typeof v === 'object' && v.name) {
              localIndexMap.set(k, v);
            }
          }
        }
      } catch (err) {
        console.warn('[Files API] Could not parse .files_index.json, rebuilding:', err.message);
      }
    }
  }

  let dirty = false;
  const entries = fs.readdirSync(UPLOAD_DIR, { withFileTypes: true });
  const seenOnDisk = new Set();

  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('.')) continue;
    seenOnDisk.add(entry.name);

    const filePath = path.join(UPLOAD_DIR, entry.name);
    try {
      const stat = fs.statSync(filePath);
      const existing = localIndexMap.get(entry.name);

      if (
        existing &&
        existing.sizeBytes === stat.size &&
        typeof existing.lineCount === 'number' &&
        Math.abs((existing.mtimeMs || 0) - stat.mtimeMs) < 10
      ) {
        continue;
      }

      // Compute lineCount once for new or externally modified files
      const buf = fs.readFileSync(filePath);
      const lineCount = countLinesFast(buf);
      localIndexMap.set(entry.name, {
        name: entry.name,
        sizeBytes: stat.size,
        lineCount,
        createdAt: existing?.createdAt || stat.birthtime.toISOString(),
        updatedAt: stat.mtime.toISOString(),
        mtimeMs: stat.mtimeMs
      });
      dirty = true;
    } catch (err) {
      console.warn(`[Files API] Could not index file ${entry.name}:`, err.message);
    }
  }

  for (const key of Array.from(localIndexMap.keys())) {
    if (!seenOnDisk.has(key)) {
      localIndexMap.delete(key);
      dirty = true;
    }
  }

  if (dirty) {
    saveLocalIndexToDisk();
  }
}

/**
 * Update single file entry in local index directly (0 disk scan)
 */
function upsertLocalIndex(name, sizeBytes, lineCount, stat, createdAtOverride) {
  const existing = localIndexMap.get(name);
  const meta = {
    name,
    sizeBytes,
    lineCount,
    createdAt: createdAtOverride || existing?.createdAt || stat.birthtime.toISOString(),
    updatedAt: stat.mtime.toISOString(),
    mtimeMs: stat.mtimeMs
  };
  localIndexMap.set(name, meta);
  saveLocalIndexToDisk();
  return meta;
}

/**
 * Remove single file entry from local index
 */
function removeFromLocalIndex(name) {
  if (localIndexMap.delete(name)) {
    saveLocalIndexToDisk();
  }
}

/**
 * Opportunistically delete abandoned chunk .part files older than 1 hour
 */
function cleanupStaleChunks() {
  const now = Date.now();
  if (now - lastChunkCleanupAt < CHUNK_CLEANUP_INTERVAL_MS) return;
  lastChunkCleanupAt = now;

  try {
    ensureDirs();
    const entries = fs.readdirSync(CHUNKS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.part')) continue;
      const p = path.join(CHUNKS_DIR, entry.name);
      try {
        const stat = fs.statSync(p);
        if (now - stat.mtimeMs > CHUNK_MAX_AGE_MS) {
          fs.unlinkSync(p);
        }
      } catch {
        // Ignore race condition if part was just consumed
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Fetch lightweight metadata (NO content column) from Supabase public.text_pastes
 */
async function fetchCloudMetaMap(force = false) {
  if (!isSupabaseEnabled()) {
    return new Map();
  }

  const now = Date.now();
  if (!force && cloudMetaCache.fetchedAt > 0 && now - cloudMetaCache.fetchedAt < CLOUD_META_TTL_MS) {
    return cloudMetaCache.map;
  }

  try {
    const { data, error } = await supabase
      .from('text_pastes')
      .select('filename, line_count, size_bytes, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Files API] Supabase metadata list warning:', error.message);
      return cloudMetaCache.map;
    }

    const map = new Map();
    if (Array.isArray(data)) {
      for (const row of data) {
        if (!row || !row.filename || map.has(row.filename)) continue;
        const iso = row.created_at || new Date().toISOString();
        const mtimeMs = new Date(iso).getTime() || 0;
        map.set(row.filename, {
          name: row.filename,
          sizeBytes: Number(row.size_bytes) || 0,
          lineCount: Number(row.line_count) || 0,
          createdAt: iso,
          updatedAt: iso,
          mtimeMs
        });
      }
    }

    cloudMetaCache = {
      fetchedAt: now,
      map
    };
    return map;
  } catch (err) {
    console.warn('[Files API] Supabase metadata fetch exception:', err.message);
    return cloudMetaCache.map;
  }
}

/**
 * Persist GZIP-compressed file to Supabase public.text_pastes so Render spin-down never loses files
 */
async function persistFileToSupabase(filename, sizeBytes, lineCount, gzBuffer, isoNow) {
  if (!isSupabaseEnabled()) return;

  try {
    const encodedContent = 'gz_b64:' + gzBuffer.toString('base64');
    await supabase.from('text_pastes').delete().eq('filename', filename);

    const { error } = await supabase.from('text_pastes').insert({
      filename,
      content: encodedContent,
      line_count: lineCount,
      size_bytes: sizeBytes,
      created_at: isoNow
    });

    if (error) {
      console.warn(`[Files API] Supabase save warning for ${filename}:`, error.message);
      return;
    }

    const mtimeMs = new Date(isoNow).getTime() || Date.now();
    cloudMetaCache.map.set(filename, {
      name: filename,
      sizeBytes,
      lineCount,
      createdAt: isoNow,
      updatedAt: isoNow,
      mtimeMs
    });
  } catch (err) {
    console.warn(`[Files API] Supabase save exception for ${filename}:`, err.message);
  }
}

/**
 * Delete file from Supabase public.text_pastes
 */
async function deleteFileFromSupabase(filename) {
  cloudMetaCache.map.delete(filename);
  if (!isSupabaseEnabled()) return;

  try {
    const { error } = await supabase.from('text_pastes').delete().eq('filename', filename);
    if (error) {
      console.warn(`[Files API] Supabase delete warning for ${filename}:`, error.message);
    }
  } catch (err) {
    console.warn(`[Files API] Supabase delete exception for ${filename}:`, err.message);
  }
}

/**
 * Clear all files from Supabase public.text_pastes
 */
async function clearAllFilesFromSupabase() {
  cloudMetaCache.map.clear();
  cloudMetaCache.fetchedAt = Date.now();
  if (!isSupabaseEnabled()) return;

  try {
    const { error } = await supabase.from('text_pastes').delete().neq('filename', '');
    if (error) {
      console.warn('[Files API] Supabase clear-all warning:', error.message);
    }
  } catch (err) {
    console.warn('[Files API] Supabase clear-all exception:', err.message);
  }
}

/**
 * Decode stored text_pastes content (supports both 'gz_b64:<base64>' and legacy raw UTF-8 text)
 */
function decodeStoredContent(storedStr) {
  const str = String(storedStr || '');
  if (str.startsWith('gz_b64:')) {
    const gzBuf = Buffer.from(str.slice(7), 'base64');
    return zlib.gunzipSync(gzBuf);
  }
  return Buffer.from(str, 'utf8');
}

/**
 * Ensure a file exists on local disk; if wiped by Render spin-down, hydrate & gunzip from Supabase
 */
async function ensureFileHydrated(filename) {
  ensureDirs();
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  if (!isSupabaseEnabled()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('text_pastes')
      .select('filename, content, line_count, size_bytes, created_at')
      .eq('filename', filename)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const row = data[0];
    const rawBuf = decodeStoredContent(row.content);
    fs.writeFileSync(filePath, rawBuf);

    const stat = fs.statSync(filePath);
    const lineCount = Number(row.line_count) || countLinesFast(rawBuf);
    upsertLocalIndex(filename, rawBuf.length, lineCount, stat, row.created_at);
    return filePath;
  } catch (err) {
    console.error(`[Files API] Failed to hydrate ${filename} from Supabase:`, err.message);
    return null;
  }
}

/**
 * Get merged, sorted list of all files across local disk index & Supabase metadata
 */
async function getMergedFilesList(forceCloud = false) {
  syncLocalIndex();
  const cloudMap = await fetchCloudMetaMap(forceCloud);
  const merged = new Map();

  for (const [name, meta] of cloudMap.entries()) {
    merged.set(name, meta);
  }

  for (const [name, localMeta] of localIndexMap.entries()) {
    const cloudMeta = merged.get(name);
    if (!cloudMeta || (localMeta.mtimeMs || 0) >= (cloudMeta.mtimeMs || 0)) {
      merged.set(name, localMeta);
    }
  }

  const list = Array.from(merged.values());
  list.sort((a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0));
  return list;
}

/**
 * Determine next auto-increment filename based on the newest file in the merged list
 */
function computeNextAutoFilename(sortedFiles) {
  if (!sortedFiles || sortedFiles.length === 0) {
    return 'file_1.txt';
  }

  const existingNames = new Set(sortedFiles.map(f => f.name));
  const latestName = sortedFiles[0].name;
  const ext = path.extname(latestName) || '.txt';
  const baseName = path.basename(latestName, ext);

  const match = baseName.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const numStr = match[2];
    let nextNum = parseInt(numStr, 10) + 1;
    let candidate = `${prefix}${String(nextNum).padStart(numStr.length, '0')}${ext}`;

    while (existingNames.has(candidate)) {
      nextNum++;
      candidate = `${prefix}${String(nextNum).padStart(numStr.length, '0')}${ext}`;
    }
    return candidate;
  }

  let counter = 1;
  let candidate = `${baseName}_${counter}${ext}`;
  while (existingNames.has(candidate)) {
    counter++;
    candidate = `${baseName}_${counter}${ext}`;
  }
  return candidate;
}

/**
 * GET /api/files/suggest-name
 * Return recommended next auto-increment filename
 */
router.get('/suggest-name', async (req, res) => {
  try {
    const files = await getMergedFilesList(false);
    const suggestedName = computeNextAutoFilename(files);
    return res.json({ success: true, suggestedName });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/files/save-chunk
 * Receive GZIP-compressed or raw Base64 chunks on disk, assemble on final chunk,
 * update zero-RAM metadata index, and persist GZIP copy to Supabase public.text_pastes
 */
router.post('/save-chunk', async (req, res) => {
  try {
    ensureDirs();
    cleanupStaleChunks();

    const {
      uploadId,
      filename: rawFilename,
      chunkIndex,
      totalChunks,
      chunkBase64,
      compressed = 'none'
    } = req.body || {};

    const safeUploadId = String(uploadId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (safeUploadId.length < 4 || safeUploadId.length > 80) {
      return res.status(400).json({ success: false, error: 'Mã phiên tải lên (uploadId) không hợp lệ.' });
    }

    const idx = Number(chunkIndex);
    const total = Number(totalChunks);
    if (!Number.isInteger(idx) || !Number.isInteger(total) || idx < 0 || total < 1 || total > 5000 || idx >= total) {
      return res.status(400).json({ success: false, error: 'Thông số phân mảnh (chunkIndex / totalChunks) không hợp lệ.' });
    }

    if (typeof chunkBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'Dữ liệu mảnh tải lên (chunkBase64) bị thiếu.' });
    }

    const partPath = path.join(CHUNKS_DIR, `${safeUploadId}_${idx}.part`);
    const partBuf = Buffer.from(chunkBase64, 'base64');
    fs.writeFileSync(partPath, partBuf);

    // Intermediate chunk acknowledged immediately
    if (idx < total - 1) {
      return res.json({
        success: true,
        partial: true,
        chunkIndex: idx,
        totalChunks: total
      });
    }

    // Final chunk arrived -> verify & concatenate all parts from disk
    const partPaths = [];
    const partBuffers = [];
    for (let i = 0; i < total; i++) {
      const p = path.join(CHUNKS_DIR, `${safeUploadId}_${i}.part`);
      if (!fs.existsSync(p)) {
        return res.status(400).json({
          success: false,
          error: `Thiếu mảnh dữ liệu thứ ${i + 1}/${total}. Vui lòng thử tải lại tệp này.`
        });
      }
      partPaths.push(p);
      partBuffers.push(fs.readFileSync(p));
    }

    const combinedBuf = Buffer.concat(partBuffers);
    partBuffers.length = 0;

    // Immediately clean up temporary .part files
    for (const p of partPaths) {
      try {
        fs.unlinkSync(p);
      } catch {
        // Ignore unlink errors
      }
    }

    let rawBuf;
    let gzBuf;
    if (compressed === 'gzip') {
      rawBuf = zlib.gunzipSync(combinedBuf);
      gzBuf = combinedBuf;
    } else {
      rawBuf = combinedBuf;
      gzBuf = zlib.gzipSync(rawBuf, { level: 6 });
    }

    let filename = sanitizeFilename(rawFilename);
    if (!filename) {
      const existingFiles = await getMergedFilesList(false);
      filename = computeNextAutoFilename(existingFiles);
    }

    const filePath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, rawBuf);

    const stat = fs.statSync(filePath);
    const lineCount = countLinesFast(rawBuf);
    const sizeBytes = rawBuf.length;
    const isoNow = stat.mtime.toISOString();

    const meta = upsertLocalIndex(filename, sizeBytes, lineCount, stat);
    await persistFileToSupabase(filename, sizeBytes, lineCount, gzBuf, isoNow);

    return res.json({
      success: true,
      partial: false,
      message: `Đã lưu tệp ${filename} thành công!`,
      file: {
        name: filename,
        sizeBytes,
        lineCount,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt
      }
    });
  } catch (err) {
    console.error('[Files API] Save-chunk error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/files/save
 * Direct text save endpoint (backward-compatible) with index update & Supabase persistence
 */
router.post('/save', async (req, res) => {
  try {
    ensureDirs();
    const { filename: rawFilename, content = '' } = req.body || {};

    let filename = sanitizeFilename(rawFilename);
    if (!filename) {
      const existingFiles = await getMergedFilesList(false);
      filename = computeNextAutoFilename(existingFiles);
    }

    const rawBuf = Buffer.from(String(content), 'utf8');
    const filePath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, rawBuf);

    const stat = fs.statSync(filePath);
    const lineCount = countLinesFast(rawBuf);
    const sizeBytes = rawBuf.length;
    const isoNow = stat.mtime.toISOString();

    const meta = upsertLocalIndex(filename, sizeBytes, lineCount, stat);
    const gzBuf = zlib.gzipSync(rawBuf, { level: 6 });
    await persistFileToSupabase(filename, sizeBytes, lineCount, gzBuf, isoNow);

    return res.json({
      success: true,
      message: `Đã lưu tệp ${filename} thành công!`,
      file: {
        name: filename,
        sizeBytes,
        lineCount,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt
      }
    });
  } catch (err) {
    console.error('[Files API] Save error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/files/list
 * List all saved text files using lightweight metadata index (0 full-file RAM reads)
 */
router.get('/list', async (req, res) => {
  try {
    const forceCloud = req.query.refreshCloud === '1';
    const files = await getMergedFilesList(forceCloud);

    return res.json({
      success: true,
      totalCount: files.length,
      files,
      nextSuggestedName: computeNextAutoFilename(files)
    });
  } catch (err) {
    console.error('[Files API] List error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/files/content/:filename
 * Read file content for preview in modal (auto-hydrates from Supabase if needed)
 */
router.get('/content/:filename', async (req, res) => {
  try {
    const filename = sanitizeFilename(req.params.filename);
    if (!filename) {
      return res.status(400).json({ success: false, error: 'Tên tệp không hợp lệ.' });
    }

    const filePath = await ensureFileHydrated(filename);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tệp tin.' });
    }

    const rawBuf = fs.readFileSync(filePath);
    const stat = fs.statSync(filePath);
    const existingMeta = localIndexMap.get(filename);
    const lineCount = existingMeta?.lineCount || countLinesFast(rawBuf);
    const content = rawBuf.toString('utf8');

    return res.json({
      success: true,
      name: filename,
      sizeBytes: stat.size,
      lineCount,
      content,
      updatedAt: stat.mtime
    });
  } catch (err) {
    console.error('[Files API] Content error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/files/download/:filename
 * Download individual file (auto-hydrates from Supabase if needed)
 */
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = sanitizeFilename(req.params.filename);
    if (!filename) {
      return res.status(400).json({ success: false, error: 'Tên tệp không hợp lệ.' });
    }

    const filePath = await ensureFileHydrated(filename);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tệp tin để tải về.' });
    }

    return res.download(filePath, filename);
  } catch (err) {
    console.error('[Files API] Download error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/files/download-all
 * Stream all 50-100+ files as a ZIP archive directly to HTTP response (< 15 MB RAM)
 */
router.get('/download-all', async (req, res) => {
  try {
    const allFiles = await getMergedFilesList(false);
    if (allFiles.length === 0) {
      return res.status(400).json({ success: false, error: 'Chưa có tệp tin nào trên máy chủ để tải về.' });
    }

    // Hydrate any missing files to disk sequentially before streaming ZIP
    const hydratedFiles = [];
    for (const item of allFiles) {
      const filePath = await ensureFileHydrated(item.name);
      if (filePath && fs.existsSync(filePath)) {
        hydratedFiles.push({ name: item.name, filePath });
      }
    }

    if (hydratedFiles.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy dữ liệu tệp để đóng gói ZIP.' });
    }

    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    const zipFilename = `all_text_files_${todayStr}.zip`;

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${zipFilename}"`);

    const archive = await createZipArchive({ zlib: { level: 6 } });

    archive.on('warning', (warnErr) => {
      console.warn('[Files API] Archiver warning:', warnErr.message);
    });

    archive.on('error', (archErr) => {
      console.error('[Files API] Archiver stream error:', archErr);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: archErr.message });
      } else {
        res.destroy(archErr);
      }
    });

    archive.pipe(res);

    for (const item of hydratedFiles) {
      archive.file(item.filePath, { name: item.name });
    }

    await archive.finalize();
  } catch (err) {
    console.error('[Files API] Download all error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
});

/**
 * DELETE /api/files
 * Delete all saved files from disk, local index, and Supabase public.text_pastes
 */
router.delete('/', async (req, res) => {
  try {
    ensureDirs();
    const entries = fs.readdirSync(UPLOAD_DIR, { withFileTypes: true });
    let deletedLocal = 0;

    for (const entry of entries) {
      if (!entry.isFile() || entry.name === '.files_index.json') continue;
      try {
        fs.unlinkSync(path.join(UPLOAD_DIR, entry.name));
        deletedLocal++;
      } catch {
        // Ignore individual unlink failure
      }
    }

    localIndexMap.clear();
    saveLocalIndexToDisk();
    await clearAllFilesFromSupabase();

    return res.json({
      success: true,
      deletedLocal,
      message: 'Đã xóa sạch toàn bộ tệp tin trên máy chủ!',
      nextSuggestedName: 'file_1.txt'
    });
  } catch (err) {
    console.error('[Files API] Delete-all error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/files/:filename
 * Delete single file from disk, local index, and Supabase public.text_pastes
 */
router.delete('/:filename', async (req, res) => {
  try {
    ensureDirs();
    const filename = sanitizeFilename(req.params.filename);
    if (!filename) {
      return res.status(400).json({ success: false, error: 'Tên tệp không hợp lệ.' });
    }

    const filePath = path.join(UPLOAD_DIR, filename);
    const existedOnDisk = fs.existsSync(filePath);
    const cloudMap = await fetchCloudMetaMap(false);
    const existedInCloud = cloudMap.has(filename);

    if (!existedOnDisk && !existedInCloud) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tệp tin để xóa.' });
    }

    if (existedOnDisk) {
      fs.unlinkSync(filePath);
    }

    removeFromLocalIndex(filename);
    await deleteFileFromSupabase(filename);

    const remainingFiles = await getMergedFilesList(false);
    return res.json({
      success: true,
      message: `Đã xóa tệp ${filename} thành công!`,
      nextSuggestedName: computeNextAutoFilename(remainingFiles)
    });
  } catch (err) {
    console.error('[Files API] Delete error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
