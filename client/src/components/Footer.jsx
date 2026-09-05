import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Building2, Phone, Mail, MapPin, Clock, Shield } from 'lucide-react';

export default function Footer() {
  const { settings } = useSettings();
  const cleanPhone = (settings.phone || '').replace(/[^\d+]/g, '');

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: About Broker */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '1.25rem' }}>
              <div className="brand-icon">
                <Building2 size={24} />
              </div>
              <div className="brand-text">
                <span className="brand-title" style={{ fontSize: '1.2rem' }}>{settings.business_name}</span>
                <span className="brand-subtitle">Realty & Advisory</span>
              </div>
            </div>
            <p className="footer-about">
              {settings.about_summary || 'Premier real-estate advisory specializing in verified residential plots, luxury villas, builder floors, and prime commercial plots with 100% clear titles.'}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#e5b364', fontSize: '0.85rem', fontWeight: 600 }}>
              <Shield size={16} /> RERA Registered Professional Brokerage
            </div>
          </div>

          {/* Col 2: Property Types */}
          <div>
            <h4 className="footer-col-title">Property Types</h4>
            <ul className="footer-links">
              <li><Link to="/properties?property_type=Plot" className="footer-link">Residential Plots</Link></li>
              <li><Link to="/properties?property_type=Commercial+Plot" className="footer-link">Commercial Plots</Link></li>
              <li><Link to="/properties?property_type=Villa" className="footer-link">Luxury Villas</Link></li>
              <li><Link to="/properties?property_type=Apartment" className="footer-link">Modern Apartments</Link></li>
              <li><Link to="/properties?property_type=Builder+Floor" className="footer-link">Builder Floors</Link></li>
              <li><Link to="/properties?property_type=Land" className="footer-link">Agricultural & Industrial Land</Link></li>
            </ul>
          </div>

          {/* Col 3: Key Locations */}
          <div>
            <h4 className="footer-col-title">Popular Locations</h4>
            <ul className="footer-links">
              <li><Link to="/properties?location=Faridabad" className="footer-link">Faridabad Properties</Link></li>
              <li><Link to="/properties?location=Gurgaon" className="footer-link">Gurgaon Luxury Homes</Link></li>
              <li><Link to="/properties?location=Noida" className="footer-link">Noida Expressway</Link></li>
              <li><Link to="/properties?location=Greater+Noida" className="footer-link">Greater Noida West</Link></li>
              <li><Link to="/properties?location=Delhi" className="footer-link">South Delhi Estates</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div>
            <h4 className="footer-col-title">Broker Contact</h4>
            <div className="footer-contact-item">
              <MapPin size={18} />
              <span>{settings.address || 'Sector 14, Commercial Complex, Faridabad, Haryana'}</span>
            </div>
            {cleanPhone && (
              <div className="footer-contact-item">
                <Phone size={18} />
                <a href={`tel:${cleanPhone}`} style={{ color: 'inherit' }}>{settings.phone}</a>
              </div>
            )}
            {settings.email && (
              <div className="footer-contact-item">
                <Mail size={18} />
                <a href={`mailto:${settings.email}`} style={{ color: 'inherit' }}>{settings.email}</a>
              </div>
            )}
            <div className="footer-contact-item">
              <Clock size={18} />
              <span>{settings.business_hours || 'Mon - Sat: 9:30 AM - 7:30 PM'}</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>{settings.footer_text || '© 2026 Apex Landmark Realty. All rights reserved.'}</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/admin" style={{ color: 'inherit', fontSize: '0.82rem' }}>Admin Access</Link>
            <Link to="/contact" style={{ color: 'inherit', fontSize: '0.82rem' }}>Site Visit Assistance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
