import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function EnquiryModal({ isOpen, onClose, property }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: property
      ? `Hello, I am interested in "${property.title}" (ID: ${property.id.slice(0, 8)}). Please contact me with pricing and documentation details.`
      : 'Hello, I would like more information about your available properties.'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

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
        property_id: property ? property.id : null,
        source: property ? 'property_page' : 'general'
      });

      if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {property ? 'Interested in this Property?' : 'Send Broker an Enquiry'}
            </h3>
            {property && (
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.2rem' }}>
                {property.title}
              </p>
            )}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Enquiry Received!
            </h4>
            <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Thank you for reaching out. Our senior real estate advisor will call you shortly to assist with full property details.
            </p>
            <button className="btn btn-dark btn-sm" onClick={onClose}>
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Message *</label>
              <textarea
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold"
                style={{ flex: 1 }}
              >
                <Send size={16} />
                <span>{loading ? 'Submitting...' : 'Send Enquiry'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
