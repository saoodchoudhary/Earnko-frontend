'use client';

import { ArrowRight, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

const CTA_STATS = [
  { emoji:'₹', bg:'#eff6ff', value:'₹2.4Cr+', label:'Total Paid Out' },
  { emoji:'👥', bg:'#ecfdf5', value:'1.2L+',   label:'Active Earners' },
  { emoji:'🏪', bg:'#fefce8', value:'200+',    label:'Partner Stores' },
];

const PERKS = [
  'No investment required',
  'Instant wallet payouts',
  'Works on any device',
  'Dedicated support team',
];

export default function FinalCTA() {
  return (
    <section className="cta-section">
      <div className="cta-dot-grid" />

      <div className="site-container">
        <div className="cta-inner">

          {/* Stat row */}
          <div className="cta-stats-row">
            {CTA_STATS.map((s, i) => (
              <div key={s.label} style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div className="cta-stat-item">
                  <div style={{
                    width:36, height:36, borderRadius:8, background:s.bg,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                  }}>
                    {s.emoji}
                  </div>
                  <div>
                    <div className="cta-stat-value">{s.value}</div>
                    <div className="cta-stat-label">{s.label}</div>
                  </div>
                </div>
                {i < CTA_STATS.length - 1 && <div className="cta-stat-divider" />}
              </div>
            ))}
          </div>

          <span className="badge badge-blue">
            <BadgeCheck className="w-3 h-3" /> Join 1.2 Lakh Earners
          </span>

          <h2 className="cta-heading">
            Ready to turn every share into{' '}
            <span className="gradient-text">real income?</span>
          </h2>

          <p className="cta-subtext">
            Sign up in 30 seconds and start earning commissions from 200+ top
            Indian brands today — completely free.
          </p>

          <ul className="cta-perks-list">
            {PERKS.map(p => (
              <li key={p} className="cta-perk-item">
                <span style={{ color:'#2563eb', fontWeight:900 }}>✓</span> {p}
              </li>
            ))}
          </ul>

          <div className="cta-button-group">
            <Link href="/register" className="btn-primary btn-lg">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/stores" className="btn-secondary btn-lg">
              Browse Partner Stores
            </Link>
          </div>

          <p className="cta-footnote">
            No credit card needed · Cancel anytime · Free forever
          </p>

        </div>
      </div>
    </section>
  );
}