import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize2, BedDouble, Bath, ArrowRight, Play } from 'lucide-react';

export default function PropertyCard({ property }) {
  if (!property) return null;

  const statusClass = (property.status || 'available').toLowerCase().replace(/\s+/g, '-');
  const isPlot = property.property_type && (property.property_type.includes('Plot') || property.property_type.includes('Land'));
  const defaultFallback = isPlot ? '/uploads/properties/plot-1.jpg' : '/uploads/properties/villa-1.jpg';
  const primaryImg = property.primary_image || property.images?.[0]?.url || defaultFallback;
  const isVideoTour = Boolean(property.has_video_thumbnail);

  return (
    <article className="property-card">
      <div className="property-card-image-wrap">
        <img
          src={primaryImg}
          alt={property.title}
          className="property-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultFallback;
          }}
        />

        {isVideoTour && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            zIndex: 3
          }}>
            <Play size={12} fill="#ffffff" />
            <span>Video Walkthrough</span>
          </div>
        )}

        <div className="card-badge-top-left">
          <span className={`badge-status ${statusClass}`}>
            {property.status}
          </span>
        </div>

        <div className="card-badge-top-right">
          {property.property_type}
        </div>
      </div>

      <div className="property-card-body">
        <div className="card-location">
          <MapPin size={14} color="#d49a3f" />
          <span>{property.location_name || property.city}, {property.state}</span>
        </div>

        <h3 className="card-title" title={property.title}>
          <Link to={`/properties/${property.slug}`}>
            {property.title}
          </Link>
        </h3>

        <p className="card-description">
          {property.description}
        </p>

        <div className="card-specs">
          <div className="spec-item" title="Plot / Carpet Area">
            <Maximize2 size={15} color="#64748b" />
            <span>{property.area} {property.area_unit || 'sq ft'}</span>
          </div>

          {property.bedrooms !== null && property.bedrooms !== undefined && property.bedrooms > 0 && (
            <div className="spec-item" title="Bedrooms">
              <BedDouble size={15} color="#64748b" />
              <span>{property.bedrooms} BHK</span>
            </div>
          )}

          {property.bathrooms !== null && property.bathrooms !== undefined && property.bathrooms > 0 && (
            <div className="spec-item" title="Bathrooms">
              <Bath size={15} color="#64748b" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
        </div>

        <div className="card-footer">
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
              Expected Price
            </span>
            <span className="card-price">
              {property.price_display}
            </span>
          </div>

          <Link to={`/properties/${property.slug}`} className="btn btn-dark btn-sm">
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
