import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Building2,
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.dashboard.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleEnquiryStatus = async (id, newStatus) => {
    try {
      await api.enquiries.adminUpdateStatus(id, { status: newStatus });
      fetchStats();
    } catch (e) {
      alert('Failed to update enquiry status');
    }
  };

  const handleApptStatus = async (id, newStatus) => {
    try {
      await api.appointments.adminUpdateStatus(id, { status: newStatus });
      fetchStats();
    } catch (e) {
      alert('Failed to update appointment status');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  const { properties, enquiries, appointments, recent_enquiries, recent_appointments, recent_properties } = stats || {};

  return (
    <div>
      {/* Top Welcome Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Operations Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Real-time portfolio status, incoming customer leads, and scheduled property site visits
          </p>
        </div>

        <Link to="/admin/properties/new" className="btn btn-gold btn-sm">
          <PlusCircle size={16} />
          <span>Publish New Property</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-stats-grid">
        {/* Card 1: Properties */}
        <div className="stat-card">
          <div className="stat-card-info">
            <p>Total Properties</p>
            <h3>{properties?.total || 0}</h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{properties?.available || 0} Available</span> |{' '}
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>{properties?.reserved || 0} Reserved</span> |{' '}
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{properties?.sold || 0} Sold</span>
            </div>
          </div>
          <div className="stat-card-icon blue">
            <Building2 size={26} />
          </div>
        </div>

        {/* Card 2: Enquiries */}
        <div className="stat-card">
          <div className="stat-card-info">
            <p>Customer Enquiries</p>
            <h3>{enquiries?.total || 0}</h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              <span style={{ color: '#3b82f6', fontWeight: 600 }}>{enquiries?.new_enquiries || 0} New Leads</span> |{' '}
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>{enquiries?.in_progress || 0} In Progress</span>
            </div>
          </div>
          <div className="stat-card-icon green">
            <MessageSquare size={26} />
          </div>
        </div>

        {/* Card 3: Appointments */}
        <div className="stat-card">
          <div className="stat-card-info">
            <p>Site Visit Bookings</p>
            <h3>{appointments?.total || 0}</h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{appointments?.pending || 0} Pending</span> |{' '}
              <span style={{ color: '#10b981', fontWeight: 600 }}>{appointments?.confirmed || 0} Confirmed</span>
            </div>
          </div>
          <div className="stat-card-icon amber">
            <CalendarCheck size={26} />
          </div>
        </div>
      </div>

      {/* 2-Column Split: Recent Leads & Recent Site Visits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Recent Enquiries */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Inquiries</h3>
            <Link to="/admin/enquiries" style={{ fontSize: '0.85rem', color: '#d49a3f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(!recent_enquiries || recent_enquiries.length === 0) ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No recent enquiries
                    </td>
                  </tr>
                ) : (
                  recent_enquiries.map((enq) => (
                    <tr key={enq.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{enq.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{enq.phone}</div>
                      </td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {enq.property_title || 'General Enquiry'}
                      </td>
                      <td>
                        <span className={`badge-status ${enq.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {enq.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={enq.status}
                          onChange={(e) => handleEnquiryStatus(enq.id, e.target.value)}
                          className="form-select"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Scheduled Site Visits</h3>
            <Link to="/admin/appointments" style={{ fontSize: '0.85rem', color: '#d49a3f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(!recent_appointments || recent_appointments.length === 0) ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No scheduled visits
                    </td>
                  </tr>
                ) : (
                  recent_appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{appt.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{appt.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{appt.preferred_date}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{appt.preferred_time}</div>
                      </td>
                      <td>
                        <span className={`badge-status ${appt.status.toLowerCase()}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {appt.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleApptStatus(appt.id, 'Confirmed')}
                              className="btn btn-sm"
                              style={{ background: '#ecfdf5', color: '#059669', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              title="Confirm Visit"
                            >
                              Confirm
                            </button>
                          )}
                          {appt.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleApptStatus(appt.id, 'Cancelled')}
                              className="btn btn-sm"
                              style={{ background: '#fef2f2', color: '#dc2626', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              title="Cancel Visit"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Properties Section */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Property Listings</h3>
          <Link to="/admin/properties" style={{ fontSize: '0.85rem', color: '#d49a3f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Manage All Properties</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property Title</th>
                <th>Type</th>
                <th>Location</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!recent_properties || recent_properties.length === 0) ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No properties added yet.
                  </td>
                </tr>
              ) : (
                recent_properties.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td>{p.property_type}</td>
                    <td>{p.location_name}</td>
                    <td style={{ fontWeight: 700, color: '#b87d28' }}>{p.price_display}</td>
                    <td>
                      <span className={`badge-status ${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        <Link
                          to={`/admin/properties/edit/${p.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/properties/${p.slug}`}
                          target="_blank"
                          className="btn btn-dark btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
