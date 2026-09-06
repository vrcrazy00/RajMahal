import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import Gallery from '../components/Gallery';
import VideoPlayer from '../components/VideoPlayer';
import EnquiryModal from '../components/EnquiryModal';
import BookingModal from '../components/BookingModal';
import {
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  Compass,
  Building,
  Car,
  Calendar,
  CheckCircle,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Share2,
  AlertTriangle,
  Send
} from 'lucide-react';

export default function PropertyDetail() {
  const { slug } = useParams();
  const { settings } = useSettings();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Inline Quick Enquiry state
  const [quickForm, setQuickForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      setError('');
      try {
        const res = await api.properties.getBySlug(slug);
        if (res.success && res.data) {
          setProperty(res.data);
          // Set page title for SEO
          document.title = `${res.data.title} | ${settings.business_name || 'Apex Landmark Realty'}`;
        } else {
          setError('Property not found.');
        }
      } catch (err) {
        setError(err.message || 'Property not found or is currently not available.');
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, settings.business_name]);

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setQuickSubmitting(true);
    try {
      await api.enquiries.submit({
        name: quickForm.name,
        phone: quickForm.phone,
        email: quickForm.email,
        message: quickForm.message || `Inquiry for ${property?.title}`,
        property_id: property?.id,
        source: 'property_page_quick'
      });
      setQuickSuccess(true);
    } catch (err) {
      alert(err.message || 'Error submitting enquiry');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center', color: '#64748b' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Loading Property Details...
        </h2>
        <p>Retrieving high-resolution media and verified property records</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <AlertTriangle size={56} color="#ef4444" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Property Listing Unavailable
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
            {error || 'The property you are looking for has been sold, removed, or is awaiting publication.'}
          </p>
          <Link to="/properties" className="btn btn-gold">
            Browse All Available Properties
          </Link>
        </div>
      </div>
    );
  }

  const cleanPhone = (settings.phone || '').replace(/[^\d+]/g, '');
  const cleanWhatsapp = (settings.whatsapp || '').replace(/[^\d]/g, '');
  const statusClass = (property.status || 'available').toLowerCase().replace(/\s+/g, '-');
  const isSold = property.status === 'Sold';
  const isReserved = property.status === 'Reserved';

  const whatsappMessage = encodeURIComponent(
    `Hello! I am interested in the property: "${property.title}" (${property.price_display}) listed at ${window.location.href}. Please share title documents and site inspection details.`
  );

  return (
    <div className="property-detail-page">
      <div className="container-wide">
        {/* Breadcrumbs */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/properties">Properties</Link>
          <span>/</span>
          <Link to={`/properties?location=${property.location_name}`}>{property.location_name}</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{property.title}</span>
        </nav>

        {/* Detail Header */}
        <div className="detail-header">
          <div className="detail-title-group">
            <div className="detail-badges">
              <span className={`badge-status ${statusClass}`}>
                {property.status}
              </span>
              <span className="detail-type-badge">
                {property.property_type}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                Listing ID: {property.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <h1 className="detail-title">{property.title}</h1>

            <div className="detail-location">
              <MapPin size={18} color="#d49a3f" />
              <span>{property.address ? `${property.address}, ` : ''}{property.location_name || property.city}, {property.state}</span>
            </div>
          </div>

          <div className="detail-price-wrap">
            <span className="detail-price-label">Expected Price</span>
            <div className="detail-price">{property.price_display}</div>
            <button
              onClick={handleShare}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '0.75rem', gap: '0.35rem' }}
            >
              <Share2 size={14} />
              <span>Share Property</span>
            </button>
          </div>
        </div>

        {/* Sold / Reserved Alert Notice */}
        {isSold && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b91c1c' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 600 }}>
              This property has been SOLD. Browse our other listings or contact us for similar properties in {property.location_name}.
            </span>
          </div>
        )}

        {isReserved && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b45309' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: 600 }}>
              This property is currently RESERVED under token agreement. You may submit an inquiry to join the waitlist.
            </span>
          </div>
        )}

        {/* Main Content Layout Grid */}
        <div className="detail-layout-grid">
          {/* LEFT COLUMN: Gallery, Specs, Amenities, Description, Video */}
          <div>
            {/* Image Gallery with Lightbox */}
            <Gallery images={property.images} title={property.title} fallbackImage={property.primary_image} />

            {/* Technical Specifications */}
            <div className="detail-card">
              <h3 className="detail-card-title">
                <Building size={20} />
                <span>Property Specifications & Dimensions</span>
              </h3>

              <div className="specs-grid">
                <div className="spec-box">
                  <span className="spec-box-label">Plot / Carpet Area</span>
                  <span className="spec-box-val">{property.area} {property.area_unit || 'sq ft'}</span>
                </div>

                {property.property_type && (
                  <div className="spec-box">
                    <span className="spec-box-label">Property Category</span>
                    <span className="spec-box-val">{property.property_type}</span>
                  </div>
                )}

                {property.facing && (
                  <div className="spec-box">
                    <span className="spec-box-label">Facing Direction</span>
                    <span className="spec-box-val">{property.facing}</span>
                  </div>
                )}

                {property.road_width && (
                  <div className="spec-box">
                    <span className="spec-box-label">Front Access Road</span>
                    <span className="spec-box-val">{property.road_width}</span>
                  </div>
                )}

                {property.construction_status && (
                  <div className="spec-box">
                    <span className="spec-box-label">Construction Status</span>
                    <span className="spec-box-val">{property.construction_status}</span>
                  </div>
                )}

                {property.possession_date && (
                  <div className="spec-box">
                    <span className="spec-box-label">Possession Timeline</span>
                    <span className="spec-box-val">{property.possession_date}</span>
                  </div>
                )}

                {property.bedrooms !== null && property.bedrooms !== undefined && property.bedrooms > 0 && (
                  <div className="spec-box">
                    <span className="spec-box-label">Bedrooms</span>
                    <span className="spec-box-val">{property.bedrooms} BHK</span>
                  </div>
                )}

                {property.bathrooms !== null && property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <div className="spec-box">
                    <span className="spec-box-label">Bathrooms</span>
                    <span className="spec-box-val">{property.bathrooms}</span>
                  </div>
                )}

                {property.floors !== null && property.floors !== undefined && property.floors > 0 && (
                  <div className="spec-box">
                    <span className="spec-box-label">Total Floors</span>
                    <span className="spec-box-val">{property.floors}</span>
                  </div>
                )}

                {property.parking && (
                  <div className="spec-box">
                    <span className="spec-box-label">Parking Facilities</span>
                    <span className="spec-box-val">{property.parking}</span>
                  </div>
                )}

                {property.furnished_status && (
                  <div className="spec-box">
                    <span className="spec-box-label">Furnishing Level</span>
                    <span className="spec-box-val">{property.furnished_status}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="detail-card">
              <h3 className="detail-card-title">
                <span>About this Property</span>
              </h3>
              <div className="property-description-text">
                {property.description}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="detail-card">
                <h3 className="detail-card-title">
                  <CheckCircle size={20} />
                  <span>Key Features & Infrastructure</span>
                </h3>
                <div className="amenities-pills">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="amenity-pill">
                      <CheckCircle size={15} />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Tour (If available) */}
            {property.videos && property.videos.length > 0 && (
              <div className="detail-card">
                <h3 className="detail-card-title">
                  <span>Video Walkthrough</span>
                </h3>
                {property.videos.map((vid) => (
                  <VideoPlayer
                    key={vid.id}
                    videoUrl={vid.video_url}
                    videoType={vid.video_type}
                    title={vid.title || property.title}
                  />
                ))}
              </div>
            )}

            {/* Nearby Landmarks */}
            {property.nearby_landmarks && property.nearby_landmarks.length > 0 && (
              <div className="detail-card">
                <h3 className="detail-card-title">
                  <MapPin size={20} />
                  <span>Connectivity & Landmarks</span>
                </h3>
                <ul className="landmarks-list">
                  {property.nearby_landmarks.map((mark, idx) => (
                    <li key={idx} className="landmark-item">
                      <Compass size={16} />
                      <span>{mark}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Broker Action Card & Quick Enquiry */}
          <div>
            <div className="sticky-sidebar">
              <div className="broker-card">
                <div className="broker-header">
                  <div className="broker-avatar">
                    AL
                  </div>
                  <div className="broker-info">
                    <h4>{settings.business_name || 'Apex Landmark Realty'}</h4>
                    <p>Verified Property Advisory</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      <ShieldCheck size={14} /> Title Verified
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="broker-actions-grid">
                  {cleanPhone && (
                    <a href={`tel:${cleanPhone}`} className="btn-call-action">
                      <Phone size={18} />
                      <span>Call Broker: {settings.phone}</span>
                    </a>
                  )}

                  {cleanWhatsapp && (
                    <a
                      href={`https://wa.me/${cleanWhatsapp}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-action"
                    >
                      <MessageCircle size={18} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}

                  <button
                    disabled={isSold}
                    onClick={() => setBookingModalOpen(true)}
                    className="btn-visit-action"
                  >
                    <Calendar size={18} />
                    <span>{isSold ? 'Property Sold' : 'Schedule Site Visit'}</span>
                  </button>
                </div>

                {/* Quick Inline Enquiry Form */}
                <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
                    Quick Inquiry
                  </h4>

                  {quickSuccess ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0', color: '#10b981', fontWeight: 600 }}>
                      <CheckCircle size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                      <p>Inquiry received! We will contact you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleQuickSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={quickForm.name}
                        onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                        className="form-input"
                        style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Your Phone Number"
                        value={quickForm.phone}
                        onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                        className="form-input"
                        style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                      />
                      <input
                        type="email"
                        required
                        placeholder="Your Email"
                        value={quickForm.email}
                        onChange={(e) => setQuickForm({ ...quickForm, email: e.target.value })}
                        className="form-input"
                        style={{ padding: '0.65rem 0.85rem', fontSize: '0.9rem' }}
                      />
                      <button
                        type="submit"
                        disabled={quickSubmitting || isSold}
                        className="btn btn-dark btn-sm"
                        style={{ width: '100%', marginTop: '0.25rem' }}
                      >
                        <Send size={15} />
                        <span>{quickSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        property={property}
      />

      {/* Site Visit Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        property={property}
      />
    </div>
  );
}
