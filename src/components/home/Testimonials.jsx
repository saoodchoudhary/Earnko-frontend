'use client';

import { BadgeCheck, Quote, Star, TrendingUp, Users, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const REVIEWS = [
  {
    quote: 'EarnKo completely changed how I think about online shopping. I earned over ₹18,000 in just four months by sharing links with my WhatsApp groups — zero investment required.',
    name: 'Priya Sharma',
    role: 'Lifestyle Blogger',
    city: 'Mumbai',
    initials: 'PS',
    gradient: 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)',
    glowColor: 'rgba(37,99,235,0.22)',
    accentColor: '#2563eb',
    accentBg: '#eff6ff',
    earned: '₹18,200',
    months: '4 months',
    badge: 'Top Earner',
    rating: 5,
    links: '340+',
  },
  {
    quote: 'The dashboard is incredibly polished and every stat updates in real time. I can see exactly which links convert. My passive income jumped by 40% in just two months.',
    name: 'Rahul Verma',
    role: 'Tech YouTuber',
    city: 'Bangalore',
    initials: 'RV',
    gradient: 'linear-gradient(135deg,#0891b2 0%,#0e7490 100%)',
    glowColor: 'rgba(8,145,178,0.22)',
    accentColor: '#0891b2',
    accentBg: '#ecfeff',
    earned: '₹31,500',
    months: '6 months',
    badge: 'Power User',
    rating: 5,
    links: '820+',
  },
  {
    quote: 'I was skeptical at first, but the payouts are instant and fully genuine. I share links on my Telegram channel and earn passive income every single day without spending a rupee.',
    name: 'Anjali Mehta',
    role: 'Home Decor Influencer',
    city: 'Delhi',
    initials: 'AM',
    gradient: 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)',
    glowColor: 'rgba(124,58,237,0.22)',
    accentColor: '#7c3aed',
    accentBg: '#f5f3ff',
    earned: '₹9,800',
    months: '2 months',
    badge: 'Rising Star',
    rating: 5,
    links: '190+',
  },
  {
    quote: 'Managing five stores on one platform with real-time commission tracking — EarnKo is genuinely the best tool I have found for affiliate marketing in India.',
    name: 'Karan Joshi',
    role: 'Digital Marketer',
    city: 'Pune',
    initials: 'KJ',
    gradient: 'linear-gradient(135deg,#059669 0%,#047857 100%)',
    glowColor: 'rgba(5,150,105,0.22)',
    accentColor: '#059669',
    accentBg: '#ecfdf5',
    earned: '₹52,000',
    months: '8 months',
    badge: 'Elite Earner',
    rating: 5,
    links: '1.2K+',
  },
  {
    quote: 'The referral program alone is incredible. My team of 12 people all joined and we collectively earned ₹80,000 last month. Nothing else comes close.',
    name: 'Sneha Pillai',
    role: 'Network Marketer',
    city: 'Chennai',
    initials: 'SP',
    gradient: 'linear-gradient(135deg,#db2777 0%,#be185d 100%)',
    glowColor: 'rgba(219,39,119,0.22)',
    accentColor: '#db2777',
    accentBg: '#fdf2f8',
    earned: '₹80,000',
    months: '5 months',
    badge: 'Team Leader',
    rating: 5,
    links: '2.4K+',
  },
  {
    quote: 'As a college student I needed a flexible income source. EarnKo pays out instantly and the affiliate links work on every platform. I earned ₹6,400 this semester.',
    name: 'Arjun Das',
    role: 'Student Influencer',
    city: 'Kolkata',
    initials: 'AD',
    gradient: 'linear-gradient(135deg,#d97706 0%,#b45309 100%)',
    glowColor: 'rgba(217,119,6,0.22)',
    accentColor: '#d97706',
    accentBg: '#fffbeb',
    earned: '₹6,400',
    months: '3 months',
    badge: 'New Earner',
    rating: 5,
    links: '115+',
  },
];


/* ─────────────────────────────────────────
   STAR RATING
───────────────────────────────────────── */
function StarRating({ count = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[...Array(count)].map((_, i) => (
        <Star key={i} style={{ width: 14, height: 14 }} fill="#f59e0b" stroke="#f59e0b" />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   TESTIMONIAL CARD
───────────────────────────────────────── */
function TestimonialCard({ r, style = {} }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--color-surface)',
        border: `1px solid ${hovered ? r.accentColor + '40' : 'rgba(37,99,235,0.09)'}`,
        borderRadius: 'var(--radius-2xl)',
        padding: '1.75rem 1.6rem 1.5rem',
        overflow: 'hidden',
        boxShadow: hovered
          ? `var(--shadow-lg), 0 0 0 1px ${r.accentColor}18, ${r.glowColor} 0px 20px 48px`
          : 'var(--shadow-sm)',
        transition: 'all 380ms cubic-bezier(0.16,1,0.3,1)',
        cursor: 'default',
        flexShrink: 0,
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow bg */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: `radial-gradient(ellipse at 0% 100%, ${r.glowColor} 0%, transparent 60%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 380ms',
        pointerEvents: 'none',
      }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: r.gradient,
        borderRadius: '99px 99px 0 0',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 320ms',
      }} />

      {/* Badge top-right */}
      <div style={{
        position: 'absolute', top: '1rem', right: '1.1rem',
        padding: '0.22rem 0.65rem',
        borderRadius: 99, background: r.accentBg,
        border: `1px solid ${r.accentColor}30`,
        fontSize: '0.58rem', fontWeight: 800,
        letterSpacing: '0.09em', textTransform: 'uppercase',
        color: r.accentColor,
      }}>
        {r.badge}
      </div>

      {/* Quote icon */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: r.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1rem',
        boxShadow: `0 6px 18px ${r.glowColor}`,
        transform: hovered ? 'rotate(-8deg) scale(1.08)' : 'rotate(0deg) scale(1)',
        transition: 'transform 380ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        <Quote style={{ width: 15, height: 15, color: '#fff' }} />
      </div>

      {/* Stars */}
      <div style={{ marginBottom: '0.85rem' }}>
        <StarRating count={r.rating} />
      </div>

      {/* Quote text */}
      <p style={{
        fontSize: '0.84rem', color: 'var(--color-muted)',
        lineHeight: 1.8, fontStyle: 'italic',
        marginBottom: '1.35rem', maxWidth: '52ch',
      }}>
        "{r.quote}"
      </p>

      {/* Micro stats */}
      <div style={{
        display: 'flex', gap: '0.6rem', marginBottom: '1.35rem', flexWrap: 'wrap',
      }}>
        {[
          { label: 'Earned', value: r.earned },
          { label: 'Active', value: r.months },
          { label: 'Links',  value: r.links  },
        ].map(m => (
          <div key={m.label} style={{
            padding: '0.3rem 0.75rem',
            borderRadius: 99,
            background: r.accentBg,
            border: `1px solid ${r.accentColor}25`,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '0.75rem',
              fontWeight: 900, color: r.accentColor, lineHeight: 1,
            }}>{m.value}</div>
            <div style={{ fontSize: '0.58rem', color: 'var(--color-faint)', marginTop: 2, fontWeight: 700 }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        paddingTop: '1.1rem',
        borderTop: '1px solid rgba(37,99,235,0.08)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: r.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: '0.72rem', color: '#fff', flexShrink: 0,
          boxShadow: `0 4px 12px ${r.glowColor}`,
        }}>
          {r.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '0.83rem', color: 'var(--color-text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{r.name}</p>
          <p style={{
            fontSize: '0.68rem', color: 'var(--color-faint)', marginTop: 2, fontWeight: 600,
          }}>{r.role} · {r.city}</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '0.28rem 0.7rem', borderRadius: 99,
          background: '#ecfdf5', border: '1px solid rgba(5,150,105,0.22)',
          flexShrink: 0,
        }}>
          <BadgeCheck style={{ width: 11, height: 11, color: '#059669' }} />
          <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#065f46' }}>Verified</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   INFINITE TICKER ROW
───────────────────────────────────────── */
function TickerRow({ items, reverse = false, speed = 48 }) {
  const doubled = [...items, ...items];

  return (
    <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%)' }}>
      <div style={{
        display: 'flex',
        gap: '1.25rem',
        width: 'max-content',
        animation: `${reverse ? 'ticker-rtl' : 'ticker-ltr'} ${speed}s linear infinite`,
        paddingBottom: "1.75rem",
        paddingTop: "1.25rem",
      }}>
        {doubled.map((r, i) => (
          <TestimonialCard key={i} r={r} style={{ width: 340 }} />
        ))}
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function Testimonials() {
  const ROW_A = REVIEWS.slice(0, 3).concat(REVIEWS.slice(3, 6));
  const ROW_B = [...REVIEWS].reverse();

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes ticker-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ticker-rtl {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes count-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="ticker-ltr"], [style*="ticker-rtl"] {
            animation: none !important;
          }
        }
      `}</style>

      <section
        className="home-section"
        style={{
          background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)',
          overflow: 'hidden',
          paddingBottom: 'clamp(4rem,9vw,7rem)',
        }}
      >
        {/* Section header */}
        <div className="site-container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.25rem' }}>
              <BadgeCheck style={{ width: 11, height: 11 }} /> Real Earners · Verified
            </span>
            <h2 className="section-title">
              Trusted by{' '}
              <span className="gradient-text">1.2 lakh+ members</span>
            </h2>
            <p className="section-subtitle">
              Real people. Real commissions. Every review is from a verified EarnKo member.
            </p>
          </div>

        </div>

        {/* Ticker Row 1 — left to right */}
        <div style={{paddingLeft: '1rem', paddingRight: '1rem' }}>
          <TickerRow items={ROW_A} reverse={false} speed={52} />
        </div>

        {/* Ticker Row 2 — right to left */}
        <div style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
          <TickerRow items={ROW_B} reverse={true} speed={44} />
        </div>

      </section>
    </>
  );
}