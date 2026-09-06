import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [propertyType, setPropertyType] = useState('All');
  const [page, setPage] = useState(1);

  // Deletion state
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.properties.adminGetAll({
        search,
        status,
        property_type: propertyType,
        page,
        limit: 12
      });

      if (res.success) {
        setProperties(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch admin properties:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, propertyType, page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.properties.adminUpdateStatus(id, newStatus);
      if (res.success) {
        setProperties(prev =>
          prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update property status');
    }
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await api.properties.adminDelete(propertyToDelete.id);
      if (res.success) {
        setPropertyToDelete(null);
        fetchProperties();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete property');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Property Inventory
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Manage plots, independent houses, luxury villas, and commercial real estate
          </p>
        </div>

        <Link to="/admin/properties/new" className="btn btn-gold">
          <PlusCircle size={18} />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by title, location, or city..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="form-select"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
              <option value="Coming Soon">Coming Soon</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={propertyType}
              onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
              className="form-select"
            >
              <option value="All">All Types</option>
              <option value="Plot">Plot</option>
              <option value="Residential Plot">Residential Plot</option>
              <option value="Commercial Plot">Commercial Plot</option>
              <option value="Villa">Villa</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Builder Floor">Builder Floor</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Location</th>
                <th>Price</th>
                <th>Area</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading property listings...
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No matching properties found.
                  </td>
                </tr>
              ) : (
                properties.map((prop) => {
                  const isPlot = prop.property_type && (prop.property_type.includes('Plot') || prop.property_type.includes('Land'));
                  const defaultFallback = isPlot ? '/uploads/properties/plot-1.jpg' : '/uploads/properties/villa-1.jpg';
                  const thumb = prop.primary_image || prop.images?.[0]?.url || defaultFallback;
                  return (
                    <tr key={prop.id}>
                      <td>
                        <div className="table-prop-cell">
                          <img
                            src={thumb}
                            alt={prop.title}
                            className="table-thumb"
                            onError={(e) => { e.target.onerror = null; e.target.src = defaultFallback; }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prop.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              ID: {prop.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>{prop.property_type}</td>
                      <td>{prop.location_name}</td>
                      <td style={{ fontWeight: 700, color: '#b87d28' }}>{prop.price_display}</td>
                      <td>{prop.area} {prop.area_unit || 'sq ft'}</td>

                      <td>
                        <select
                          value={prop.status}
                          onChange={(e) => handleStatusChange(prop.id, e.target.value)}
                          className={`badge-status ${prop.status.toLowerCase().replace(/\s+/g, '-')}`}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                          <option value="Coming Soon">Coming Soon</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </td>

                      <td>
                        <div className="action-btn-group">
                          <Link
                            to={`/properties/${prop.slug}`}
                            target="_blank"
                            className="action-icon-btn"
                            title="View on Public Site"
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            to={`/admin/properties/edit/${prop.id}`}
                            className="action-icon-btn"
                            title="Edit Property"
                          >
                            <Edit2 size={16} />
                          </Link>

                          <button
                            onClick={() => setPropertyToDelete(prop)}
                            className="action-icon-btn delete"
                            title="Delete Property"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {properties.length} of {pagination.total} listings
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn btn-outline btn-sm"
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="btn btn-outline btn-sm"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="modal-overlay" onClick={() => setPropertyToDelete(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Confirm Deletion
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                Are you sure you want to delete <strong>"{propertyToDelete.title}"</strong>? All associated media and gallery files will be permanently deleted.
              </p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={confirmDelete}
                  className="btn btn-sm"
                  style={{ flex: 1, background: '#dc2626', color: '#ffffff' }}
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete Property'}
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyToDelete(null)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
