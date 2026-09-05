import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Middleware
import { requireAuth } from './middleware/auth.js';
import { validateProperty, validatePropertyUpdate } from './middleware/validate.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Route Handlers
import authRoutes from './routes/auth.js';
import propertyRoutes, {
  getAdminProperties,
  getAdminPropertyById,
  createAdminProperty,
  updateAdminProperty,
  updateAdminPropertyStatus,
  deleteAdminProperty
} from './routes/properties.js';
import mediaRoutes from './routes/media.js';
import enquiryRoutes, {
  getAdminEnquiries,
  updateAdminEnquiryStatus,
  deleteAdminEnquiry
} from './routes/enquiries.js';
import appointmentRoutes, {
  getAdminAppointments,
  updateAdminAppointmentStatus,
  deleteAdminAppointment
} from './routes/appointments.js';
import locationRoutes from './routes/locations.js';
import settingsRoutes, { updateAdminSettings } from './routes/settings.js';
import dashboardRoutes from './routes/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with safe size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder for property images with caching
const uploadDir = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir, {
  maxAge: '1d',
  immutable: false
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/appointments', appointmentRoutes);

// Admin Routes (all require authentication)
app.use('/api/admin', dashboardRoutes);
app.use('/api/admin', mediaRoutes);

// Admin Properties
app.get('/api/admin/properties', requireAuth, getAdminProperties);
app.post('/api/admin/properties', requireAuth, validateProperty, createAdminProperty);
app.get('/api/admin/properties/:id', requireAuth, getAdminPropertyById);
app.put('/api/admin/properties/:id', requireAuth, validatePropertyUpdate, updateAdminProperty);
app.patch('/api/admin/properties/:id/status', requireAuth, updateAdminPropertyStatus);
app.delete('/api/admin/properties/:id', requireAuth, deleteAdminProperty);

// Admin Enquiries
app.get('/api/admin/enquiries', requireAuth, getAdminEnquiries);
app.patch('/api/admin/enquiries/:id/status', requireAuth, updateAdminEnquiryStatus);
app.delete('/api/admin/enquiries/:id', requireAuth, deleteAdminEnquiry);

// Admin Appointments
app.get('/api/admin/appointments', requireAuth, getAdminAppointments);
app.patch('/api/admin/appointments/:id/status', requireAuth, updateAdminAppointmentStatus);
app.delete('/api/admin/appointments/:id', requireAuth, deleteAdminAppointment);

// Admin Settings
app.put('/api/admin/settings', requireAuth, updateAdminSettings);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static build in production
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Centralized 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
