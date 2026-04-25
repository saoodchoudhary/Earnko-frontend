'use client';

import { ArrowRight, BadgeCheck, Link2, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';

const STATS = [
  { emoji:'₹', bg:'#eff6ff', value:'₹2.4Cr+', label:'Total Paid Out',  trend:'+18%' },
  { emoji:'👥', bg:'#ecfdf5', value:'1.2L+',   label:'Active Users',    trend:'+32%' },
  { emoji:'🔗', bg:'#fefce8', value:'85L+',    label:'Links Generated', trend:'+41%' },
  { emoji:'🏪', bg:'#f0f9ff', value:'200+',    label:'Partner Stores',  trend:'+12%' },
];

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-dot-grid" />
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />

      <div className="site-container">
        <div className="hero-inner">

          {/* Copy */}
          <div className="hero-copy">
            <span className="badge badge-blue">✦ India's #1 Affiliate Earning Platform</span>

            <h1 className="hero-heading">
              Shop. Share. Earn —{' '}
              <span className="gradient-text">real commission</span>{' '}
              with{' '}
              <span className="hero-heading-accent">EarnKo</span>.
            </h1>

            <p className="hero-subtext">
              Generate affiliate links for your favourite stores and earn cashback
              on every purchase your audience makes. Zero investment. Unlimited income.
            </p>

            <div className="hero-cta-group">
              <Link href="/register" className="btn-primary btn-lg">
                Start Earning Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/stores" className="btn-secondary btn-lg">
                Explore Stores
              </Link>
            </div>

          </div>

          {/* Dashboard visual */}
          <div className="hero-visual">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ background:'#eff6ff', borderRadius:8, padding:6 }}>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="dashboard-card-title">Earning Dashboard</span>
                </div>
                <span className="live-badge">
                  <span className="live-dot" /> Live
                </span>
              </div>

              <div className="stats-grid-2x2">
                {STATS.map(s => (
                  <div key={s.label} className="stat-cell">
                    <div className="stat-cell-top">
                      <span className="stat-icon" style={{ background:s.bg }}>
                        <span style={{ fontSize:14 }}>{s.emoji}</span>
                      </span>
                      <span className="stat-trend-up">{s.trend} ↑</span>
                    </div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="link-generator-box">
                <div className="link-generator-header">
                  <Link2 className="link-generator-icon w-4 h-4" />
                  <span className="link-generator-label">Affiliate Link Generator</span>
                </div>
                <div className="link-generator-input">
                  <span className="link-generator-placeholder">Paste any store URL here…</span>
                  <span className="btn-xs">Generate</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}