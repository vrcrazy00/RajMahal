import express from 'express';
import db from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all locations with property count
router.get('/', (req, res, next) => {
  try {
    const locations = db.prepare(`
      SELECT l.id, l.name, l.state, l.is_featured,
             COUNT(p.id) as property_count
      FROM locations l
      LEFT JOIN properties p ON (p.location_name = l.name OR p.city = l.name) AND p.status != 'Draft'
      GROUP BY l.id, l.name, l.state, l.is_featured
      ORDER BY l.is_featured DESC, l.name ASC
    `).all();

    res.json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
});

// Admin: Add new location
router.post('/', requireAuth, (req, res, next) => {
  try {
    const { name, state = 'Haryana', is_featured = 0 } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Location name is required.' });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT OR IGNORE INTO locations (name, state, is_featured, created_at)
      VALUES (?, ?, ?, ?)
    `).run(name.trim(), state.trim(), is_featured ? 1 : 0, now);

    res.status(201).json({
      success: true,
      message: 'Location added successfully.',
      data: { name: name.trim(), state: state.trim() }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
