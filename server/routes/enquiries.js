import express from 'express';
import crypto from 'node:crypto';
import db from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { validateEnquiry } from '../middleware/validate.js';

const router = express.Router();

// Public: Submit enquiry
router.post('/', validateEnquiry, (req, res, next) => {
  try {
    const { name, phone, email, message, property_id, source = 'property_page' } = req.body;

    let linkedProp = null;
    if (property_id) {
      linkedProp = db.prepare('SELECT id, title FROM properties WHERE id = ?').get(property_id);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO enquiries (id, property_id, name, phone, email, message, source, status, admin_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'New', '', ?, ?)
    `).run(
      id,
      linkedProp ? linkedProp.id : null,
      name.trim(),
      phone.trim(),
      email.trim().toLowerCase(),
      message.trim(),
      source,
      now,
      now
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our senior property advisor will reach out to you shortly.',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
});

// Admin: View enquiries
export const getAdminEnquiries = (req, res, next) => {
  try {
    let { status, search, page = 1, limit = 15 } = req.query;
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 15));
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (status && status !== 'All') {
      conditions.push('e.status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(e.name LIKE ? OR e.phone LIKE ? OR e.email LIKE ? OR p.title LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = db.prepare(`
      SELECT COUNT(*) as total
      FROM enquiries e
      LEFT JOIN properties p ON e.property_id = p.id
      ${whereClause}
    `).get(...params);

    const total = countRow ? countRow.total : 0;

    const rows = db.prepare(`
      SELECT e.*, p.title as property_title, p.slug as property_slug
      FROM enquiries e
      LEFT JOIN properties p ON e.property_id = p.id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update enquiry status & notes
export const updateAdminEnquiryStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['New', 'Contacted', 'In Progress', 'Closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      UPDATE enquiries SET
        status = COALESCE(?, status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = ?
      WHERE id = ?
    `).run(status || null, admin_notes !== undefined ? admin_notes : null, now, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({ success: true, message: 'Enquiry updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete enquiry
export const deleteAdminEnquiry = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM enquiries WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({ success: true, message: 'Enquiry removed successfully.' });
  } catch (err) {
    next(err);
  }
};

export default router;
