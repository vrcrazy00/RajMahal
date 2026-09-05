import db from './database.js';

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL COLLATE NOCASE,
      state TEXT NOT NULL,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      property_type TEXT NOT NULL,
      listing_type TEXT NOT NULL DEFAULT 'Sale',
      price REAL NOT NULL,
      price_display TEXT NOT NULL,
      location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
      location_name TEXT NOT NULL COLLATE NOCASE,
      city TEXT NOT NULL COLLATE NOCASE,
      state TEXT NOT NULL,
      address TEXT,
      area REAL NOT NULL,
      area_unit TEXT NOT NULL DEFAULT 'sq ft',
      bedrooms INTEGER,
      bathrooms INTEGER,
      floors INTEGER,
      facing TEXT,
      road_width TEXT,
      parking TEXT,
      furnished_status TEXT,
      construction_status TEXT,
      possession_date TEXT,
      description TEXT NOT NULL,
      amenities TEXT NOT NULL DEFAULT '[]',
      nearby_landmarks TEXT NOT NULL DEFAULT '[]',
      latitude REAL,
      longitude REAL,
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Available',
      views_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
    CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
    CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location_name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
    CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
    CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
    CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);

    CREATE TABLE IF NOT EXISTS property_images (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      filename TEXT NOT NULL,
      caption TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_images_property ON property_images(property_id);
    CREATE INDEX IF NOT EXISTS idx_images_order ON property_images(property_id, display_order);

    CREATE TABLE IF NOT EXISTS property_videos (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      video_type TEXT NOT NULL DEFAULT 'youtube',
      video_url TEXT NOT NULL,
      title TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_videos_property ON property_videos(property_id);

    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'property_page',
      status TEXT NOT NULL DEFAULT 'New',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
    CREATE INDEX IF NOT EXISTS idx_enquiries_property ON enquiries(property_id);

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      appointment_type TEXT NOT NULL DEFAULT 'Site Visit',
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(preferred_date);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  console.log('Database migrations completed successfully.');
}

if (process.argv[1] === import.meta.filename) {
  runMigrations();
}
