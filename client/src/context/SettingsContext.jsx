import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    business_name: 'Apex Landmark Realty',
    tagline: 'Premium Plots, Luxury Villas & Commercial Real Estate',
    phone: '+91 98765 43210',
    whatsapp: '+919876543210',
    email: 'contact@apexlandmark.com',
    address: 'Plot No. 42, Sector 14, Commercial Complex, Faridabad, Haryana 121007',
    business_hours: 'Mon - Sat: 9:30 AM - 7:30 PM | Sunday: By Appointment',
    hero_title: 'Find Your Perfect Property in Delhi NCR',
    hero_subtitle: 'Explore verified residential plots, luxury villas, high-rise apartments & commercial land with complete legal documentation.'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.settings.get();
      if (res.success && res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
