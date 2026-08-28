const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const supabase = require('../db/supabase');

// Local storage directory for file backup / fallback
const LOCAL_STORAGE_DIR = path.join(__dirname, '../../data/pastes');
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

const INDEX_FILE = path.join(LOCAL_STORAGE_DIR, 'stash_index.json');

// In-memory index cache for lightning fast 0ms list responses
let indexCache = null;

// Helper: Fast line count without allocating arrays in RAM
function countLinesFast(str) {
  if (!str || str.length === 0) return 0;
  let lines = 1;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 10) lines++;
  }
  return lines;
}

// Helper: Load or rebuild index
function getOrBuildIndex() {
  if (indexCache !== null) {
    return indexCache;
  }

  if (fs.existsSync(INDEX_FILE)) {
    try {
      const raw = fs.readFileSync(INDEX_FILE, 'utf8');
      indexCache = JSON.parse(raw);
      if (Array.isArray(indexCache)) {
        return indexCache;
      }
    } catch (e) {
      console.warn('Corrupt stash_index.json, rebuilding from directory...');
    }
  }

  // Rebuild index by scanning directory
  const files = fs.readdirSync(LOCAL_STORAGE_DIR).filter(f => f.endsWith('.json') && f !== 'stash_index.json');
  const items = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(LOCAL_STORAGE_DIR, file), 'utf8');
      const data = JSON.parse(raw);
      items.push({
        id: data.id,
        filename: data.filename,
        line_count: data.line_count || (data.content ? countLinesFast(data.content) : 0),
        size_bytes: data.size_bytes || (data.content ? Buffer.byteLength(data.content, 'utf8') : 0),
        created_at: data.created_at || new Date().toISOString()
      });
    } catch (e) {
      // Ignore corrupted file
    }
  }

  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  indexCache = items;
  saveIndex(indexCache);
  return indexCache;
}

// Helper: Persist index to disk
function saveIndex(items) {
  try {
    fs.writeFileSync(INDEX_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving stash_index.json:', err);
  }
}

// Helper: Save paste locally
function saveLocalPaste(item) {
  try {
    const filePath = path.join(LOCAL_STORAGE_DIR, `${item.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(item), 'utf8');

    // Update index cache
    const index = getOrBuildIndex();
    const meta = {
      id: item.id,
      filename: item.filename,
      line_count: item.line_count,
      size_bytes: item.size_bytes,
      created_at: item.created_at
    };
    const updatedIndex = [meta, ...index.filter(i => i.id !== item.id)];
    indexCache = updatedIndex;
    saveIndex(updatedIndex);
  } catch (err) {
    console.error('Error saving local paste:', err);
  }
}

// Helper: Get single local paste
function getLocalPasteById(id) {
  try {
    const filePath = path.join(LOCAL_STORAGE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error getting local paste by id:', err);
  }
  return null;
}

// Helper: Delete local paste
function deleteLocalPaste(id) {
  try {
    const filePath = path.join(LOCAL_STORAGE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const index = getOrBuildIndex();
    const updatedIndex = index.filter(i => i.id !== id);
    indexCache = updatedIndex;
    saveIndex(updatedIndex);
    return true;
  } catch (err) {
    console.error('Error deleting local paste:', err);
  }
  return false;
}

/**
 * POST /api/stash
 * Save a new text paste (Instant local save + Non-blocking cloud sync)
 */
router.post('/', async (req, res) => {
  try {
    const { filename, content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Nội dung văn bản (content) là bắt buộc và phải là chuỗi ký tự.' });
    }

    const cleanFilename = (filename && filename.trim()) ? filename.trim() : `stash_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.txt`;
    const lineCount = countLinesFast(content);
    const sizeBytes = Buffer.byteLength(content, 'utf8');
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const pasteItem = {
      id,
      filename: cleanFilename,
      content,
      line_count: lineCount,
      size_bytes: sizeBytes,
      created_at: createdAt
    };

    // 1. Save locally with index (Instantaneous)
    saveLocalPaste(pasteItem);

    // 2. Respond immediately to user (0 timeout)
    res.status(201).json({
      success: true,
      id,
      filename: cleanFilename,
      line_count: lineCount,
      size_bytes: sizeBytes,
      created_at: createdAt
    });

    // 3. Background sync to Supabase Cloud if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('placeholder')) {
      setImmediate(async () => {
        try {
          const { error: sbError } = await supabase
            .from('text_pastes')
            .insert([pasteItem]);
          if (sbError) {
            console.warn('⚠️ Supabase async insert notice:', sbError.message);
          }
        } catch (sbErr) {
          console.warn('⚠️ Supabase async insert exception:', sbErr.message);
        }
      });
    }
  } catch (error) {
    console.error('Error in POST /api/stash:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi lưu văn bản: ' + error.message });
  }
});

/**
 * GET /api/stash
 * Fetch list of all saved pastes (Lightning fast from index)
 */
router.get('/', async (req, res) => {
  try {
    const localItems = getOrBuildIndex();

    // If Supabase is active, optionally fetch in parallel with fast 1.5s timeout
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('placeholder')) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 1500));
        const fetchPromise = supabase
          .from('text_pastes')
          .select('id, filename, line_count, size_bytes, created_at')
          .order('created_at', { ascending: false });

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
        if (!error && data && data.length > 0) {
          const ids = new Set(data.map(i => i.id));
          for (const loc of localItems) {
            if (!ids.has(loc.id)) {
              data.push(loc);
            }
          }
          data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          return res.json({ success: true, items: data });
        }
      } catch (sbErr) {
        // Fallback to local index
      }
    }

    return res.json({ success: true, items: localItems });
  } catch (error) {
    console.error('Error in GET /api/stash:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách tệp: ' + error.message });
  }
});

/**
 * GET /api/stash/:id
 * Fetch full content of a specific paste
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let item = getLocalPasteById(id);

    if (!item && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('placeholder')) {
      try {
        const { data, error } = await supabase
          .from('text_pastes')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          item = data;
          // Cache locally
          saveLocalPaste(item);
        }
      } catch (sbErr) {
        console.warn('⚠️ Supabase get by id error:', sbErr.message);
      }
    }

    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy tệp này hoặc đã bị xóa.' });
    }

    return res.json({ success: true, item });
  } catch (error) {
    console.error('Error in GET /api/stash/:id:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ: ' + error.message });
  }
});

/**
 * GET /api/stash/:id/download
 * Direct download attachment
 */
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    let item = getLocalPasteById(id);

    if (!item && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('placeholder')) {
      try {
        const { data, error } = await supabase
          .from('text_pastes')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          item = data;
        }
      } catch (sbErr) {
        console.warn('⚠️ Supabase download error:', sbErr.message);
      }
    }

    if (!item) {
      return res.status(404).send('Không tìm thấy tệp để tải về.');
    }

    const safeFilename = encodeURIComponent(item.filename || 'stash.txt');
    res.setHeader('Content-Disposition', `attachment; filename="${item.filename || 'stash.txt'}"; filename*=UTF-8''${safeFilename}`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(item.content || '');
  } catch (error) {
    console.error('Error in GET /api/stash/:id/download:', error);
    return res.status(500).send('Lỗi máy chủ khi tải tệp: ' + error.message);
  }
});

/**
 * DELETE /api/stash/:id
 * Delete a paste
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete from local index & file
    deleteLocalPaste(id);

    // 2. Delete from Supabase in background
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('placeholder')) {
      supabase
        .from('text_pastes')
        .delete()
        .eq('id', id)
        .catch(() => {});
    }

    return res.json({ success: true, message: 'Đã xóa tệp thành công.' });
  } catch (error) {
    console.error('Error in DELETE /api/stash/:id:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi xóa tệp: ' + error.message });
  }
});

module.exports = router;
