import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            background: '#ffffff',
            padding: '2.5rem',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            maxWidth: '500px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 1.25rem auto'
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              The application encountered an unexpected display error. Your data and property changes have been saved.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/admin/properties'; }}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 600,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                Go to Properties
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
