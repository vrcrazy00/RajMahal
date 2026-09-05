import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize2, BedDouble, Bath, ArrowRight } from 'lucide-react';

export default function PropertyCard({ property }) {
  if (!property) return null;

  const statusClass = (property.status || 'available').toLowerCase().replace(/\s+/g, '-');
  const primaryImg = property.primary_image || property.images?.[0]?.url || '/uploads/properties/villa-1.jpg';

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
            e.target.src = '/uploads/properties/villa-1.jpg';
          }}
        />

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
