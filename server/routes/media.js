import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadPropertyImages } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads/properties');

const router = express.Router();

// Upload multiple images for a property
router.post('/properties/:id/images', requireAuth, uploadPropertyImages.array('images', 10), (req, res, next) => {
  try {
    const { id } = req.params;
    const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded.' });
    }

    // Check if property currently has any images
    const existingCountRow = db.prepare('SELECT COUNT(*) as count FROM property_images WHERE property_id = ?').get(id);
    const existingCount = existingCountRow ? existingCountRow.count : 0;

    const insertImg = db.prepare(`
      INSERT INTO property_images (id, property_id, url, filename, caption, display_order, is_primary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const uploaded = [];

    req.files.forEach((file, index) => {
      const imgId = crypto.randomUUID();
      const relativeUrl = `/uploads/properties/${file.filename}`;
      const isPrimary = existingCount === 0 && index === 0 ? 1 : 0;
      const displayOrder = existingCount + index;

      insertImg.run(
        imgId,
        id,
        relativeUrl,
        file.filename,
        file.originalname,
        displayOrder,
        isPrimary,
        now
      );

      uploaded.push({
        id: imgId,
        url: relativeUrl,
        filename: file.filename,
        caption: file.originalname,
        display_order: displayOrder,
        is_primary: isPrimary
      });
    });

    res.status(201).json({
      success: true,
      message: `${uploaded.length} image(s) uploaded successfully.`,
      data: uploaded
    });
  } catch (err) {
    next(err);
  }
});

// Delete an image
router.delete('/images/:id', requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    const image = db.prepare('SELECT * FROM property_images WHERE id = ?').get(id);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    // Unlink local file
    if (image.filename && !image.filename.startsWith('http')) {
      const filePath = path.join(uploadDir, image.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to unlink deleted image file:', e.message);
        }
      }
    }

    db.prepare('DELETE FROM property_images WHERE id = ?').run(id);

    // If deleted image was primary, designate another image as primary
    if (image.is_primary === 1) {
      const nextImg = db.prepare('SELECT id FROM property_images WHERE property_id = ? ORDER BY display_order ASC LIMIT 1').get(image.property_id);
      if (nextImg) {
        db.prepare('UPDATE property_images SET is_primary = 1 WHERE id = ?').run(nextImg.id);
      }
    }

    res.json({ success: true, message: 'Image deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// Set image as primary
router.patch('/images/:id/primary', requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    const image = db.prepare('SELECT * FROM property_images WHERE id = ?').get(id);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    // Reset primary for all other images of this property
    db.prepare('UPDATE property_images SET is_primary = 0 WHERE property_id = ?').run(image.property_id);

    // Set target image as primary
    db.prepare('UPDATE property_images SET is_primary = 1 WHERE id = ?').run(id);

    res.json({ success: true, message: 'Image marked as primary.' });
  } catch (err) {
    next(err);
  }
});

// Reorder images
router.patch('/images/reorder', requireAuth, (req, res, next) => {
  try {
    const { order } = req.body; // array of { id, order }

    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'Order must be an array of { id, order }.' });
    }

    const updateStmt = db.prepare('UPDATE property_images SET display_order = ? WHERE id = ?');
    for (const item of order) {
      if (item.id && typeof item.order === 'number') {
        updateStmt.run(item.order, item.id);
      }
    }

    res.json({ success: true, message: 'Images reordered successfully.' });
  } catch (err) {
    next(err);
  }
});

// Add video to property
router.post('/properties/:id/videos', requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    const { video_url, video_type = 'youtube', title = '' } = req.body;

    const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (!video_url || typeof video_url !== 'string' || !video_url.trim()) {
      return res.status(400).json({ success: false, message: 'Valid video URL is required.' });
    }

    const vidId = crypto.randomUUID();
    const now = new Date().toISOString();

    const countRow = db.prepare('SELECT COUNT(*) as count FROM property_videos WHERE property_id = ?').get(id);
    const displayOrder = countRow ? countRow.count : 0;

    db.prepare(`
      INSERT INTO property_videos (id, property_id, video_type, video_url, title, display_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(vidId, id, video_type, video_url.trim(), title.trim(), displayOrder, now);

    res.status(201).json({
      success: true,
      message: 'Video added successfully.',
      data: {
        id: vidId,
        property_id: id,
        video_type,
        video_url: video_url.trim(),
        title: title.trim(),
        display_order: displayOrder
      }
    });
  } catch (err) {
    next(err);
  }
});

// Delete video
router.delete('/videos/:id', requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    const video = db.prepare('SELECT id FROM property_videos WHERE id = ?').get(id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    db.prepare('DELETE FROM property_videos WHERE id = ?').run(id);

    res.json({ success: true, message: 'Video removed successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
