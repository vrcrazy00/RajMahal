import express from 'express';
import db from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all settings as key-value map
router.get('/', (req, res, next) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

// Admin: Update settings
export const updateAdminSettings = (req, res, next) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings payload must be a key-value object.' });
    }

    const upsertStmt = db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, value] of Object.entries(updates)) {
      if (typeof key === 'string' && key.trim()) {
        upsertStmt.run(key.trim(), String(value !== null && value !== undefined ? value : ''));
      }
    }

    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    res.json({
      success: true,
      message: 'Settings updated successfully.',
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

export default router;
