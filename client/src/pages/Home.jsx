import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import PropertyCard from '../components/PropertyCard';
import SearchFilter from '../components/SearchFilter';
import BookingModal from '../components/BookingModal';
import {
  ShieldCheck,
  Award,
  Car,
  FileCheck,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
  Calendar,
  Compass
} from 'lucide-react';

export default function Home() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.properties.getFeatured();
        if (res.success && res.data) {
          setFeaturedProperties(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleHeroSearch = (filters) => {
    const params = new URLSearchParams();
    if (filters.location && filters.location !== 'All') params.set('location', filters.location);
    if (filters.property_type && filters.property_type !== 'All') params.set('property_type', filters.property_type);
    if (filters.max_price) params.set('max_price', filters.max_price);
    navigate(`/properties?${params.toString()}`);
  };

  const cleanPhone = (settings.phone || '').replace(/[^\d+]/g, '');
  const cleanWhatsapp = (settings.whatsapp || '').replace(/[^\d]/g, '');

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div
          className="hero-bg-overlay"
          style={{ backgroundImage: `url(/uploads/properties/villa-1.jpg)` }}
        />
        <div className="hero-gradient-overlay" />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="hero-content">
            <div className="hero-tag">
              <Sparkles size={15} />
              <span>Verified Delhi NCR Real Estate Brokerage</span>
            </div>

            <h1 className="hero-title">
              Find Your Perfect <span>Plot, Villa & Dream Home</span>
            </h1>

            <p className="hero-subtitle">
              {settings.hero_subtitle || 'Discover verified residential plots, luxury independent villas, modern apartments & commercial land across Faridabad, Gurgaon, Noida, and Delhi NCR with 100% legal title clearance.'}
            </p>
          </div>

          {/* Quick Search Card */}
          <SearchFilter variant="hero" onSearch={handleHeroSearch} />
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="stats-banner">
        <div className="container">
          <div className="stats-grid">
            <div>
              <div className="stat-number">18+</div>
              <div className="stat-label">Years Brokerage Experience</div>
            </div>
            <div>
              <div className="stat-number">450+</div>
              <div className="stat-label">Verified Plots Delivered</div>
            </div>
            <div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Clear Title Documentation</div>
            </div>
            <div>
              <div className="stat-number">₹ 350+ Cr</div>
              <div className="stat-label">Property Value Transacted</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      <section style={{ padding: '6rem 0', background: '#f8fafc' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Curated Collections</span>
            <h2 className="section-title">Prime Featured Properties</h2>
            <p className="section-subtitle">
              Hand-picked residential plots, luxury villas, and high-yield commercial assets ready for immediate acquisition.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              Loading prime properties...
            </div>
          ) : featuredProperties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              No featured listings currently available.
            </div>
          ) : (
            <div className="property-grid">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link to="/properties" className="btn btn-gold btn-lg">
              <span>Explore All Verified Properties</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PROPERTY CATEGORIES */}
      <section style={{ padding: '5rem 0', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Explore by Category</span>
            <h2 className="section-title">Tailored Property Segments</h2>
            <p className="section-subtitle">
              Whether you seek a freehold residential plot for building your home or a luxury move-in villa, we have you covered.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { title: 'Freehold Plots', count: 'Residential & Commercial', type: 'Plot', link: '/properties?property_type=Plot' },
              { title: 'Luxury Independent Villas', count: 'Faridabad & Gurgaon', type: 'Villa', link: '/properties?property_type=Villa' },
              { title: 'Builder Floors', count: 'Greenfield & South Delhi', type: 'Builder Floor', link: '/properties?property_type=Builder+Floor' },
              { title: 'High-Rise Condos', count: 'Noida & Gurgaon Ext', type: 'Apartment', link: '/properties?property_type=Apartment' },
              { title: 'Commercial Land', count: 'Highways & SCO Plots', type: 'Commercial Plot', link: '/properties?property_type=Commercial+Plot' }
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={cat.link}
                className="feature-box"
                style={{ textAlign: 'left', padding: '1.75rem', background: '#f8fafc' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(212, 154, 63, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b87d28', marginBottom: '1rem' }}>
                  <Compass size={20} />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem', color: '#0f172a' }}>
                  {cat.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {cat.count}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Guarantee</span>
            <h2 className="section-title">Why Buy Through Apex Landmark</h2>
            <p className="section-subtitle">
              We protect your real estate investments with thorough legal vetting, honest pricing, and personal support.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-wrap">
                <ShieldCheck size={30} />
              </div>
              <h3 className="feature-title">100% Legal Title Vetting</h3>
              <p className="feature-desc">
                Every plot and building is rigorously verified against DTCP Haryana, HUDA, DDA, and municipal master plans with 30-year non-encumbrance reports.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrap">
                <Car size={30} />
              </div>
              <h3 className="feature-title">Free Site Visit Transport</h3>
              <p className="feature-desc">
                We provide complimentary private chauffeur pickup from nearby metro stations to make your family site visits effortless and comfortable.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrap">
                <Award size={30} />
              </div>
              <h3 className="feature-title">Bank Loan Approved</h3>
              <p className="feature-desc">
                Pre-approved home loans and plot purchase finance available with leading institutions including SBI, HDFC, ICICI, and Bank of Baroda.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrap">
                <FileCheck size={30} />
              </div>
              <h3 className="feature-title">End-to-End Registry Support</h3>
              <p className="feature-desc">
                Our legal executives guide you through stamp duty, sub-registrar office token booking, sale deed execution, and final mutation transfers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Looking for the Ideal Property or Plot?</h2>
            <p className="cta-subtitle">
              Speak directly with our principal broker or schedule an on-site visit today. We are available 7 days a week.
            </p>

            <div className="cta-actions">
              <button
                onClick={() => setBookingModalOpen(true)}
                className="btn btn-gold btn-lg"
              >
                <Calendar size={18} />
                <span>Book Free Site Visit</span>
              </button>

              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello! I would like to schedule a site visit or consultation.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-gold btn-lg"
                >
                  <MessageCircle size={18} />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              {cleanPhone && (
                <a href={`tel:${cleanPhone}`} className="btn btn-dark btn-lg">
                  <Phone size={18} />
                  <span>Call {settings.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Site Visit Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        property={null}
      />
    </div>
  );
}
