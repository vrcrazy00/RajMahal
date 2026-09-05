import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { validateProperty } from '../middleware/validate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads/properties');

const router = express.Router();

// Helper: Format Indian Rupee currency
export function formatPriceDisplay(price) {
  const num = Number(price);
  if (isNaN(num) || num <= 0) return 'Price on Request';
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹ ${cr % 1 === 0 ? cr : cr.toFixed(2)} Crore`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `₹ ${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh`;
  }
  return `₹ ${num.toLocaleString('en-IN')}`;
}

// Helper: Generate unique SEO slug
export function generateSlug(title, currentId = null) {
  let baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!baseSlug) {
    baseSlug = 'property-' + crypto.randomUUID().slice(0, 8);
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = db.prepare('SELECT id FROM properties WHERE slug = ?').get(slug);
    if (!existing || (currentId && existing.id === currentId)) {
      return slug;
    }
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

// Helper: Attach media to property row
function attachMedia(property) {
  if (!property) return null;
  const images = db.prepare(`
    SELECT * FROM property_images
    WHERE property_id = ?
    ORDER BY is_primary DESC, display_order ASC, created_at ASC
  `).all(property.id);

  const videos = db.prepare(`
    SELECT * FROM property_videos
    WHERE property_id = ?
    ORDER BY display_order ASC, created_at ASC
  `).all(property.id);

  let amenities = [];
  try {
    amenities = JSON.parse(property.amenities || '[]');
  } catch (e) {
    amenities = [];
  }

  let nearbyLandmarks = [];
  try {
    nearbyLandmarks = JSON.parse(property.nearby_landmarks || '[]');
  } catch (e) {
    nearbyLandmarks = [];
  }

  const primaryImage = images.find(img => img.is_primary === 1) || images[0] || null;

  return {
    ...property,
    amenities,
    nearby_landmarks: nearbyLandmarks,
    images,
    videos,
    primary_image: primaryImage ? primaryImage.url : '/uploads/properties/villa-1.jpg'
  };
}

// ==========================================
// PUBLIC ROUTES
// ==========================================

// GET /api/properties (Filtered & Paginated)
router.get('/', (req, res, next) => {
  try {
    let {
      search,
      location,
      property_type,
      listing_type,
      min_price,
      max_price,
      min_area,
      max_area,
      status,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    // Public users never see 'Draft' properties
    conditions.push("status != 'Draft'");

    // Status filter
    if (status && status !== 'All') {
      conditions.push("status = ?");
      params.push(status);
    }

    // Keyword Search (across title, description, address, location_name, city)
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(`(
        title LIKE ? OR
        description LIKE ? OR
        address LIKE ? OR
        location_name LIKE ? OR
        city LIKE ?
      )`);
      params.push(term, term, term, term, term);
    }

    // Location filter (tolerant, case-insensitive partial match)
    if (location && location.trim() && location !== 'All') {
      const locTerm = `%${location.trim()}%`;
      conditions.push("(location_name LIKE ? OR city LIKE ?)");
      params.push(locTerm, locTerm);
    }

    // Property Type filter
    if (property_type && property_type.trim() && property_type !== 'All') {
      conditions.push("property_type = ?");
      params.push(property_type.trim());
    }

    // Listing Type filter (Sale, Rent, Lease)
    if (listing_type && listing_type.trim() && listing_type !== 'All') {
      conditions.push("listing_type = ?");
      params.push(listing_type.trim());
    }

    // Price filtering (gracefully handling min > max)
    let minP = min_price ? Number(min_price) : null;
    let maxP = max_price ? Number(max_price) : null;
    if (minP !== null && maxP !== null && minP > maxP) {
      [minP, maxP] = [maxP, minP];
    }
    if (minP !== null && !isNaN(minP) && minP > 0) {
      conditions.push("price >= ?");
      params.push(minP);
    }
    if (maxP !== null && !isNaN(maxP) && maxP > 0) {
      conditions.push("price <= ?");
      params.push(maxP);
    }

    // Area filtering (gracefully handling min > max)
    let minA = min_area ? Number(min_area) : null;
    let maxA = max_area ? Number(max_area) : null;
    if (minA !== null && maxA !== null && minA > maxA) {
      [minA, maxA] = [maxA, minA];
    }
    if (minA !== null && !isNaN(minA) && minA > 0) {
      conditions.push("area >= ?");
      params.push(minA);
    }
    if (maxA !== null && !isNaN(maxA) && maxA > 0) {
      conditions.push("area <= ?");
      params.push(maxA);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderBy = 'featured DESC, created_at DESC';
    if (sort === 'price_asc') orderBy = 'price ASC';
    if (sort === 'price_desc') orderBy = 'price DESC';
    if (sort === 'newest') orderBy = 'created_at DESC';
    if (sort === 'area_asc') orderBy = 'area ASC';
    if (sort === 'area_desc') orderBy = 'area DESC';

    // Count Total
    const countQuery = `SELECT COUNT(*) as total FROM properties ${whereClause}`;
    const totalRow = db.prepare(countQuery).get(...params);
    const total = totalRow ? totalRow.total : 0;

    // Fetch Page
    const dataQuery = `
      SELECT * FROM properties
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const rows = db.prepare(dataQuery).all(...params, limit, offset);

    const properties = rows.map(r => attachMedia(r));

    res.json({
      success: true,
      data: properties,
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
});

// GET /api/properties/featured
router.get('/featured', (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM properties
      WHERE status != 'Draft' AND featured = 1
      ORDER BY created_at DESC
      LIMIT 6
    `).all();

    const properties = rows.map(r => attachMedia(r));
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/:slug_or_id
router.get('/:slug_or_id', (req, res, next) => {
  try {
    const { slug_or_id } = req.params;
    const property = db.prepare(`
      SELECT * FROM properties
      WHERE (slug = ? OR id = ?) AND status != 'Draft'
    `).get(slug_or_id, slug_or_id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or is currently not published.'
      });
    }

    // Increment view counter
    db.prepare('UPDATE properties SET views_count = views_count + 1 WHERE id = ?').run(property.id);

    const result = attachMedia(property);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ADMIN ROUTES (Protected)
// ==========================================

// GET /api/admin/properties
export const getAdminProperties = (req, res, next) => {
  try {
    let { search, status, property_type, location, page = 1, limit = 15 } = req.query;
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 15));
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push("(title LIKE ? OR location_name LIKE ? OR city LIKE ? OR slug LIKE ?)");
      params.push(term, term, term, term);
    }

    if (status && status !== 'All') {
      conditions.push("status = ?");
      params.push(status);
    }

    if (property_type && property_type !== 'All') {
      conditions.push("property_type = ?");
      params.push(property_type);
    }

    if (location && location !== 'All') {
      conditions.push("(location_name LIKE ? OR city LIKE ?)");
      params.push(`%${location}%`, `%${location}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalRow = db.prepare(`SELECT COUNT(*) as total FROM properties ${whereClause}`).get(...params);
    const total = totalRow ? totalRow.total : 0;

    const rows = db.prepare(`
      SELECT * FROM properties
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const properties = rows.map(r => attachMedia(r));

    res.json({
      success: true,
      data: properties,
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

// GET /api/admin/properties/:id
export const getAdminPropertyById = (req, res, next) => {
  try {
    const { id } = req.params;
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    res.json({ success: true, data: attachMedia(property) });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/properties
export const createAdminProperty = (req, res, next) => {
  try {
    const {
      title,
      property_type,
      listing_type = 'Sale',
      price,
      price_display,
      location_name,
      city,
      state = 'Haryana',
      address,
      area,
      area_unit = 'sq ft',
      bedrooms,
      bathrooms,
      floors,
      facing,
      road_width,
      parking,
      furnished_status,
      construction_status,
      possession_date,
      description,
      amenities,
      nearby_landmarks,
      latitude,
      longitude,
      featured = 0,
      status = 'Available'
    } = req.body;

    const id = crypto.randomUUID();
    const slug = generateSlug(title);
    const now = new Date().toISOString();
    const formattedPrice = price_display?.trim() || formatPriceDisplay(price);

    const amenitiesJson = Array.isArray(amenities)
      ? JSON.stringify(amenities)
      : typeof amenities === 'string'
      ? amenities
      : '[]';

    const landmarksJson = Array.isArray(nearby_landmarks)
      ? JSON.stringify(nearby_landmarks)
      : typeof nearby_landmarks === 'string'
      ? nearby_landmarks
      : '[]';

    // Find or associate location_id
    const locRow = db.prepare('SELECT id FROM locations WHERE name = ? COLLATE NOCASE').get(location_name.trim());
    const location_id = locRow ? locRow.id : null;

    db.prepare(`
      INSERT INTO properties (
        id, title, slug, property_type, listing_type, price, price_display,
        location_id, location_name, city, state, address, area, area_unit,
        bedrooms, bathrooms, floors, facing, road_width, parking, furnished_status,
        construction_status, possession_date, description, amenities, nearby_landmarks,
        latitude, longitude, featured, status, views_count, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      id, title.trim(), slug, property_type, listing_type, Number(price), formattedPrice,
      location_id, location_name.trim(), (city || location_name).trim(), state.trim(), address || '',
      Number(area), area_unit, bedrooms ? Number(bedrooms) : null, bathrooms ? Number(bathrooms) : null,
      floors ? Number(floors) : null, facing || null, road_width || null, parking || null,
      furnished_status || null, construction_status || null, possession_date || null,
      description || '', amenitiesJson, landmarksJson,
      latitude ? Number(latitude) : null, longitude ? Number(longitude) : null,
      featured ? 1 : 0, status, 0, now, now
    );

    const created = db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      data: attachMedia(created)
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/properties/:id
export const updateAdminProperty = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const {
      title,
      property_type,
      listing_type,
      price,
      price_display,
      location_name,
      city,
      state,
      address,
      area,
      area_unit,
      bedrooms,
      bathrooms,
      floors,
      facing,
      road_width,
      parking,
      furnished_status,
      construction_status,
      possession_date,
      description,
      amenities,
      nearby_landmarks,
      latitude,
      longitude,
      featured,
      status
    } = req.body;

    const newSlug = title && title !== existing.title ? generateSlug(title, id) : existing.slug;
    const now = new Date().toISOString();
    const formattedPrice = price_display?.trim() || formatPriceDisplay(price || existing.price);

    const amenitiesJson = Array.isArray(amenities)
      ? JSON.stringify(amenities)
      : typeof amenities === 'string'
      ? amenities
      : existing.amenities;

    const landmarksJson = Array.isArray(nearby_landmarks)
      ? JSON.stringify(nearby_landmarks)
      : typeof nearby_landmarks === 'string'
      ? nearby_landmarks
      : existing.nearby_landmarks;

    db.prepare(`
      UPDATE properties SET
        title = COALESCE(?, title),
        slug = ?,
        property_type = COALESCE(?, property_type),
        listing_type = COALESCE(?, listing_type),
        price = COALESCE(?, price),
        price_display = ?,
        location_name = COALESCE(?, location_name),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        address = COALESCE(?, address),
        area = COALESCE(?, area),
        area_unit = COALESCE(?, area_unit),
        bedrooms = ?,
        bathrooms = ?,
        floors = ?,
        facing = ?,
        road_width = ?,
        parking = ?,
        furnished_status = ?,
        construction_status = ?,
        possession_date = ?,
        description = COALESCE(?, description),
        amenities = ?,
        nearby_landmarks = ?,
        latitude = ?,
        longitude = ?,
        featured = COALESCE(?, featured),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).run(
      title ? title.trim() : null,
      newSlug,
      property_type || null,
      listing_type || null,
      price ? Number(price) : null,
      formattedPrice,
      location_name ? location_name.trim() : null,
      city ? city.trim() : null,
      state ? state.trim() : null,
      address !== undefined ? address : null,
      area ? Number(area) : null,
      area_unit || null,
      bedrooms !== undefined ? (bedrooms ? Number(bedrooms) : null) : existing.bedrooms,
      bathrooms !== undefined ? (bathrooms ? Number(bathrooms) : null) : existing.bathrooms,
      floors !== undefined ? (floors ? Number(floors) : null) : existing.floors,
      facing !== undefined ? facing : existing.facing,
      road_width !== undefined ? road_width : existing.road_width,
      parking !== undefined ? parking : existing.parking,
      furnished_status !== undefined ? furnished_status : existing.furnished_status,
      construction_status !== undefined ? construction_status : existing.construction_status,
      possession_date !== undefined ? possession_date : existing.possession_date,
      description !== undefined ? description : null,
      amenitiesJson,
      landmarksJson,
      latitude !== undefined ? (latitude ? Number(latitude) : null) : existing.latitude,
      longitude !== undefined ? (longitude ? Number(longitude) : null) : existing.longitude,
      featured !== undefined ? (featured ? 1 : 0) : null,
      status || null,
      now,
      id
    );

    const updated = db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'Property updated successfully.',
      data: attachMedia(updated)
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/properties/:id/status
export const updateAdminPropertyStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Available', 'Reserved', 'Sold', 'Coming Soon', 'Draft'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      UPDATE properties SET status = ?, updated_at = ? WHERE id = ?
    `).run(status, now, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    res.json({ success: true, message: `Property status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/properties/:id
export const deleteAdminProperty = (req, res, next) => {
  try {
    const { id } = req.params;
    const property = db.prepare('SELECT id, title FROM properties WHERE id = ?').get(id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Cleanup images on disk
    const images = db.prepare('SELECT filename FROM property_images WHERE property_id = ?').all(id);
    for (const img of images) {
      if (img.filename && !img.filename.startsWith('http')) {
        const filePath = path.join(uploadDir, img.filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error('Error removing image file:', e.message);
          }
        }
      }
    }

    db.prepare('DELETE FROM properties WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `Property "${property.title}" deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};

export default router;
