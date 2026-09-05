import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Save
} from 'lucide-react';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Active View Modal
  const [activeAppt, setActiveAppt] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingNotes, setUpdatingNotes] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.appointments.adminGetAll({
        search,
        status,
        page,
        limit: 15
      });
      if (res.success) {
        setAppointments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.appointments.adminUpdateStatus(id, { status: newStatus });
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
      );
      if (activeAppt && activeAppt.id === id) {
        setActiveAppt(prev => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!activeAppt) return;
    setUpdatingNotes(true);
    try {
      await api.appointments.adminUpdateStatus(activeAppt.id, {
        status: activeAppt.status,
        admin_notes: adminNotes
      });
      setAppointments(prev =>
        prev.map(a => (a.id === activeAppt.id ? { ...a, admin_notes: adminNotes } : a))
      );
      setActiveAppt(prev => ({ ...prev, admin_notes: adminNotes }));
      alert('Appointment notes updated.');
    } catch (e) {
      alert('Failed to update notes');
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment record?')) return;
    try {
      await api.appointments.adminDelete(id);
      fetchAppointments();
      if (activeAppt && activeAppt.id === id) {
        setActiveAppt(null);
      }
    } catch (e) {
      alert('Failed to delete appointment');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Site Visits & Appointments
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Manage scheduled physical property visits, office meetings, and phone consultations
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
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Type</th>
                <th>Requested Date & Time</th>
                <th>Target Property</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading appointments schedule...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{appt.name}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        <a href={`tel:${appt.phone}`} style={{ color: 'inherit' }}>{appt.phone}</a>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
                        {appt.appointment_type}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} color="#d49a3f" />
                        <span>{appt.preferred_date}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} />
                        <span>{appt.preferred_time}</span>
                      </div>
                    </td>

                    <td style={{ maxWidth: '200px' }}>
                      {appt.property_title ? (
                        <span style={{ fontWeight: 600, color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {appt.property_title}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>General Consultation</span>
                      )}
                    </td>

                    <td>
                      <select
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                        className={`badge-status ${appt.status.toLowerCase()}`}
                        style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td>
                      <div className="action-btn-group">
                        {appt.status !== 'Confirmed' && (
                          <button
                            onClick={() => handleStatusChange(appt.id, 'Confirmed')}
                            className="action-icon-btn"
                            style={{ color: '#059669', background: '#ecfdf5' }}
                            title="Confirm Site Visit"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {appt.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleStatusChange(appt.id, 'Cancelled')}
                            className="action-icon-btn"
                            style={{ color: '#dc2626', background: '#fef2f2' }}
                            title="Cancel Site Visit"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => { setActiveAppt(appt); setAdminNotes(appt.admin_notes || ''); }}
                          className="action-icon-btn"
                          title="View Details & Notes"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(appt.id)}
                          className="action-icon-btn delete"
                          title="Delete Appointment"
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
              Showing {appointments.length} of {pagination.total} visits
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

      {/* Appointment Detail & Notes Modal */}
      {activeAppt && (
        <div className="modal-overlay" onClick={() => setActiveAppt(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Site Visit Booking Details</h3>
              <button className="modal-close-btn" onClick={() => setActiveAppt(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{activeAppt.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem' }}>
                  Phone: <a href={`tel:${activeAppt.phone}`} style={{ fontWeight: 600, color: '#b87d28' }}>{activeAppt.phone}</a> | Email: <a href={`mailto:${activeAppt.email}`}>{activeAppt.email}</a>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#0f172a', marginTop: '0.5rem' }}>
                  <strong>Type:</strong> {activeAppt.appointment_type} | <strong>Scheduled:</strong> {activeAppt.preferred_date} at {activeAppt.preferred_time}
                </div>
                {activeAppt.property_title && (
                  <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, marginTop: '0.25rem' }}>
                    Target Property: {activeAppt.property_title}
                  </div>
                )}
              </div>

              {activeAppt.message && (
                <div>
                  <label className="form-label">Client Notes / Requests:</label>
                  <div style={{ background: '#ffffff', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
                    {activeAppt.message}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Appointment Status:</label>
                <select
                  value={activeAppt.status}
                  onChange={(e) => handleStatusChange(activeAppt.id, e.target.value)}
                  className="form-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Visit Logistics Notes:</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record assigned driver, meeting room, site key status, or follow-up feedback..."
                  className="form-textarea"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setActiveAppt(null)}
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
