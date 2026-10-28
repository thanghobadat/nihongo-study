const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Storage directory for uploaded text files
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/text_files');

// Ensure upload directory exists
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Determine next auto-increment filename based on the newest file in the directory
 */
function getNextAutoFilename() {
  ensureUploadDir();
  const entries = fs.readdirSync(UPLOAD_DIR, { withFileTypes: true });
  const files = entries
    .filter(e => e.isFile() && !e.name.startsWith('.'))
    .map(e => {
      try {
        const stat = fs.statSync(path.join(UPLOAD_DIR, e.name));
        return { name: e.name, mtimeMs: stat.mtimeMs, birthtimeMs: stat.birthtimeMs };
      } catch {
        return { name: e.name, mtimeMs: 0, birthtimeMs: 0 };
      }
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  if (files.length === 0) {
    return 'file_1.txt';
  }

  const latestName = files[0].name;
  const ext = path.extname(latestName) || '.txt';
  const baseName = path.basename(latestName, ext);

  // Check if baseName ends with digits (e.g. file_1, bai_tap_05, data10)
  const match = baseName.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const numStr = match[2];
    let nextNum = parseInt(numStr, 10) + 1;
    let candidate = `${prefix}${String(nextNum).padStart(numStr.length, '0')}${ext}`;

    while (fs.existsSync(path.join(UPLOAD_DIR, candidate))) {
      nextNum++;
      candidate = `${prefix}${String(nextNum).padStart(numStr.length, '0')}${ext}`;
    }
    return candidate;
  }

  // BaseName has no trailing digits (e.g. "document", "notes")
  let counter = 1;
  let candidate = `${baseName}_${counter}${ext}`;
  while (fs.existsSync(path.join(UPLOAD_DIR, candidate))) {
    counter++;
    candidate = `${baseName}_${counter}${ext}`;
  }
  return candidate;
}

/**
 * Sanitize filename to prevent Directory Traversal and dangerous characters
 */
function sanitizeFilename(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';
  // Strip path separators and null bytes
  let clean = path.basename(rawName.trim().replace(/[/\\?%*:|"<>]/g, '_'));
  if (!clean) return '';
  // Default extension if none provided
  if (!path.extname(clean)) {
    clean += '.txt';
  }
  return clean;
}

/**
 * GET /api/files/suggest-name
 * Return recommended next auto-increment filename
 */
router.get('/suggest-name', (req, res) => {
  try {
    const suggestedName = getNextAutoFilename();
    return res.json({ success: true, suggestedName });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/files/save
 * Save pasted text to server file
 */
router.post('/save', (req, res) => {
  try {
    ensureUploadDir();
    const { filename: rawFilename, content = '' } = req.body;

    let filename = sanitizeFilename(rawFilename);
    if (!filename) {
      filename = getNextAutoFilename();
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    // Save text content (handles 20,000+ lines effortlessly)
    fs.writeFileSync(filePath, String(content), 'utf8');

    const stat = fs.statSync(filePath);
    const lineCount = String(content).split(/\r?\n/).length;

    return res.json({
      success: true,
      message: `Đã lưu tệp ${filename} thành công!`,
      file: {
        name: filename,
        sizeBytes: stat.size,
        lineCount,
        createdAt: stat.birthtime,
        updatedAt: stat.mtime
      }
    });
  } catch (err) {
    console.error('[Files API] Save error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/files/list
 * List all saved text files with metadata
 */
router.get('/list', (req, res) => {
  try {
    ensureUploadDir();
    const entries = fs.readdirSync(UPLOAD_DIR, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      if (!entry.isFile() || entry.name.startsWith('.')) continue;

      const filePath = path.join(UPLOAD_DIR, entry.name);
      try {
        const stat = fs.statSync(filePath);
        // Fast line count calculation
        let lineCount = 0;
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          lineCount = content.split(/\r?\n/).length;
        } catch {
          lineCount = 0;
        }

        files.push({
          name: entry.name,
          sizeBytes: stat.size,
          lineCount,
          createdAt: stat.birthtime,
          updatedAt: stat.mtime,
          mtimeMs: stat.mtimeMs
        });
      } catch (err) {
        console.warn(`[Files API] Could not stat file ${entry.name}:`, err.message);
      }
    }

    // Sort by latest modified time first
    files.sort((a, b) => b.mtimeMs - a.mtimeMs);

    return res.json({
      success: true,
      totalCount: files.length,
      files,
      nextSuggestedName: getNextAutoFilename()
    });
  } catch (err) {
    console.error('[Files API] List error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/files/content/:filename
 * Read file content for preview in modal
 */
router.get('/content/:filename', (req, res) => {
  try {
    ensureUploadDir();
    const filename = sanitizeFilename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tệp tin.' });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const stat = fs.statSync(filePath);
    const lineCount = content.split(/\r?\n/).length;

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
 * Download individual file
 */
router.get('/download/:filename', (req, res) => {
  try {
    ensureUploadDir();
    const filename = sanitizeFilename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tệp tin để tải về.' });
    }

    return res.download(filePath, filename);
  } catch (err) {
    console.error('[Files API] Download error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/files/:filename
 * Delete single file from server
 */
router.delete('/:filename', (req, res) => {
  try {
    ensureUploadDir();
    const filename = sanitizeFilename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tệp tin để xóa.' });
    }

    fs.unlinkSync(filePath);
    return res.json({
      success: true,
      message: `Đã xóa tệp ${filename} thành công!`,
      nextSuggestedName: getNextAutoFilename()
    });
  } catch (err) {
    console.error('[Files API] Delete error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/files/download-all
 * Download all files as a ZIP archive
 */
router.get('/download-all', (req, res) => {
  try {
    ensureUploadDir();
    const entries = fs.readdirSync(UPLOAD_DIR, { withFileTypes: true });
    const fileList = entries.filter(e => e.isFile() && !e.name.startsWith('.'));

    if (fileList.length === 0) {
      return res.status(400).json({ success: false, error: 'Chưa có tệp tin nào trên máy chủ để tải về.' });
    }

    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    const zipFilename = `all_text_files_${todayStr}.zip`;

    const zip = new AdmZip();
    for (const file of fileList) {
      const filePath = path.join(UPLOAD_DIR, file.name);
      zip.addLocalFile(filePath);
    }

    const zipBuffer = zip.toBuffer();
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.set('Content-Length', zipBuffer.length);
    return res.send(zipBuffer);
  } catch (err) {
    console.error('[Files API] Download all error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
