import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  MessageSquare,
  CalendarCheck,
  Settings,
  ExternalLink,
  LogOut,
  Shield
} from 'lucide-react';

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      {/* Sidebar Header */}
      <div className="admin-sidebar-header">
        <div className="admin-brand">
          <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
            <Shield size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
              Apex Admin
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#e5b364', fontWeight: 600, letterSpacing: '1px' }}>
              REALTY PORTAL
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="admin-nav">
        <NavLink to="/admin" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/properties" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} end>
          <Building2 size={18} />
          <span>All Properties</span>
        </NavLink>

        <NavLink to="/admin/properties/new" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <PlusCircle size={18} />
          <span>Add Property</span>
        </NavLink>

        <NavLink to="/admin/enquiries" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={18} />
          <span>Enquiries</span>
        </NavLink>

        <NavLink to="/admin/appointments" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <CalendarCheck size={18} />
          <span>Appointments</span>
        </NavLink>

        <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Broker Settings</span>
        </NavLink>

        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '1rem 0' }} />

        <Link to="/" target="_blank" className="admin-nav-item" style={{ color: '#94a3b8' }}>
          <ExternalLink size={17} />
          <span>View Public Site</span>
        </Link>
      </nav>

      {/* Sidebar Footer */}
      <div className="admin-sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.username || 'Broker Admin'}
            </p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.email || 'admin@realestate.com'}
            </p>
          </div>
        </div>

        <button onClick={handleLogout} className="admin-logout-btn">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
