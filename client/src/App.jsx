import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useSettings } from './context/SettingsContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';

// Public Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProperties from './pages/AdminProperties';
import AdminPropertyForm from './pages/AdminPropertyForm';
import AdminEnquiries from './pages/AdminEnquiries';
import AdminAppointments from './pages/AdminAppointments';
import AdminSettings from './pages/AdminSettings';

// Floating WhatsApp and Call Widget for Public Pages
import { Phone, MessageCircle } from 'lucide-react';

function PublicLayout() {
  const { settings } = useSettings();
  const cleanPhone = (settings.phone || '').replace(/[^\d+]/g, '');
  const cleanWhatsapp = (settings.whatsapp || '').replace(/[^\d]/g, '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />

      {/* Floating Action Buttons */}
      <div className="floating-actions">
        {cleanWhatsapp && (
          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello! I would like to inquire about available properties and plots.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="float-btn whatsapp"
            title="Chat on WhatsApp"
          >
            <MessageCircle size={26} />
          </a>
        )}

        {cleanPhone && (
          <a
            href={`tel:${cleanPhone}`}
            className="float-btn phone"
            title={`Call Broker: ${settings.phone}`}
          >
            <Phone size={24} />
          </a>
        )}
      </div>
    </div>
  );
}

function ProtectedAdminLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ffffff' }}>
        <h2>Loading Admin Session...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Apex Landmark Management System</div>
          <div className="admin-topbar-actions">
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Portal Status: <strong style={{ color: '#10b981' }}>Live</strong>
            </span>
          </div>
        </header>
        <div className="admin-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Facing Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:slug" element={<PropertyDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<ProtectedAdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="properties/new" element={<AdminPropertyForm />} />
        <Route path="properties/edit/:id" element={<AdminPropertyForm />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
