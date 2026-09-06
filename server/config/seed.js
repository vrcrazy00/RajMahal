import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './database.js';
import { runMigrations } from './migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function seedDatabase() {
  runMigrations();

  console.log('Seeding database with realistic Delhi NCR real estate data...');

  // 1. Seed Admin User
  const adminId = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync('Admin@12345', 10);
  const now = new Date().toISOString();

  const checkAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@realestate.com');
  if (!checkAdmin) {
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin', 'admin@realestate.com', passwordHash, 'admin', now, now);
    console.log('Admin user seeded: admin@realestate.com / Admin@12345');
  }

  // 2. Seed Locations
  const locations = [
    { name: 'Faridabad', state: 'Haryana', is_featured: 1 },
    { name: 'Gurgaon', state: 'Haryana', is_featured: 1 },
    { name: 'Noida', state: 'Uttar Pradesh', is_featured: 1 },
    { name: 'Greater Noida', state: 'Uttar Pradesh', is_featured: 1 },
    { name: 'Delhi', state: 'Delhi', is_featured: 1 },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', is_featured: 0 }
  ];

  const insertLocation = db.prepare(`
    INSERT OR IGNORE INTO locations (name, state, is_featured, created_at)
    VALUES (?, ?, ?, ?)
  `);

  for (const loc of locations) {
    insertLocation.run(loc.name, loc.state, loc.is_featured, now);
  }

  // Fetch location IDs map
  const locRows = db.prepare('SELECT id, name FROM locations').all();
  const locMap = {};
  for (const row of locRows) {
    locMap[row.name.toLowerCase()] = row.id;
  }

  // 3. Seed Settings
  const settingsData = {
    business_name: 'Apex Landmark Realty',
    tagline: 'Premium Plots, Luxury Villas & Prime Commercial Properties',
    phone: '+91 98765 43210',
    whatsapp: '+919876543210',
    email: 'contact@apexlandmark.com',
    address: 'Plot No. 42, Sector 14 Commercial Hub, Faridabad, Haryana 121007',
    business_hours: 'Mon - Sat: 9:30 AM - 7:30 PM | Sunday: By Appointment',
    about_summary: 'Over 18 years of excellence delivering clear-title residential plots, luxury villas, modern apartments, and prime commercial plots across Faridabad, Gurgaon, Noida, and Delhi NCR.',
    about_full: 'Apex Landmark Realty is a premier real estate advisory firm dedicated to assisting homebuyers, investors, and developers in acquiring high-growth properties with 100% legal clearance, verified titles, and seamless registry assistance. Our seasoned team guides you from site visits to registry completion.',
    hero_title: 'Find Your Perfect Property in Delhi NCR',
    hero_subtitle: 'Explore verified residential plots, luxury villas, high-rise apartments & commercial land with complete legal documentation.',
    social_facebook: 'https://facebook.com',
    social_instagram: 'https://instagram.com',
    social_linkedin: 'https://linkedin.com',
    social_youtube: 'https://youtube.com',
    footer_text: '© 2026 Apex Landmark Realty. RERA Registered Brokerage. All rights reserved.'
  };

  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value)
    VALUES (?, ?)
  `);

  for (const [key, val] of Object.entries(settingsData)) {
    insertSetting.run(key, val);
  }

  // 4. Seed Properties
  const properties = [
    {
      id: crypto.randomUUID(),
      title: 'Faridabad Sector 14 Luxury 4BHK Independent Villa',
      slug: 'faridabad-sector-14-luxury-4bhk-independent-villa',
      property_type: 'Villa',
      listing_type: 'Sale',
      price: 38500000,
      price_display: '₹ 3.85 Crore',
      location_name: 'Faridabad',
      city: 'Faridabad',
      state: 'Haryana',
      address: 'Sector 14, Main Boulevard, Faridabad',
      area: 3200,
      area_unit: 'sq ft',
      bedrooms: 4,
      bathrooms: 5,
      floors: 3,
      facing: 'North-East',
      road_width: '45 ft',
      parking: '2 Covered Cars',
      furnished_status: 'Semi-Furnished',
      construction_status: 'Ready to Move',
      possession_date: 'Immediate',
      description: 'Stunning modern luxury villa in prime Sector 14 Faridabad. Features Italian marble flooring, designer false ceiling, private landscaped terrace garden, modular European kitchen, servant quarters, and advanced biometric security. Within walking distance to premier markets, top schools, and metro station.',
      amenities: JSON.stringify(['24x7 Security', 'Modular Kitchen', 'Power Backup', 'Terrace Garden', 'CCTV Surveillance', 'Water Purifier', 'Reserved Parking', 'Visitor Parking']),
      nearby_landmarks: JSON.stringify(['Bata Chowk Metro (1.2 km)', 'Apeejay School (800 m)', 'Fortis Escorts Hospital (2 km)', 'Sector 14 Market (300 m)']),
      latitude: 28.4089,
      longitude: 77.3178,
      featured: 1,
      status: 'Available',
      images: [
        { url: '/uploads/properties/villa-1.jpg', caption: 'Front Elevation & Landscape', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Living & Dining Hall', is_primary: 0 },
        { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', caption: 'Designer Modular Kitchen', is_primary: 0 },
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', caption: 'Master Suite Bedroom', is_primary: 0 }
      ],
      videos: [
        { video_type: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Architectural Virtual Walkthrough' }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: 'Faridabad Sector 85 Freehold Residential Plot',
      slug: 'faridabad-sector-85-freehold-residential-plot',
      property_type: 'Residential Plot',
      listing_type: 'Sale',
      price: 7500000,
      price_display: '₹ 75 Lakh',
      location_name: 'Faridabad',
      city: 'Faridabad',
      state: 'Haryana',
      address: 'BPTP Park Elite, Sector 85, Greater Faridabad',
      area: 1800,
      area_unit: 'sq ft',
      bedrooms: null,
      bathrooms: null,
      floors: null,
      facing: 'East',
      road_width: '30 ft',
      parking: null,
      furnished_status: null,
      construction_status: 'Plot / Land',
      possession_date: 'Immediate Registry',
      description: 'Excellent east-facing freehold residential plot in rapidly developing Greater Faridabad Sector 85. Fully approved by DTCP Haryana, clear title with bank loan approvals from SBI & HDFC. Boundary wall constructed, underground electrical cabling, piped water connection, and lush green central park nearby.',
      amenities: JSON.stringify(['Gated Township', 'Underground Utilities', 'Street Lighting', 'Parks & Green Belts', 'Wide Roads', 'Clear Title', 'Bank Loan Approved']),
      nearby_landmarks: JSON.stringify(['Amrita Hospital (2.5 km)', 'Delhi-Mumbai Expressway (3 km)', 'DPS Greater Faridabad (1.5 km)', 'Sector 81 Metro (4 km)']),
      latitude: 28.4124,
      longitude: 77.3482,
      featured: 1,
      status: 'Available',
      images: [
        { url: '/uploads/properties/plot-1.jpg', caption: 'Plot Parcel & Community Boundary', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=1200&q=80', caption: 'Sector 85 Wide Access Road', is_primary: 0 },
        { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', caption: 'Community Green Park', is_primary: 0 }
      ],
      videos: []
    },
    {
      id: crypto.randomUUID(),
      title: 'Greenfield Colony Independent Luxury Floor 3BHK',
      slug: 'greenfield-colony-independent-luxury-floor-3bhk',
      property_type: 'Builder Floor',
      listing_type: 'Sale',
      price: 12500000,
      price_display: '₹ 1.25 Crore',
      location_name: 'Faridabad',
      city: 'Faridabad',
      state: 'Haryana',
      address: 'Block B, Greenfield Colony, Near NHPC Chowk, Faridabad',
      area: 2100,
      area_unit: 'sq ft',
      bedrooms: 3,
      bathrooms: 3,
      floors: 4,
      facing: 'North',
      road_width: '40 ft',
      parking: '1 Stilt Parking',
      furnished_status: 'Semi-Furnished',
      construction_status: 'Ready to Move',
      possession_date: 'Immediate',
      description: 'Brand new luxury builder floor with dedicated stilt parking and private Otis automatic elevator. Prime location close to South Delhi border. High-end woodwork, LED chandeliers, branded Kohler sanitaryware, and spacious private balconies.',
      amenities: JSON.stringify(['Lift / Elevator', 'Stilt Parking', 'Power Backup', 'Security Guard', 'Balcony', 'Modular Kitchen']),
      nearby_landmarks: JSON.stringify(['NHPC Chowk Metro (1 km)', 'South Delhi Border (4 km)', 'Crown Interiorz Mall (2.5 km)']),
      latitude: 28.4612,
      longitude: 77.3015,
      featured: 0,
      status: 'Available',
      images: [
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', caption: 'Building Facade & Stilt', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', caption: 'Designer Drawing Room', is_primary: 0 }
      ],
      videos: []
    },
    {
      id: crypto.randomUUID(),
      title: 'Mathura Road Prime Commercial Corner Plot',
      slug: 'mathura-road-prime-commercial-corner-plot',
      property_type: 'Commercial Plot',
      listing_type: 'Sale',
      price: 45000000,
      price_display: '₹ 4.50 Crore',
      location_name: 'Faridabad',
      city: 'Faridabad',
      state: 'Haryana',
      address: 'Main Mathura Road Highway, Sector 20B, Faridabad',
      area: 4500,
      area_unit: 'sq ft',
      bedrooms: null,
      bathrooms: null,
      floors: null,
      facing: 'North-East Corner',
      road_width: '150 ft',
      parking: 'Ample Front Parking',
      furnished_status: null,
      construction_status: 'Commercial Land',
      possession_date: 'Immediate',
      description: 'High-visibility corner commercial plot with 120 feet frontage directly on Delhi-Mathura National Highway. Ideal for corporate headquarters, automobile showroom, banking branch, or retail diagnostic hub. Clear commercial CLU conversion.',
      amenities: JSON.stringify(['Highway Frontage', 'Three-Phase Industrial Power', 'Heavy Vehicle Access', 'Corner Plot', 'High Footfall']),
      nearby_landmarks: JSON.stringify(['Old Faridabad Railway Station (1.5 km)', 'Neelam Flyover (1 km)', 'Metro Station (500 m)']),
      latitude: 28.4231,
      longitude: 77.3112,
      featured: 0,
      status: 'Available',
      images: [
        { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', caption: 'Highway Commercial Zone', is_primary: 1 }
      ],
      videos: []
    },
    {
      id: crypto.randomUUID(),
      title: 'Gurgaon Golf Course Ext Road 4BHK Luxury Sky Residence',
      slug: 'gurgaon-golf-course-ext-road-4bhk-luxury-sky-residence',
      property_type: 'Apartment',
      listing_type: 'Sale',
      price: 42000000,
      price_display: '₹ 4.20 Crore',
      location_name: 'Gurgaon',
      city: 'Gurgaon',
      state: 'Haryana',
      address: 'Sector 66, Golf Course Extension Road, Gurgaon',
      area: 3450,
      area_unit: 'sq ft',
      bedrooms: 4,
      bathrooms: 4,
      floors: 28,
      facing: 'North',
      road_width: '60 mtr',
      parking: '2 Dedicated Basements',
      furnished_status: 'Fully-Furnished',
      construction_status: 'Ready to Move',
      possession_date: 'Immediate',
      description: 'Ultra-luxurious 4BHK condominium on the 18th floor offering panoramic Aravalli ridge views. Features VRV central air conditioning, imported marble, wrap-around sunset balcony, concierge lounge, infinity pool, squash courts, and 5-tier security.',
      amenities: JSON.stringify(['Infinity Swimming Pool', 'Clubhouse 50,000 sqft', 'Tennis Court', 'Gymnasium & Spa', 'Central AC', 'High-Speed Elevators', 'EV Charging Station']),
      nearby_landmarks: JSON.stringify(['Rapid Metro Station (2 km)', 'St. Xavier High School (500 m)', 'Cyber City (15 mins)', 'IGI Airport (25 mins)']),
      latitude: 28.4011,
      longitude: 77.0645,
      featured: 1,
      status: 'Available',
      images: [
        { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', caption: 'Luxury High-Rise Tower', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', caption: 'Sky Lounge Living Room', is_primary: 0 },
        { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80', caption: 'Resort-Style Infinity Pool', is_primary: 0 }
      ],
      videos: [
        { video_type: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Sky Suite Tour' }
      ]
    },
    {
      id: crypto.randomUUID(),
      title: 'DLF Phase 2 Freehold Residential Villa Plot 500 Sq Yd',
      slug: 'dlf-phase-2-freehold-residential-villa-plot-500-sq-yd',
      property_type: 'Residential Plot',
      listing_type: 'Sale',
      price: 68000000,
      price_display: '₹ 6.80 Crore',
      location_name: 'Gurgaon',
      city: 'Gurgaon',
      state: 'Haryana',
      address: 'Block K, DLF Phase 2, Near Cyber Hub, Gurgaon',
      area: 4500,
      area_unit: 'sq ft',
      bedrooms: null,
      bathrooms: null,
      floors: null,
      facing: 'North-East',
      road_width: '18 mtr',
      parking: null,
      furnished_status: null,
      construction_status: 'Plot / Land',
      possession_date: 'Immediate',
      description: 'Rare opportunity to acquire a pristine 500 Sq Yards corner plot in prestigious DLF Phase 2. Allowed ground + 4 floors construction with stilt. Walking distance to Cyber Hub and Sikanderpur Metro. Complete freehold title, single owner documentation.',
      amenities: JSON.stringify(['Gated Gated Security', 'Prime Cyber Hub Vicinity', 'Freehold Title', 'Wide Avenues', 'Underground Electric Cables']),
      nearby_landmarks: JSON.stringify(['DLF Cyber Hub (700 m)', 'Sikanderpur Metro (1 km)', 'Ambience Mall (2.5 km)']),
      latitude: 28.4891,
      longitude: 77.0874,
      featured: 1,
      status: 'Reserved',
      images: [
        { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', caption: 'DLF Phase 2 Plot Parcel', is_primary: 1 }
      ],
      videos: []
    },
    {
      id: crypto.randomUUID(),
      title: 'Noida Sector 150 Eco-Park 3BHK Premium Residence',
      slug: 'noida-sector-150-eco-park-3bhk-premium-residence',
      property_type: 'Apartment',
      listing_type: 'Sale',
      price: 16500000,
      price_display: '₹ 1.65 Crore',
      location_name: 'Noida',
      city: 'Noida',
      state: 'Uttar Pradesh',
      address: 'Sector 150, Noida-Greater Noida Expressway, Noida',
      area: 1850,
      area_unit: 'sq ft',
      bedrooms: 3,
      bathrooms: 3,
      floors: 22,
      facing: 'East',
      road_width: '45 mtr',
      parking: '1 Covered',
      furnished_status: 'Semi-Furnished',
      construction_status: 'Ready to Move',
      possession_date: 'Immediate',
      description: 'Green-facing corner 3BHK apartment in low-density Sector 150, known as the greenest sector of NCR with 80% green coverage. 9-hole golf course nearby, international sports facilities, close to upcoming Jewar International Airport.',
      amenities: JSON.stringify(['Clubhouse', 'Swimming Pool', 'Cricket Pitch', 'Solar Lighting', '24x7 Security', 'Piped Gas']),
      nearby_landmarks: JSON.stringify(['Sector 148 Metro (2 km)', 'Jewar Airport (30 mins)', 'Shaheed Bhagat Singh Park (1 km)']),
      latitude: 28.4378,
      longitude: 77.4912,
      featured: 1,
      status: 'Available',
      images: [
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', caption: 'Tower Facing Eco Park', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', caption: 'Open Plan Living Room', is_primary: 0 }
      ],
      videos: []
    },
    {
      id: crypto.randomUUID(),
      title: 'Greater Noida West Freehold Plot 120 Sq Yd',
      slug: 'greater-noida-west-freehold-plot-120-sq-yd',
      property_type: 'Plot',
      listing_type: 'Sale',
      price: 4800000,
      price_display: '₹ 48 Lakh',
      location_name: 'Greater Noida',
      city: 'Greater Noida',
      state: 'Uttar Pradesh',
      address: 'Sector 10, Greater Noida West',
      area: 1080,
      area_unit: 'sq ft',
      bedrooms: null,
      bathrooms: null,
      floors: null,
      facing: 'North',
      road_width: '30 ft',
      parking: null,
      furnished_status: null,
      construction_status: 'Plot / Land',
      possession_date: 'Immediate',
      description: 'Fully gated township plot in Sector 10 Greater Noida West. Immediate registry and mutation. Bank loan available up to 80%. Complete asphalt roads, street lights, overhead water tank, and community hall.',
      amenities: JSON.stringify(['Gated Campus', 'CCTV Security', 'Park', 'Water Connection', 'Sewage Line']),
      nearby_landmarks: JSON.stringify(['Gaur Chowk (6 km)', 'Yatharth Hospital (3 km)', 'Upcoming Metro (1.5 km)']),
      latitude: 28.5912,
      longitude: 77.4521,
      featured: 0,
      status: 'Sold',
      images: [
        { url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80', caption: 'Gated Sector Entrance', is_primary: 1 }
      ],
      videos: []
    },
    {
      id: crypto.randomUUID(),
      title: 'Vasant Vihar Elite 4BHK Luxury Floor with Basement',
      slug: 'vasant-vihar-elite-4bhk-luxury-floor-with-basement',
      property_type: 'House',
      listing_type: 'Sale',
      price: 95000000,
      price_display: '₹ 9.50 Crore',
      location_name: 'Delhi',
      city: 'South Delhi',
      state: 'Delhi',
      address: 'Block E, Vasant Vihar, New Delhi',
      area: 4000,
      area_unit: 'sq ft',
      bedrooms: 4,
      bathrooms: 5,
      floors: 4,
      facing: 'East',
      road_width: '60 ft',
      parking: '3 Stilt Spaces',
      furnished_status: 'Semi-Furnished',
      construction_status: 'Ready to Move',
      possession_date: 'Immediate',
      description: 'Ultra-exclusive residential floor in heart of Vasant Vihar diplomatic zone. Features private basement recreation hall, imported German fittings, central VRF system, private Schindler lift, soundproof double-glazed fenestration, and round-the-clock armed neighborhood patrol.',
      amenities: JSON.stringify(['Private Elevator', 'Basement Lounge', 'Central VRF AC', 'Servant Quarters', 'Gated Colony', '3 Car Parking']),
      nearby_landmarks: JSON.stringify(['Vasant Vihar Club (500 m)', 'Chanakyapuri Embassies (4 km)', 'IGI Airport T3 (15 mins)']),
      latitude: 28.5621,
      longitude: 77.1611,
      featured: 1,
      status: 'Available',
      images: [
        { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', caption: 'Vasant Vihar Luxury Facade', is_primary: 1 },
        { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', caption: 'Grand Living Hall', is_primary: 0 }
      ],
      videos: []
    }
  ];

  // Insert properties
  const insertProp = db.prepare(`
    INSERT OR REPLACE INTO properties (
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
  `);

  const insertImg = db.prepare(`
    INSERT INTO property_images (id, property_id, url, filename, caption, display_order, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVid = db.prepare(`
    INSERT INTO property_videos (id, property_id, video_type, video_url, title, display_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Only seed if properties table is completely empty (preserve user submissions)
  const existingPropCount = db.prepare('SELECT COUNT(*) as c FROM properties').get()?.c || 0;
  if (existingPropCount > 0) {
    console.log(`Database already has ${existingPropCount} properties. Preserving existing data.`);
    return;
  }

  for (const p of properties) {
    const locId = locMap[p.location_name.toLowerCase()] || null;
    insertProp.run(
      p.id, p.title, p.slug, p.property_type, p.listing_type, p.price, p.price_display,
      locId, p.location_name, p.city, p.state, p.address, p.area, p.area_unit,
      p.bedrooms, p.bathrooms, p.floors, p.facing, p.road_width, p.parking, p.furnished_status,
      p.construction_status, p.possession_date, p.description, p.amenities, p.nearby_landmarks,
      p.latitude, p.longitude, p.featured, p.status, Math.floor(Math.random() * 80) + 15, now, now
    );

    let imgOrder = 0;
    for (const img of p.images) {
      insertImg.run(
        crypto.randomUUID(),
        p.id,
        img.url,
        path.basename(img.url.split('?')[0]) || 'property-photo.jpg',
        img.caption,
        imgOrder++,
        img.is_primary,
        now
      );
    }

    let vidOrder = 0;
    for (const vid of p.videos) {
      insertVid.run(
        crypto.randomUUID(),
        p.id,
        vid.video_type,
        vid.video_url,
        vid.title,
        vidOrder++,
        now
      );
    }
  }

  // 5. Seed Enquiries
  const sampleProp = properties[0];
  const enquiries = [
    {
      id: crypto.randomUUID(),
      property_id: sampleProp.id,
      name: 'Rajesh Sharma',
      phone: '+91 98112 34567',
      email: 'rajesh.sharma@example.com',
      message: 'I am interested in this Sector 14 villa. Is the price negotiable and can I schedule a physical inspection this weekend?',
      source: 'property_page',
      status: 'New',
      admin_notes: 'Customer called, looking for self-use.',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      property_id: properties[1].id,
      name: 'Amit Patel',
      phone: '+91 99887 65432',
      email: 'amit.patel@example.com',
      message: 'Looking for freehold plot in Faridabad Sector 85 for immediate house construction. Please share registry details and layout plan.',
      source: 'property_page',
      status: 'Contacted',
      admin_notes: 'Sent layout map via WhatsApp.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      property_id: null,
      name: 'Suman Gupta',
      phone: '+91 97110 54321',
      email: 'suman.g@example.com',
      message: 'Do you have commercial plots or SCO plots available on Mathura Road under ₹ 5 Crore?',
      source: 'contact_page',
      status: 'In Progress',
      admin_notes: 'Discussed Sector 20B commercial plot.',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      updated_at: now
    }
  ];

  const insertEnquiry = db.prepare(`
    INSERT INTO enquiries (id, property_id, name, phone, email, message, source, status, admin_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const enq of enquiries) {
    insertEnquiry.run(
      enq.id, enq.property_id, enq.name, enq.phone, enq.email, enq.message,
      enq.source, enq.status, enq.admin_notes, enq.created_at, enq.updated_at
    );
  }

  // 6. Seed Appointments
  const futureDate1 = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const futureDate2 = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const appointments = [
    {
      id: crypto.randomUUID(),
      property_id: sampleProp.id,
      name: 'Vikram Mehta',
      phone: '+91 98101 23456',
      email: 'vikram.mehta@example.com',
      appointment_type: 'Site Visit',
      preferred_date: futureDate1,
      preferred_time: '11:00 AM',
      message: 'Family site visit for Sector 14 Villa. Need site visit car pickup from Bata Chowk metro if possible.',
      status: 'Pending',
      admin_notes: 'Assign broker agent for site visit.',
      created_at: now,
      updated_at: now
    },
    {
      id: crypto.randomUUID(),
      property_id: properties[4].id,
      name: 'Deepak Chopra',
      phone: '+91 98711 99887',
      email: 'deepak.c@example.com',
      appointment_type: 'Meeting',
      preferred_date: futureDate2,
      preferred_time: '3:30 PM',
      message: 'Office meeting to discuss investment in Golf Course Ext 4BHK apartment.',
      status: 'Confirmed',
      admin_notes: 'Confirmed for office conference room.',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: now
    }
  ];

  const insertAppt = db.prepare(`
    INSERT INTO appointments (id, property_id, name, phone, email, appointment_type, preferred_date, preferred_time, message, status, admin_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const appt of appointments) {
    insertAppt.run(
      appt.id, appt.property_id, appt.name, appt.phone, appt.email, appt.appointment_type,
      appt.preferred_date, appt.preferred_time, appt.message, appt.status, appt.admin_notes,
      appt.created_at, appt.updated_at
    );
  }

  console.log(`Database seeded successfully with ${properties.length} properties, ${locations.length} locations, enquiries, and appointments.`);
}

if (process.argv[1] === import.meta.filename) {
  seedDatabase();
}
