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

// Helper: Save paste locally
function saveLocalPaste(item) {
  try {
    const filePath = path.join(LOCAL_STORAGE_DIR, `${item.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(item, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local paste:', err);
  }
}

// Helper: Get all local pastes (metadata only)
function getLocalPastes() {
  try {
    const files = fs.readdirSync(LOCAL_STORAGE_DIR).filter(f => f.endsWith('.json'));
    const items = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(LOCAL_STORAGE_DIR, file), 'utf8');
        const data = JSON.parse(raw);
        items.push({
          id: data.id,
          filename: data.filename,
          line_count: data.line_count || 0,
          size_bytes: data.size_bytes || 0,
          created_at: data.created_at
        });
      } catch (e) {
        // Ignore corrupted file
      }
    }
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (err) {
    console.error('Error reading local pastes:', err);
    return [];
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
      return true;
    }
  } catch (err) {
    console.error('Error deleting local paste:', err);
  }
  return false;
}

/**
 * POST /api/stash
 * Save a new text paste
 */
router.post('/', async (req, res) => {
  try {
    const { filename, content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Nội dung văn bản (content) là bắt buộc và phải là chuỗi ký tự.' });
    }

    const cleanFilename = (filename && filename.trim()) ? filename.trim() : `stash_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.txt`;
    const lineCount = content.length === 0 ? 0 : content.split('\n').length;
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

    // Always save local backup
    saveLocalPaste(pasteItem);

    // Try saving to Supabase if connected
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { error: sbError } = await supabase
          .from('text_pastes')
          .insert([pasteItem]);

        if (sbError) {
          console.warn('⚠️ Supabase insert into text_pastes failed (using local backup):', sbError.message);
        }
      } catch (sbErr) {
        console.warn('⚠️ Supabase text_pastes connection error:', sbErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      id,
      filename: cleanFilename,
      line_count: lineCount,
      size_bytes: sizeBytes,
      created_at: createdAt
    });
  } catch (error) {
    console.error('Error in POST /api/stash:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi lưu văn bản: ' + error.message });
  }
});

/**
 * GET /api/stash
 * Fetch list of all saved pastes (metadata only for speed)
 */
router.get('/', async (req, res) => {
  try {
    let items = [];

    // Try fetching from Supabase first
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data, error } = await supabase
          .from('text_pastes')
          .select('id, filename, line_count, size_bytes, created_at')
          .order('created_at', { ascending: false });

        if (!error && data) {
          items = data;
        }
      } catch (sbErr) {
        console.warn('⚠️ Supabase fetch error, fallback to local:', sbErr.message);
      }
    }

    // Merge or fallback to local files if Supabase is empty or failed
    const localItems = getLocalPastes();
    if (items.length === 0) {
      items = localItems;
    } else {
      // Merge unique by ID
      const ids = new Set(items.map(i => i.id));
      for (const loc of localItems) {
        if (!ids.has(loc.id)) {
          items.push(loc);
        }
      }
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return res.json({ success: true, items });
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
    let item = null;

    // Try Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
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
        console.warn('⚠️ Supabase get by id error:', sbErr.message);
      }
    }

    // Fallback to local
    if (!item) {
      item = getLocalPasteById(id);
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
    let item = null;

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
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
      item = getLocalPasteById(id);
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

    // Delete from Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await supabase
          .from('text_pastes')
          .delete()
          .eq('id', id);
      } catch (sbErr) {
        console.warn('⚠️ Supabase delete error:', sbErr.message);
      }
    }

    // Delete from local
    deleteLocalPaste(id);

    return res.json({ success: true, message: 'Đã xóa tệp thành công.' });
  } catch (error) {
    console.error('Error in DELETE /api/stash/:id:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi xóa tệp: ' + error.message });
  }
});

module.exports = router;
