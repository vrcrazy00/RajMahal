import express from 'express';
import db from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', requireAuth, (req, res, next) => {
  try {
    // Property counts by status
    const propStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'Reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'Sold' THEN 1 ELSE 0 END) as sold,
        SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft
      FROM properties
    `).get();

    // Enquiry stats
    const enquiryStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) as new_enquiries,
        SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed
      FROM enquiries
    `).get();

    // Appointment stats
    const apptStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
      FROM appointments
    `).get();

    // Recent Enquiries
    const recentEnquiries = db.prepare(`
      SELECT e.*, p.title as property_title
      FROM enquiries e
      LEFT JOIN properties p ON e.property_id = p.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `).all();

    // Recent Appointments
    const recentAppointments = db.prepare(`
      SELECT a.*, p.title as property_title
      FROM appointments a
      LEFT JOIN properties p ON a.property_id = p.id
      ORDER BY a.preferred_date ASC, a.created_at DESC
      LIMIT 5
    `).all();

    // Recent Properties
    const recentProperties = db.prepare(`
      SELECT id, title, slug, property_type, price, price_display, location_name, status, created_at
      FROM properties
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        properties: propStats,
        enquiries: enquiryStats,
        appointments: apptStats,
        recent_enquiries: recentEnquiries,
        recent_appointments: recentAppointments,
        recent_properties: recentProperties
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
