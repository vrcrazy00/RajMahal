import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { seedDatabase } from '../config/seed.js';

describe('REAL ESTATE BROKER PLATFORM — 19 E2E USER JOURNEYS SUITE', () => {
  let adminToken = '';
  let selectedPropertySlug = '';
  let selectedPropertyId = '';
  let contactEnquiryId = '';
  let propertyEnquiryId = '';
  let appointmentBookingId = '';
  let createdPropertyId = '';

  before(() => {
    seedDatabase();
  });

  // =========================================================================
  // JOURNEY 1: VISITOR OPENS HOMEPAGE
  // =========================================================================
  test('Journey 1: Visitor opens homepage and loads settings & featured properties', async () => {
    const settingsRes = await request(app).get('/api/settings');
    assert.equal(settingsRes.status, 200);
    assert.equal(settingsRes.body.data.business_name, 'Apex Landmark Realty');

    const featuredRes = await request(app).get('/api/properties/featured');
    assert.equal(featuredRes.status, 200);
    assert.ok(featuredRes.body.data.length > 0);
    assert.equal(featuredRes.body.data[0].featured, 1);
  });

  // =========================================================================
  // JOURNEY 2: VISITOR SEARCHES FARIDABAD
  // =========================================================================
  test('Journey 2: Visitor searches for "Faridabad" properties', async () => {
    const res = await request(app).get('/api/properties?search=Faridabad');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    const hasFaridabad = res.body.data.some(p =>
      p.location_name.toLowerCase().includes('faridabad')
    );
    assert.ok(hasFaridabad);
    selectedPropertySlug = res.body.data[0].slug;
    selectedPropertyId = res.body.data[0].id;
  });

  // =========================================================================
  // JOURNEY 3: VISITOR FILTERS PROPERTIES BY PRICE
  // =========================================================================
  test('Journey 3: Visitor filters properties by price range', async () => {
    const minP = 5000000;
    const maxP = 15000000;
    const res = await request(app).get(`/api/properties?min_price=${minP}&max_price=${maxP}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    for (const prop of res.body.data) {
      assert.ok(prop.price >= minP && prop.price <= maxP);
    }
  });

  // =========================================================================
  // JOURNEY 4: VISITOR OPENS PROPERTY DETAILS
  // =========================================================================
  test('Journey 4: Visitor opens property details page', async () => {
    const res = await request(app).get(`/api/properties/${selectedPropertySlug}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.slug, selectedPropertySlug);
    assert.ok(res.body.data.title);
    assert.ok(res.body.data.price_display);
  });

  // =========================================================================
  // JOURNEY 5: VISITOR VIEWS PROPERTY GALLERY
  // =========================================================================
  test('Journey 5: Visitor views property image gallery and primary image', async () => {
    const res = await request(app).get(`/api/properties/${selectedPropertySlug}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.images));
    assert.ok(res.body.data.images.length > 0);
    assert.ok(res.body.data.primary_image);
  });

  // =========================================================================
  // JOURNEY 6: VISITOR WATCHES PROPERTY VIDEO
  // =========================================================================
  test('Journey 6: Visitor accesses property video walkthrough container', async () => {
    // Faridabad Sector 14 villa has seeded video tour
    const res = await request(app).get('/api/properties/faridabad-sector-14-luxury-4bhk-independent-villa');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.videos));
    assert.ok(res.body.data.videos.length > 0);
    assert.equal(res.body.data.videos[0].video_type, 'youtube');
  });

  // =========================================================================
  // JOURNEY 7: VISITOR SUBMITS CONTACT FORM
  // =========================================================================
  test('Journey 7: Visitor submits contact form from Contact page', async () => {
    const res = await request(app).post('/api/enquiries').send({
      name: 'Sunil Kumar',
      phone: '+91 98765 11223',
      email: 'sunil.kumar@example.com',
      message: 'Looking for a residential plot near Delhi-Mumbai expressway in Greater Faridabad.',
      source: 'contact_page'
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    contactEnquiryId = res.body.data.id;
  });

  // =========================================================================
  // JOURNEY 8: VISITOR SUBMITS PROPERTY ENQUIRY
  // =========================================================================
  test('Journey 8: Visitor submits property-specific enquiry', async () => {
    const res = await request(app).post('/api/enquiries').send({
      name: 'Meenakshi Iyer',
      phone: '+91 98450 98765',
      email: 'meenakshi@example.com',
      message: 'Interested in this villa. What are the registry stamp duty rates in Haryana?',
      property_id: selectedPropertyId,
      source: 'property_page'
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    propertyEnquiryId = res.body.data.id;
  });

  // =========================================================================
  // JOURNEY 9: VISITOR REQUESTS APPOINTMENT / SITE VISIT
  // =========================================================================
  test('Journey 9: Visitor requests site visit with future date', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
    const res = await request(app).post('/api/appointments').send({
      name: 'Harish Bansal',
      phone: '+91 99100 44556',
      email: 'harish.b@example.com',
      property_id: selectedPropertyId,
      appointment_type: 'Site Visit',
      preferred_date: futureDate,
      preferred_time: '11:30 AM',
      message: 'Please arrange private cab pickup from Badarpur border.'
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    appointmentBookingId = res.body.data.id;
  });

  // =========================================================================
  // JOURNEY 10: ADMIN LOGS IN
  // =========================================================================
  test('Journey 10: Admin logs in with credentials and receives token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@realestate.com',
      password: 'Admin@12345'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    adminToken = res.body.token;
  });

  // =========================================================================
  // JOURNEY 11: ADMIN CREATES PROPERTY
  // =========================================================================
  test('Journey 11: Admin creates a new property', async () => {
    const res = await request(app)
      .post('/api/admin/properties')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Faridabad Sector 77 Freehold Residential Villa Plot',
        property_type: 'Residential Plot',
        listing_type: 'Sale',
        price: 8200000,
        location_name: 'Faridabad',
        city: 'Faridabad',
        state: 'Haryana',
        address: 'Sector 77, KLJ Platinum Heights Vicinity',
        area: 2250,
        area_unit: 'sq ft',
        facing: 'East',
        road_width: '40 ft',
        construction_status: 'Plot / Land',
        possession_date: 'Immediate Registry',
        description: 'Prime east-facing plot in gated development with wide road frontage and water connections.',
        amenities: ['24x7 Security', 'Gated Community', 'Wide Roads', 'Clear Title'],
        status: 'Draft'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    createdPropertyId = res.body.data.id;
  });

  // =========================================================================
  // JOURNEY 12: ADMIN UPLOADS IMAGES
  // =========================================================================
  test('Journey 12: Admin attaches images to the created property', async () => {
    // Simulate image upload using a sample buffer
    const res = await request(app)
      .post(`/api/admin/properties/${createdPropertyId}/images`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('images', Buffer.from('fake-image-bytes-jpg'), 'plot-elevation.jpg');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length > 0);
  });

  // =========================================================================
  // JOURNEY 13: ADMIN PUBLISHES PROPERTY
  // =========================================================================
  test('Journey 13: Admin publishes property from Draft to Available', async () => {
    const res = await request(app)
      .patch(`/api/admin/properties/${createdPropertyId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Available' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify it is now visible publicly
    const publicCheck = await request(app).get(`/api/properties/${res.body.slug || createdPropertyId}`);
    assert.equal(publicCheck.status, 200);
    assert.equal(publicCheck.body.data.status, 'Available');
  });

  // =========================================================================
  // JOURNEY 14: ADMIN EDITS PROPERTY
  // =========================================================================
  test('Journey 14: Admin edits property details', async () => {
    const res = await request(app)
      .put(`/api/admin/properties/${createdPropertyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        price: 8500000,
        description: 'Updated: Prime east-facing plot with 45 ft wide road and immediate bank loan clearance.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.price, 8500000);
    assert.equal(res.body.data.price_display, '₹ 85 Lakh');
  });

  // =========================================================================
  // JOURNEY 15: ADMIN CHANGES PROPERTY STATUS
  // =========================================================================
  test('Journey 15: Admin transitions status to Reserved', async () => {
    const res = await request(app)
      .patch(`/api/admin/properties/${createdPropertyId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Reserved' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // =========================================================================
  // JOURNEY 16: ADMIN VIEWS ENQUIRIES
  // =========================================================================
  test('Journey 16: Admin views enquiry submissions list', async () => {
    const res = await request(app)
      .get('/api/admin/enquiries')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const foundContact = res.body.data.find(e => e.id === contactEnquiryId);
    assert.ok(foundContact);
    assert.equal(foundContact.name, 'Sunil Kumar');
  });

  // =========================================================================
  // JOURNEY 17: ADMIN UPDATES ENQUIRY STATUS
  // =========================================================================
  test('Journey 17: Admin updates enquiry status to Contacted', async () => {
    const res = await request(app)
      .patch(`/api/admin/enquiries/${contactEnquiryId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Contacted', admin_notes: 'Spoke on call. Shared plot map on WhatsApp.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // =========================================================================
  // JOURNEY 18: ADMIN VIEWS APPOINTMENTS
  // =========================================================================
  test('Journey 18: Admin views appointment requests', async () => {
    const res = await request(app)
      .get('/api/admin/appointments')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const foundAppt = res.body.data.find(a => a.id === appointmentBookingId);
    assert.ok(foundAppt);
    assert.equal(foundAppt.name, 'Harish Bansal');
  });

  // =========================================================================
  // JOURNEY 19: ADMIN CONFIRMS APPOINTMENT
  // =========================================================================
  test('Journey 19: Admin confirms appointment booking', async () => {
    const res = await request(app)
      .patch(`/api/admin/appointments/${appointmentBookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Confirmed', admin_notes: 'Assigned executive driver for metro pickup.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

});
