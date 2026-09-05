import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { Save, CheckCircle2, AlertCircle, Building2, Phone, Mail, MapPin } from 'lucide-react';

export default function AdminSettings() {
  const { refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    business_name: '',
    tagline: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    business_hours: '',
    hero_title: '',
    hero_subtitle: '',
    about_summary: '',
    about_full: '',
    footer_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.settings.get();
        if (res.success && res.data) {
          setFormData(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        setError('Failed to load current settings.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await api.settings.adminUpdate(formData);
      if (res.success) {
        setSuccess('Settings updated successfully! Changes are live across the public site.');
        await refreshSettings();
      }
    } catch (err) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Broker & Site Configuration
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Configure company contact details, WhatsApp direct messaging, office hours, and public website banners
        </p>
      </div>

      {success && (
        <div style={{ padding: '1rem', background: '#ecfdf5', color: '#059669', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Brand Identity */}
        <div className="admin-form-section">
          <h2 className="admin-section-title">Company Identity</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Broker Business Name *</label>
              <input
                type="text"
                name="business_name"
                required
                value={formData.business_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Contact Information & WhatsApp */}
        <div className="admin-form-section">
          <h2 className="admin-section-title">Direct Contact Channels</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Official Phone Number *</label>
              <input
                type="text"
                name="phone"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Contact Number *</label>
              <input
                type="text"
                name="whatsapp"
                required
                placeholder="+919876543210"
                value={formData.whatsapp}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email Address *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="contact@apexlandmark.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Office Physical Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Operating Hours</label>
              <input
                type="text"
                name="business_hours"
                value={formData.business_hours}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Homepage Hero Texts */}
        <div className="admin-form-section">
          <h2 className="admin-section-title">Homepage Hero & About Information</h2>

          <div className="form-group">
            <label className="form-label">Hero Banner Headline</label>
            <input
              type="text"
              name="hero_title"
              value={formData.hero_title}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Subtitle</label>
            <textarea
              name="hero_subtitle"
              rows={2}
              value={formData.hero_subtitle}
              onChange={handleChange}
              className="form-textarea"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">About Us Summary (Shown in Footer & Highlights)</label>
            <textarea
              name="about_summary"
              rows={3}
              value={formData.about_summary}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full About Us Text (Shown on About Page)</label>
            <textarea
              name="about_full"
              rows={4}
              value={formData.about_full}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Footer Copyright Notice</label>
            <input
              type="text"
              name="footer_text"
              value={formData.footer_text}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4rem' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-gold btn-lg"
          >
            <Save size={18} />
            <span>{saving ? 'Updating Settings...' : 'Save & Publish Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
