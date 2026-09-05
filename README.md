# Apex Landmark Realty — Real Estate Broker Platform

A full-stack, production-ready real-estate brokerage web platform engineered for real estate brokers selling residential plots, commercial land, luxury villas, builder floors, and apartments.

---

## 1. Technology Stack

- **Public Frontend**: React 18 + Vite with a bespoke Vanilla CSS design system (luxury slate & warm gold palette, responsive from 320px mobile to 4K displays, zero external CSS framework bloat).
- **Admin Dashboard**: React SPA with real-time KPI statistics, property inventory CRUD, media manager, enquiry lead tracker, and site visit booking calendar.
- **Backend API**: Node.js v22 with Express.js RESTful API architecture.
- **Database Engine**: Relational SQLite database with WAL (Write-Ahead Logging) mode and foreign keys enabled via Node 22's native `node:sqlite`.
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` salted password hashing.
- **Media Management**: Multer multipart upload pipeline with strict MIME validation (`image/jpeg`, `image/png`, `image/webp`), 5MB size limits, UUID filenames, primary image selector, image reordering, and video tour support.
- **Testing**: Node.js native test runner (`node:test`) + Supertest covering 51 automated unit, integration, and 19 end-to-end user journeys.

---

## 2. Project Architecture

```
d:/Desktop/new123/
├── server/
│   ├── config/
│   │   ├── database.js          # SQLite connection, WAL mode, foreign keys
│   │   ├── migrate.js           # DDL schema migrations, tables, and indexes
│   │   └── seed.js              # Realistic Delhi NCR real estate listings & admin
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication & session verification
│   │   ├── upload.js            # Multer image uploader with MIME & size checks
│   │   ├── validate.js          # Input validation schemas & sanitizers
│   │   └── errorHandler.js      # Centralized error and 404 handler
│   ├── routes/
│   │   ├── auth.js              # /api/auth/login, /api/auth/me, /api/auth/logout
│   │   ├── properties.js        # /api/properties & /api/admin/properties (CRUD)
│   │   ├── media.js             # /api/admin/properties/:id/images & videos
│   │   ├── enquiries.js         # /api/enquiries & /api/admin/enquiries
│   │   ├── appointments.js      # /api/appointments & /api/admin/appointments
│   │   ├── locations.js         # /api/locations (Delhi NCR sectors & cities)
│   │   ├── settings.js          # /api/settings & /api/admin/settings
│   │   └── dashboard.js         # /api/admin/dashboard KPI aggregates
│   ├── uploads/
│   │   └── properties/          # Stored property photographs
│   ├── tests/
│   │   ├── api.test.js          # 32 Auth, CRUD, Search, Filter & Security tests
│   │   └── e2e_journeys.test.js # 19 complete End-to-End user journeys
│   ├── app.js                   # Express application setup
│   └── server.js                # Production server listener (port 5000)
├── client/
│   ├── index.html               # Semantic HTML5, Google Fonts, SEO tags
│   ├── vite.config.js           # Vite development server with API proxy
│   ├── src/
│   │   ├── css/                 # Vanilla CSS design system
│   │   │   ├── index.css        # Core design tokens, CSS variables, reset
│   │   │   ├── public.css       # Public layout, hero, cards, footer
│   │   │   ├── property.css     # Details page, specs, lightbox gallery, video
│   │   │   ├── admin.css        # Admin portal, dashboard, tables, forms
│   │   │   └── responsive.css   # Breakpoints (320px, 375px, 768px, 1024px)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx       # Header with mobile drawer & WhatsApp CTA
│   │   │   ├── Footer.jsx       # Broker info, dynamic links, business hours
│   │   │   ├── PropertyCard.jsx # Listing card with badges, price format
│   │   │   ├── SearchFilter.jsx # Hero search bar & advanced filter sidebar
│   │   │   ├── Gallery.jsx      # Image gallery with lightbox & thumbnails
│   │   │   ├── VideoPlayer.jsx  # Responsive video player (YouTube/direct)
│   │   │   ├── EnquiryModal.jsx # "Interested in this property" modal
│   │   │   ├── BookingModal.jsx # Site visit & appointment scheduler
│   │   │   └── AdminSidebar.jsx # Admin navigation & badge counts
│   │   ├── pages/               # Application views
│   │   ├── services/api.js      # Centralized API client service
│   │   ├── context/             # AuthContext & SettingsContext providers
│   │   ├── App.jsx              # Routes & layouts orchestration
│   │   └── main.jsx             # React entry point
├── .env.example                 # Production environment variables guide
├── package.json                 # Monorepo developer scripts
└── README.md                    # Project documentation
```

---

## 3. Database Schema

The SQLite relational database maintains the following primary entities:

- `users`: Administrator accounts with bcrypt password hashes and roles (`admin`, `agent`).
- `locations`: Active cities and districts (Faridabad, Gurgaon, Noida, Greater Noida, Delhi) with collation `NOCASE` and featured flags.
- `properties`: Complete property listings with unique SEO slugs, price, area, dimensions, facing, road width, construction status, amenities JSON, landmarks JSON, status (`Available`, `Reserved`, `Sold`, `Coming Soon`, `Draft`), and view counters.
- `property_images`: Multiple uploaded property photographs with file paths, captions, display ordering, and primary thumbnail flags (`is_primary`).
- `property_videos`: Virtual video tour embeds (YouTube, Vimeo, or direct upload) associated with properties.
- `enquiries`: Customer leads submitted via the general contact form or property-specific inquiries, tracked through statuses (`New`, `Contacted`, `In Progress`, `Closed`) with internal broker notes.
- `appointments`: Scheduled on-site property inspections, office meetings, and phone consultations, validated against past dates and managed through statuses (`Pending`, `Confirmed`, `Cancelled`, `Completed`).
- `settings`: Key-value store for broker branding, phone, WhatsApp number, office address, operating hours, hero titles, and about texts.

---

## 4. Getting Started & Local Installation

### Prerequisites
- Node.js v22+ (tested on v22.16.0)
- npm v10+

### 1. Clone & Install Dependencies
```bash
# From the project root
npm run postinstall
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Seed Database with Realistic Delhi NCR Listings
```bash
npm run seed
```
This initializes the database schema, creates the default administrator (`admin@realestate.com` / `Admin@12345`), sets up initial broker settings, and loads realistic verified properties across Faridabad, Gurgaon, Noida, and Delhi.

### 4. Run the Full-Stack Application
```bash
npm start
```
The application will boot on **http://localhost:5000**, serving both the REST API and the responsive client application.

Alternatively, for active frontend development with hot-module reloading:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend Vite Dev Server
npm run client
```

---

## 5. Automated Testing

Run the automated test suite covering all 51 test cases:
```bash
npm test
```

### Test Coverage Highlights:
1. **Authentication & Authorization**: Valid credentials login, password rejection, token verification, route protection.
2. **Property Discovery & Search**: Case-insensitive substring search (e.g. "Faridabad"), type filtering ("Plot", "Villa"), budget range filters, auto-swap normalization for `min_price > max_price`.
3. **Admin Property CRUD**: Creation with automatic unique SEO slug generation, partial updates, instant status transitions, deletion with cascade media file cleanup.
4. **Lead & Appointment Workflows**: Customer enquiry submissions, phone/email validation, property-link associations, appointment booking with past-date rejection, and admin status updates.
5. **Security & Edge Cases**: Parameterized queries preventing SQL injection, upload constraints rejecting invalid file formats, and clean JSON 404 responses.
6. **19 End-to-End User Journeys**: Full workflow validation from visitor homepage arrival to lead submission and administrator confirmation.

---

## 6. Admin Credentials & First-Time Access

- **Admin Portal URL**: `http://localhost:5000/admin`
- **Login URL**: `http://localhost:5000/admin/login`
- **Default Email**: `admin@realestate.com`
- **Default Password**: `Admin@12345`

---

## 7. Public User & Broker Capabilities

### Public Website Capabilities:
- **Responsive Navigation**: Sticky luxury header with direct phone and WhatsApp CTA buttons, plus a mobile navigation drawer.
- **Hero Search Engine**: Instant property filtering by Location, Property Type, and Maximum Budget.
- **Dedicated Listings**: Multi-facet filter sidebar (Keywords, Location, Type, Min/Max Price, Min/Max Area, Status, Sort Order) with active listing counts and pagination.
- **Interactive Media Gallery**: High-resolution image gallery with thumbnail strip and full-screen lightbox modal with keyboard navigation.
- **Video Walkthrough**: Responsive 16:9 embedded video tours for properties.
- **Property Specifications**: Custom dimension cards displaying plot area, front road width, facing direction, construction status, and furnishing level.
- **Lead Capture**: "Interested in this property" enquiry form and on-site visit scheduler with date and time selection.
- **Direct Broker Contact**: One-click WhatsApp chat pre-populated with property details and direct phone dialing.

### Admin Dashboard Capabilities:
- **Live KPI Overview**: Real-time summary cards for total listings, available plots, reserved properties, sold properties, incoming leads, and pending site visits.
- **Inventory Management**: Create, edit, and safely delete listings with rich multi-field forms and instant status toggling (`Available`, `Reserved`, `Sold`, `Coming Soon`, `Draft`).
- **Media Pipeline**: Multi-file drag-and-drop image uploader, primary image selector (gold star badge), image reordering controls, and video URL linker.
- **Lead Management Pipeline**: Searchable and filterable enquiries table with instant status transitions (`New` -> `Contacted` -> `In Progress` -> `Closed`) and internal broker notes.
- **Site Visit Scheduling**: Manage appointment requests, confirm or cancel visits, and track customer pickup requests.
- **Live Settings Configuration**: Dynamically update company name, phone, WhatsApp number, office address, and business hours without code modifications.

---

## 8. Production Deployment

1. **Build Client Bundle**:
   ```bash
   npm run build
   ```
2. **Start Production Process**:
   ```bash
   NODE_ENV=production PORT=5000 npm start
   ```
   For process management in production environments, use PM2:
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name "apex-realestate"
   pm2 save
   ```

---

## 9. Security & Error Handling

- **SQL Injection Prevention**: 100% of database queries use parameterized prepared statements (`db.prepare('...').run(params)`).
- **Authentication**: Salted password hashing with `bcryptjs` (10 rounds) and expiring JWT session tokens.
- **File Upload Protection**: Whitelisted MIME types (`image/jpeg`, `image/png`, `image/webp`), 5MB maximum file size limit, and randomized UUID filenames.
- **Error Shielding**: Centralized error middleware prevents stack traces or sensitive internal paths from leaking to client browsers.
- **Validation**: Strict server-side validation on all phone numbers, email addresses, dates, and currency amounts.
