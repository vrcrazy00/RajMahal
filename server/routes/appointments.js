import express from 'express';
import crypto from 'node:crypto';
import db from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { validateAppointment } from '../middleware/validate.js';

const router = express.Router();

// Public: Book site visit / appointment
router.post('/', validateAppointment, (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      property_id,
      appointment_type = 'Site Visit',
      preferred_date,
      preferred_time,
      message
    } = req.body;

    let linkedProp = null;
    if (property_id) {
      linkedProp = db.prepare('SELECT id, title FROM properties WHERE id = ?').get(property_id);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO appointments (
        id, property_id, name, phone, email, appointment_type,
        preferred_date, preferred_time, message, status, admin_notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', '', ?, ?)
    `).run(
      id,
      linkedProp ? linkedProp.id : null,
      name.trim(),
      phone.trim(),
      email.trim().toLowerCase(),
      appointment_type,
      preferred_date,
      preferred_time.trim(),
      message ? message.trim() : '',
      now,
      now
    );

    res.status(201).json({
      success: true,
      message: 'Your site visit request has been scheduled! Our executive will call to confirm your appointment time.',
      data: { id }
    });
  } catch (err) {
    next(err);
  }
});

// Admin: View appointments
export const getAdminAppointments = (req, res, next) => {
  try {
    let { status, search, page = 1, limit = 15 } = req.query;
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 15));
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (status && status !== 'All') {
      conditions.push('a.status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(a.name LIKE ? OR a.phone LIKE ? OR a.email LIKE ? OR p.title LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = db.prepare(`
      SELECT COUNT(*) as total
      FROM appointments a
      LEFT JOIN properties p ON a.property_id = p.id
      ${whereClause}
    `).get(...params);

    const total = countRow ? countRow.total : 0;

    const rows = db.prepare(`
      SELECT a.*, p.title as property_title, p.slug as property_slug
      FROM appointments a
      LEFT JOIN properties p ON a.property_id = p.id
      ${whereClause}
      ORDER BY a.preferred_date ASC, a.created_at DESC
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

// Admin: Update appointment status & notes
export const updateAdminAppointmentStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      UPDATE appointments SET
        status = COALESCE(?, status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = ?
      WHERE id = ?
    `).run(status || null, admin_notes !== undefined ? admin_notes : null, now, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({ success: true, message: `Appointment status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete appointment
export const deleteAdminAppointment = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({ success: true, message: 'Appointment removed successfully.' });
  } catch (err) {
    next(err);
  }
};

export default router;
