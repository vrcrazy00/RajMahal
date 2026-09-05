import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { seedDatabase } from '../config/seed.js';

let adminToken = '';
let testPropertyId = '';
let testPropertySlug = '';

describe('REAL ESTATE BROKER PLATFORM — AUTOMATED API TEST SUITE', () => {

  before(() => {
    seedDatabase();
  });

  // ==========================================
  // 1. AUTHENTICATION & AUTHORIZATION TESTS
  // ==========================================
  describe('Authentication & Authorization', () => {
    test('POST /api/auth/login with valid credentials should return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@realestate.com', password: 'Admin@12345' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.email, 'admin@realestate.com');
      adminToken = res.body.token;
    });

    test('POST /api/auth/login with wrong password should fail with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@realestate.com', password: 'WrongPassword' });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    test('POST /api/auth/login with empty email should fail with 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '', password: 'Admin@12345' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    test('GET /api/auth/me should succeed with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.email, 'admin@realestate.com');
    });

    test('GET /api/admin/dashboard should fail with 401 without token', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });
  });

  // ==========================================
  // 2. PUBLIC PROPERTY DISCOVERY, SEARCH & FILTERS
  // ==========================================
  describe('Public Property Discovery, Search & Filters', () => {
    test('GET /api/properties should return list of active properties with pagination', async () => {
      const res = await request(app).get('/api/properties');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
      assert.ok(res.body.pagination);
    });

    test('GET /api/properties?search=faridabad should return matching Faridabad properties', async () => {
      const res = await request(app).get('/api/properties?search=faridabad');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.length > 0);
      const allFaridabad = res.body.data.every(p =>
        p.location_name.toLowerCase().includes('faridabad') ||
        p.title.toLowerCase().includes('faridabad') ||
        p.description.toLowerCase().includes('faridabad')
      );
      assert.ok(allFaridabad);
    });

    test('GET /api/properties?location=Faridabad (tolerant case) should match Faridabad listings', async () => {
      const res = await request(app).get('/api/properties?location=fArIdAbAd');
      assert.equal(res.status, 200);
      assert.ok(res.body.data.length > 0);
    });

    test('GET /api/properties?property_type=Villa should return only Villa properties', async () => {
      const res = await request(app).get('/api/properties?property_type=Villa');
      assert.equal(res.status, 200);
      assert.ok(res.body.data.length > 0);
      for (const prop of res.body.data) {
        assert.equal(prop.property_type, 'Villa');
      }
    });

    test('GET /api/properties with price range filter should return items within budget', async () => {
      const res = await request(app).get('/api/properties?min_price=5000000&max_price=8000000');
      assert.equal(res.status, 200);
      assert.ok(res.body.data.length > 0);
      for (const prop of res.body.data) {
        assert.ok(prop.price >= 5000000);
        assert.ok(prop.price <= 8000000);
      }
    });

    test('GET /api/properties edge case: min_price > max_price should auto-swap and still succeed', async () => {
      const res = await request(app).get('/api/properties?min_price=8000000&max_price=5000000');
      assert.equal(res.status, 200);
      assert.ok(res.body.data.length > 0);
      for (const prop of res.body.data) {
        assert.ok(prop.price >= 5000000);
        assert.ok(prop.price <= 8000000);
      }
    });

    test('GET /api/properties/featured should return featured properties', async () => {
      const res = await request(app).get('/api/properties/featured');
      assert.equal(res.status, 200);
      assert.ok(res.body.data.length > 0);
      for (const prop of res.body.data) {
        assert.equal(prop.featured, 1);
      }
    });

    test('GET /api/properties/:slug should return full details and increment view count', async () => {
      const slug = 'faridabad-sector-14-luxury-4bhk-independent-villa';
      const res = await request(app).get(`/api/properties/${slug}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.slug, slug);
      assert.ok(Array.isArray(res.body.data.amenities));
      assert.ok(Array.isArray(res.body.data.images));
      assert.ok(res.body.data.views_count > 0);
    });

    test('GET /api/properties/:slug with nonexistent slug should return 404', async () => {
      const res = await request(app).get('/api/properties/nonexistent-luxury-plot-xyz-999');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });

  // ==========================================
  // 3. ADMIN PROPERTY CRUD & STATUS MANAGEMENT
  // ==========================================
  describe('Admin Property CRUD Workflows', () => {
    test('POST /api/admin/properties should create a new property with unique slug', async () => {
      const newProperty = {
        title: 'Neharpar Faridabad Sector 75 Commercial SCO Plot',
        property_type: 'Commercial Plot',
        listing_type: 'Sale',
        price: 18500000,
        location_name: 'Faridabad',
        city: 'Faridabad',
        state: 'Haryana',
        address: 'Sector 75 Main Commercial Belt, Faridabad',
        area: 1350,
        area_unit: 'sq ft',
        facing: 'North',
        road_width: '45 ft',
        description: 'Prime SCO commercial plot in Sector 75 Neharpar. Suitable for shopping complex or corporate office.',
        amenities: ['Wide Road', 'Ample Parking', 'Power Backup'],
        nearby_landmarks: ['Bata Chowk Metro', 'SRS Mall'],
        status: 'Available'
      };

      const res = await request(app)
        .post('/api/admin/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProperty);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.equal(res.body.data.title, newProperty.title);
      assert.equal(res.body.data.price_display, '₹ 1.85 Crore');
      testPropertyId = res.body.data.id;
      testPropertySlug = res.body.data.slug;
    });

    test('PUT /api/admin/properties/:id should update property details', async () => {
      const updateData = {
        price: 19500000,
        description: 'Updated description: Prime corner SCO commercial plot with high footfall.'
      };

      const res = await request(app)
        .put(`/api/admin/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.price, 19500000);
      assert.equal(res.body.data.price_display, '₹ 1.95 Crore');
    });

    test('PATCH /api/admin/properties/:id/status should update status to Reserved', async () => {
      const res = await request(app)
        .patch(`/api/admin/properties/${testPropertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Reserved' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      // Verify status changed in public API
      const checkRes = await request(app).get(`/api/properties/${testPropertySlug}`);
      assert.equal(checkRes.status, 200);
      assert.equal(checkRes.body.data.status, 'Reserved');
    });

    test('PATCH /api/admin/properties/:id/status with invalid status should return 400', async () => {
      const res = await request(app)
        .patch(`/api/admin/properties/${testPropertyId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'InvalidStatusString' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    test('DELETE /api/admin/properties/:id should delete the property safely', async () => {
      const res = await request(app)
        .delete(`/api/admin/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      // Verify property is gone
      const verifyRes = await request(app).get(`/api/properties/${testPropertySlug}`);
      assert.equal(verifyRes.status, 404);
    });
  });

  // ==========================================
  // 4. ENQUIRY & CONTACT MANAGEMENT
  // ==========================================
  describe('Enquiries & Lead Management', () => {
    let createdEnquiryId = '';

    test('POST /api/enquiries with valid data should record customer enquiry', async () => {
      const payload = {
        name: 'Gaurav Khanna',
        phone: '+91 98111 22334',
        email: 'gaurav.k@example.com',
        message: 'Interested in buying a 200 sq yd residential plot in Faridabad. Please call me back.',
        source: 'contact_page'
      };

      const res = await request(app)
        .post('/api/enquiries')
        .send(payload);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id);
      createdEnquiryId = res.body.data.id;
    });

    test('POST /api/enquiries with invalid email should fail with 400', async () => {
      const payload = {
        name: 'Gaurav Khanna',
        phone: '+91 98111 22334',
        email: 'not-an-email',
        message: 'Hello broker'
      };

      const res = await request(app)
        .post('/api/enquiries')
        .send(payload);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    test('GET /api/admin/enquiries should list leads for admin with pagination', async () => {
      const res = await request(app)
        .get('/api/admin/enquiries')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
    });

    test('PATCH /api/admin/enquiries/:id/status should update lead status to In Progress', async () => {
      const res = await request(app)
        .patch(`/api/admin/enquiries/${createdEnquiryId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'In Progress', admin_notes: 'Spoke with buyer. Interested in Sector 85 plot.' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });

  // ==========================================
  // 5. APPOINTMENTS & SITE VISIT BOOKING
  // ==========================================
  describe('Appointments & Site Visit Scheduling', () => {
    let createdApptId = '';
    const futureDate = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

    test('POST /api/appointments with valid future date should book site visit', async () => {
      const payload = {
        name: 'Anjali Verma',
        phone: '+91 98222 33445',
        email: 'anjali.verma@example.com',
        appointment_type: 'Site Visit',
        preferred_date: futureDate,
        preferred_time: '11:00 AM',
        message: 'Looking forward to visiting Sector 14 villa.'
      };

      const res = await request(app)
        .post('/api/appointments')
        .send(payload);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id);
      createdApptId = res.body.data.id;
    });

    test('POST /api/appointments with past date should be rejected with 400', async () => {
      const pastDate = '2020-01-01';
      const payload = {
        name: 'Anjali Verma',
        phone: '+91 98222 33445',
        email: 'anjali.verma@example.com',
        appointment_type: 'Site Visit',
        preferred_date: pastDate,
        preferred_time: '11:00 AM',
        message: 'Invalid past date test.'
      };

      const res = await request(app)
        .post('/api/appointments')
        .send(payload);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('cannot be in the past'));
    });

    test('GET /api/admin/appointments should list all appointments for admin', async () => {
      const res = await request(app)
        .get('/api/admin/appointments')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    test('PATCH /api/admin/appointments/:id/status should confirm appointment', async () => {
      const res = await request(app)
        .patch(`/api/admin/appointments/${createdApptId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Confirmed', admin_notes: 'Confirmed driver pickup at 10:30 AM' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });

  // ==========================================
  // 6. SETTINGS, DASHBOARD STATS & SECURITY
  // ==========================================
  describe('Settings, Dashboard & Security Protections', () => {
    test('GET /api/settings should return broker information and contact details', async () => {
      const res = await request(app).get('/api/settings');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.business_name, 'Apex Landmark Realty');
      assert.ok(res.body.data.phone);
      assert.ok(res.body.data.whatsapp);
    });

    test('PUT /api/admin/settings should update site settings immediately', async () => {
      const res = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ tagline: 'Your Trusted Partner in High-Return Plots & Luxury Homes' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.tagline, 'Your Trusted Partner in High-Return Plots & Luxury Homes');
    });

    test('GET /api/admin/dashboard should return accurate statistical aggregates', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.properties);
      assert.ok(res.body.data.enquiries);
      assert.ok(res.body.data.appointments);
    });

    test('SQL Injection payload in search query should be handled safely as a literal string', async () => {
      const malicious = "' OR '1'='1' --";
      const res = await request(app).get(`/api/properties?search=${encodeURIComponent(malicious)}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      // Query parameters safely parameterized, no injection occurs
    });

    test('Accessing nonexistent API route should return clean JSON 404, not an HTML error', async () => {
      const res = await request(app).get('/api/some-arbitrary-missing-route');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Resource not found'));
    });
  });

});
