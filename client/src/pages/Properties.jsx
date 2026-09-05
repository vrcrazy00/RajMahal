import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import SearchFilter from '../components/SearchFilter';
import { Filter, ChevronLeft, ChevronRight, AlertCircle, RotateCcw } from 'lucide-react';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 9, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract filter parameters from URL
  const filters = {
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || 'All',
    property_type: searchParams.get('property_type') || 'All',
    listing_type: searchParams.get('listing_type') || 'All',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_area: searchParams.get('min_area') || '',
    max_area: searchParams.get('max_area') || '',
    status: searchParams.get('status') || 'All',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1'
  };

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.properties.getAll(filters);
      if (res.success) {
        setProperties(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProperties();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProperties]);

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        params.set(key, val);
      }
    });
    params.set('page', '1'); // Reset to page 1 on filter update
    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div style={{ padding: '3rem 0 6rem 0', background: '#f8fafc', minHeight: '80vh' }}>
      <div className="container-wide">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-tag">Verified Listings</span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Properties & Plots for Sale
              </h1>
              <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.25rem' }}>
                Showing <strong>{pagination.total}</strong> verified listings in Delhi NCR
              </p>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              className="btn btn-outline"
              style={{ display: 'none' }}
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Filter Sidebar + Properties Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left Column: Filter Sidebar */}
          <aside>
            <SearchFilter
              variant="sidebar"
              initialFilters={filters}
              onSearch={handleFilterChange}
            />
          </aside>

          {/* Right Column: Listings */}
          <main>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Loading matching listings...
                </div>
                <p>Querying verified database records</p>
              </div>
            ) : properties.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}
              >
                <AlertCircle size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  No Properties Match Your Search Criteria
                </h3>
                <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                  We couldn't find any properties matching your current filter combination. Try clearing filters or broadening your budget range.
                </p>
                <button
                  className="btn btn-gold"
                  onClick={() => setSearchParams(new URLSearchParams())}
                >
                  <RotateCcw size={16} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            ) : (
              <>
                <div className="property-grid" style={{ marginTop: 0 }}>
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '3.5rem'
                    }}
                  >
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`btn btn-sm ${p === pagination.page ? 'btn-dark' : 'btn-outline'}`}
                        style={{ minWidth: '40px' }}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      className="btn btn-outline btn-sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
