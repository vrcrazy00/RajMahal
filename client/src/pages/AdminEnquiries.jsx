import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  Search,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Save
} from 'lucide-react';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Active Enquiry Modal for View / Edit Notes
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingNotes, setUpdatingNotes] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.enquiries.adminGetAll({
        search,
        status,
        page,
        limit: 15
      });
      if (res.success) {
        setEnquiries(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.enquiries.adminUpdateStatus(id, { status: newStatus });
      setEnquiries(prev =>
        prev.map(e => (e.id === id ? { ...e, status: newStatus } : e))
      );
      if (activeEnquiry && activeEnquiry.id === id) {
        setActiveEnquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!activeEnquiry) return;
    setUpdatingNotes(true);
    try {
      await api.enquiries.adminUpdateStatus(activeEnquiry.id, {
        status: activeEnquiry.status,
        admin_notes: adminNotes
      });
      setEnquiries(prev =>
        prev.map(e => (e.id === activeEnquiry.id ? { ...e, admin_notes: adminNotes } : e))
      );
      setActiveEnquiry(prev => ({ ...prev, admin_notes: adminNotes }));
      alert('Notes saved successfully.');
    } catch (e) {
      alert('Failed to save admin notes');
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry record?')) return;
    try {
      await api.enquiries.adminDelete(id);
      fetchEnquiries();
      if (activeEnquiry && activeEnquiry.id === id) {
        setActiveEnquiry(null);
      }
    } catch (e) {
      alert('Failed to delete enquiry');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Customer Enquiries & Leads
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Review inquiries, assign follow-up status, and track buyer communications
        </p>
      </div>

      {/* Filter Card */}
      <div className="admin-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by customer name, phone, email, or property title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="form-select"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Details</th>
                <th>Associated Property</th>
                <th>Status</th>
                <th>Date Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading customer enquiries...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{enq.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Source: {enq.source === 'property_page' ? 'Property Page' : 'Contact Form'}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}>
                        <Phone size={13} color="#d49a3f" />
                        <a href={`tel:${enq.phone}`} style={{ color: 'inherit' }}>{enq.phone}</a>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
                        <Mail size={13} />
                        <a href={`mailto:${enq.email}`} style={{ color: 'inherit' }}>{enq.email}</a>
                      </div>
                    </td>

                    <td style={{ maxWidth: '200px' }}>
                      {enq.property_title ? (
                        <span style={{ fontWeight: 600, color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {enq.property_title}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>General Website Inquiry</span>
                      )}
                    </td>

                    <td>
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className={`badge-status ${enq.status.toLowerCase().replace(/\s+/g, '-')}`}
                        style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(enq.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td>
                      <div className="action-btn-group">
                        <button
                          onClick={() => { setActiveEnquiry(enq); setAdminNotes(enq.admin_notes || ''); }}
                          className="action-icon-btn"
                          title="View Details & Notes"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(enq.id)}
                          className="action-icon-btn delete"
                          title="Delete Enquiry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {enquiries.length} of {pagination.total} leads
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

      {/* Enquiry Detail & Notes Modal */}
      {activeEnquiry && (
        <div className="modal-overlay" onClick={() => setActiveEnquiry(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Enquiry Details</h3>
              <button className="modal-close-btn" onClick={() => setActiveEnquiry(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{activeEnquiry.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem' }}>
                  Phone: <a href={`tel:${activeEnquiry.phone}`} style={{ fontWeight: 600, color: '#b87d28' }}>{activeEnquiry.phone}</a> | Email: <a href={`mailto:${activeEnquiry.email}`}>{activeEnquiry.email}</a>
                </div>
                {activeEnquiry.property_title && (
                  <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, marginTop: '0.5rem' }}>
                    Interested Property: {activeEnquiry.property_title}
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Client Message:</label>
                <div style={{ background: '#ffffff', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
                  {activeEnquiry.message}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lead Status:</label>
                <select
                  value={activeEnquiry.status}
                  onChange={(e) => handleStatusChange(activeEnquiry.id, e.target.value)}
                  className="form-select"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Broker Notes:</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record customer budget, preferred sectors, visit schedule, or financing status..."
                  className="form-textarea"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setActiveEnquiry(null)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
              <button
                type="button"
                disabled={updatingNotes}
                onClick={handleSaveNotes}
                className="btn btn-gold btn-sm"
              >
                <Save size={15} />
                <span>{updatingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
