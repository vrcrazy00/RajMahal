import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, MapPin, Home, Tag, IndianRupee, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function SearchFilter({
  initialFilters = {},
  onSearch,
  variant = 'hero' // 'hero' | 'sidebar' | 'inline'
}) {
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    location: initialFilters.location || 'All',
    property_type: initialFilters.property_type || 'All',
    listing_type: initialFilters.listing_type || 'All',
    min_price: initialFilters.min_price || '',
    max_price: initialFilters.max_price || '',
    min_area: initialFilters.min_area || '',
    max_area: initialFilters.max_area || '',
    status: initialFilters.status || 'All',
    sort: initialFilters.sort || 'newest'
  });

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await api.locations.getAll();
        if (res.success && res.data) {
          setLocations(res.data);
        }
      } catch (e) {
        // Fallback default locations
        setLocations([
          { name: 'Faridabad' },
          { name: 'Gurgaon' },
          { name: 'Noida' },
          { name: 'Greater Noida' },
          { name: 'Delhi' }
        ]);
      }
    }
    loadLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(filters);
    }
  };

  const handleReset = () => {
    const cleared = {
      search: '',
      location: 'All',
      property_type: 'All',
      listing_type: 'All',
      min_price: '',
      max_price: '',
      min_area: '',
      max_area: '',
      status: 'All',
      sort: 'newest'
    };
    setFilters(cleared);
    if (onSearch) {
      onSearch(cleared);
    }
  };

  // 1. HERO COMPACT SEARCH CARD
  if (variant === 'hero') {
    return (
      <div className="hero-search-card">
        <form onSubmit={handleSubmit} className="search-form-grid">
          {/* Location Search / Select */}
          <div className="search-field">
            <label className="search-label">
              <MapPin size={14} color="#d49a3f" />
              <span>Location / City</span>
            </label>
            <select
              name="location"
              value={filters.location}
              onChange={handleChange}
              className="search-select"
            >
              <option value="All">All Locations (NCR)</option>
              {locations.map((loc) => (
                <option key={loc.id || loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div className="search-field">
            <label className="search-label">
              <Home size={14} color="#d49a3f" />
              <span>Property Type</span>
            </label>
            <select
              name="property_type"
              value={filters.property_type}
              onChange={handleChange}
              className="search-select"
            >
              <option value="All">All Property Types</option>
              <option value="Plot">Plots & Land</option>
              <option value="Residential Plot">Residential Plot</option>
              <option value="Commercial Plot">Commercial Plot</option>
              <option value="Villa">Luxury Villa</option>
              <option value="House">Independent House</option>
              <option value="Apartment">Apartment / Condominium</option>
              <option value="Builder Floor">Builder Floor</option>
              <option value="Commercial">Commercial Property</option>
            </select>
          </div>

          {/* Budget Preset */}
          <div className="search-field">
            <label className="search-label">
              <IndianRupee size={14} color="#d49a3f" />
              <span>Max Budget</span>
            </label>
            <select
              name="max_price"
              value={filters.max_price}
              onChange={handleChange}
              className="search-select"
            >
              <option value="">Any Budget</option>
              <option value="5000000">Up to ₹ 50 Lakh</option>
              <option value="10000000">Up to ₹ 1 Crore</option>
              <option value="20000000">Up to ₹ 2 Crore</option>
              <option value="50000000">Up to ₹ 5 Crore</option>
              <option value="100000000">Up to ₹ 10 Crore</option>
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className="search-submit-btn">
            <Search size={18} />
            <span>Search</span>
          </button>
        </form>
      </div>
    );
  }

  // 2. SIDEBAR / FULL MULTI-FILTER FORM FOR LISTINGS PAGE
  return (
    <div className="detail-card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="#d49a3f" />
          <span>Filter Properties</span>
        </h3>
        <button
          type="button"
          onClick={handleReset}
          style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Keyword Search */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Search Keyword</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="search"
              placeholder="e.g. Faridabad Sector 14, Plot..."
              value={filters.search}
              onChange={handleChange}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {/* Location */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Location / City</label>
          <select
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="form-select"
          >
            <option value="All">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id || loc.name} value={loc.name}>
                {loc.name} {loc.property_count ? `(${loc.property_count})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Property Type</label>
          <select
            name="property_type"
            value={filters.property_type}
            onChange={handleChange}
            className="form-select"
          >
            <option value="All">All Types</option>
            <option value="Plot">Plot</option>
            <option value="Residential Plot">Residential Plot</option>
            <option value="Commercial Plot">Commercial Plot</option>
            <option value="Villa">Luxury Villa</option>
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Builder Floor">Builder Floor</option>
            <option value="Land">Land</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>

        {/* Price Range (Min & Max) */}
        <div>
          <label className="form-label">Price Range (₹)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input
              type="number"
              name="min_price"
              placeholder="Min Price"
              value={filters.min_price}
              onChange={handleChange}
              className="form-input"
            />
            <input
              type="number"
              name="max_price"
              placeholder="Max Price"
              value={filters.max_price}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Area Range (Min & Max) */}
        <div>
          <label className="form-label">Area (Sq Ft)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input
              type="number"
              name="min_area"
              placeholder="Min Sq Ft"
              value={filters.min_area}
              onChange={handleChange}
              className="form-input"
            />
            <input
              type="number"
              name="max_area"
              placeholder="Max Sq Ft"
              value={filters.max_area}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Listing Status */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Availability Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="form-select"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Coming Soon">Coming Soon</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Sort Order</label>
          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="form-select"
          >
            <option value="newest">Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="area_asc">Area: Low to High</option>
            <option value="area_desc">Area: High to Low</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-gold btn-sm" style={{ flex: 1 }}>
            <Search size={16} />
            <span>Apply Filters</span>
          </button>
          <button type="button" onClick={handleReset} className="btn btn-outline btn-sm">
            <RotateCcw size={14} />
            <span>Clear</span>
          </button>
        </div>
      </form>
    </div>
  );
}
