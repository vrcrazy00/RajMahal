import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

export default function Contact() {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const cleanPhone = (settings.phone || '').replace(/[^\d+]/g, '');
  const cleanWhatsapp = (settings.whatsapp || '').replace(/[^\d]/g, '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.enquiries.submit({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        source: 'contact_page'
      });

      if (res.success) {
        setSuccess(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit contact form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 0 7rem 0', background: '#f8fafc' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '3.5rem' }}>
          <span className="section-tag">Get in Touch</span>
          <h1 className="section-title">Contact Our Advisory Team</h1>
          <p className="section-subtitle">
            Have questions about a plot, villa, or commercial property? Connect with our senior real estate consultants for immediate assistance.
          </p>
        </div>

        {/* 2-Column Grid: Form + Office Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'start' }}>
          {/* Form */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
              Send Us a Message
            </h3>

            {success && (
              <div style={{ padding: '1.25rem', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '10px', color: '#065f46', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={24} color="#10b981" />
                <div>
                  <h4 style={{ fontWeight: 700 }}>Message Received!</h4>
                  <p style={{ fontSize: '0.9rem' }}>Our team will get back to you within 2 business hours.</p>
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '10px', color: '#b91c1c', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message / Requirement Details *</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Describe the type of property, desired location, budget range, or any specific query..."
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Send size={18} />
                <span>{loading ? 'Submitting Message...' : 'Submit Contact Message'}</span>
              </button>
            </form>
          </div>

          {/* Broker Office Details & Quick CTAs */}
          <div>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                Principal Broker Office
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212, 154, 63, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b87d28', flexShrink: 0 }}>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Office Address</h4>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, marginTop: '0.2rem' }}>
                      {settings.address || 'Plot No. 42, Sector 14, Commercial Complex, Faridabad, Haryana 121007'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212, 154, 63, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b87d28', flexShrink: 0 }}>
                    <Phone size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Phone Direct</h4>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                      <a href={`tel:${cleanPhone}`} style={{ color: '#0f172a', fontWeight: 600 }}>{settings.phone}</a>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212, 154, 63, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b87d28', flexShrink: 0 }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Email Address</h4>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                      <a href={`mailto:${settings.email}`} style={{ color: '#0f172a', fontWeight: 600 }}>{settings.email}</a>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212, 154, 63, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b87d28', flexShrink: 0 }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Operating Hours</h4>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                      {settings.business_hours || 'Mon - Sat: 9:30 AM - 7:30 PM | Sunday: By Appointment'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Action Card */}
            <div style={{ background: '#0f172a', borderRadius: '16px', padding: '2rem', color: '#ffffff' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Need Immediate Assistance?
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Chat directly with our senior plot specialist on WhatsApp or give us a quick call.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cleanWhatsapp && (
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello! I would like to inquire about available plots and properties.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-action"
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp Direct Chat</span>
                  </a>
                )}

                {cleanPhone && (
                  <a href={`tel:${cleanPhone}`} className="btn-call-action" style={{ background: '#1e293b' }}>
                    <Phone size={18} />
                    <span>Call Broker Now</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
