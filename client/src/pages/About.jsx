import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { ShieldCheck, Award, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function About() {
  const { settings } = useSettings();

  return (
    <div style={{ padding: '4rem 0 7rem 0', background: '#f8fafc' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '3.5rem' }}>
          <span className="section-tag">About Our Brokerage</span>
          <h1 className="section-title">Trusted Real Estate Advisory Since 2008</h1>
          <p className="section-subtitle">
            {settings.about_summary || 'Over 18 years of excellence delivering clear-title residential plots, luxury villas, modern apartments, and prime commercial plots across Delhi NCR.'}
          </p>
        </div>

        {/* Story Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'center', marginBottom: '5rem' }}>
          <div>
            <span style={{ color: '#b87d28', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              Our Story & Mission
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0 1.25rem 0', lineHeight: 1.2 }}>
              Dedicated to Safe, Transparent & High-Growth Land & Property Investments
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              {settings.about_full || 'Apex Landmark Realty is a premier real estate advisory firm dedicated to assisting homebuyers, investors, and developers in acquiring high-growth properties with 100% legal clearance, verified titles, and seamless registry assistance. Our seasoned team guides you from site visits to registry completion.'}
            </p>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              We understand that buying a residential plot or a luxury home is one of the most substantial financial commitments of a family's lifetime. That is why we treat every client relationship as a long-term partnership built on diligence, zero hidden costs, and personal accountability.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/properties" className="btn btn-gold">
                <span>View Current Properties</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Contact Our Senior Broker
              </Link>
            </div>
          </div>

          <div>
            <img
              src="/uploads/properties/villa-1.jpg"
              alt="Apex Landmark Realty Portfolio"
              style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '16px', boxShadow: 'var(--shadow-xl)' }}
            />
          </div>
        </div>

        {/* Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="feature-box" style={{ textAlign: 'left' }}>
            <div className="feature-icon-wrap" style={{ margin: '0 0 1.25rem 0' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 className="feature-title">Verified Title Guarantee</h3>
            <p className="feature-desc">
              Every plot, floor, and villa undergo meticulous 30-year revenue search reports, ensuring zero legal encumbrances, bank mortgage disputes, or registry bottlenecks.
            </p>
          </div>

          <div className="feature-box" style={{ textAlign: 'left' }}>
            <div className="feature-icon-wrap" style={{ margin: '0 0 1.25rem 0' }}>
              <Award size={28} />
            </div>
            <h3 className="feature-title">Direct Owner & Developer Deals</h3>
            <p className="feature-desc">
              We deal directly with original allottees, reputable developers, and verified land owners to secure fair, market-tested valuations without layered middleman markups.
            </p>
          </div>

          <div className="feature-box" style={{ textAlign: 'left' }}>
            <div className="feature-icon-wrap" style={{ margin: '0 0 1.25rem 0' }}>
              <Users size={28} />
            </div>
            <h3 className="feature-title">End-to-End Handholding</h3>
            <p className="feature-desc">
              From the initial private site inspection to bank loan approvals, sub-registrar office appointment, deed documentation, and municipal mutation transfer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
