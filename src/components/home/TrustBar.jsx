'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores } from '@/store/slices/storesSlice';

/* ─────────────────────────────────────────
   CATEGORY ACCENT MAP
   Store model mein `category` field ke
   basis pe auto-assign hoga color + bg
───────────────────────────────────────── */
const ACCENT_MAP = {
  'E-Commerce': { accentColor: '#2563eb', accentBg: '#eff6ff' },
  'Fashion':    { accentColor: '#db2777', accentBg: '#fdf2f8' },
  'Beauty':     { accentColor: '#db2777', accentBg: '#fdf2f8' },
  'Skincare':   { accentColor: '#92400e', accentBg: '#fef3c7' },
  'Health':     { accentColor: '#0891b2', accentBg: '#ecfeff' },
  'Sports':     { accentColor: '#059669', accentBg: '#ecfdf5' },
  'Travel':     { accentColor: '#2563eb', accentBg: '#eff6ff' },
  'Footwear':   { accentColor: '#059669', accentBg: '#ecfdf5' },
  'Audio':      { accentColor: '#0f172a', accentBg: '#f8fafc' },
  'Eyewear':    { accentColor: '#2563eb', accentBg: '#eff6ff' },
  'Shopping':   { accentColor: '#db2777', accentBg: '#fdf2f8' },
  'default':    { accentColor: '#7c3aed', accentBg: '#f5f3ff' },
};

function getAccent(category) {
  return ACCENT_MAP[category] || ACCENT_MAP['default'];
}

/* ─────────────────────────────────────────
   NORMALISE: raw Store doc → BrandPill shape
   Backend fields: name, logo, category, isActive
───────────────────────────────────────── */
function normaliseStore(store) {
  const accent = getAccent(store.category);
  return {
    _id:         store._id,
    name:        store.name,
    /* logo field from backend — could be:
       '/uploads/flipkart-123.png'   (uploaded via admin)
       'https://...'                 (external URL)
       undefined / null              (fallback to initials)
    */
    logoUrl:     store.logo || null,
    category:    store.category || 'Other',
    accentColor: accent.accentColor,
    accentBg:    accent.accentBg,
    commissionRate: store.commissionRate ?? null,
  };
}

/* ─────────────────────────────────────────
   SKELETON PILL — shown while loading
───────────────────────────────────────── */
function SkeletonPill() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.55rem',
      padding: '0.5rem 1rem 0.5rem 0.6rem',
      background: 'var(--color-surface)',
      border: '1.5px solid rgba(37,99,235,0.08)',
      borderRadius: 'var(--radius-full)',
      flexShrink: 0,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'linear-gradient(90deg,var(--color-surface-offset) 25%,var(--color-surface-dynamic,#e5e7eb) 50%,var(--color-surface-offset) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }} />
      <div style={{
        width: 64, height: 10, borderRadius: 4,
        background: 'linear-gradient(90deg,var(--color-surface-offset) 25%,var(--color-surface-dynamic,#e5e7eb) 50%,var(--color-surface-offset) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   BRAND PILL
───────────────────────────────────────── */
function BrandPill({ brand, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  const [hov, setHov]       = useState(false);

  /* Backend URL prefix for relative paths */
  const BACKEND = process.env.NEXT_PUBLIC_API_URL || '';
  const logoSrc = brand.logoUrl
    ? brand.logoUrl.startsWith('http')
      ? brand.logoUrl
      : `${BACKEND}${brand.logoUrl}`
    : null;

  return (
    <button
      type="button"
      onClick={() => onClick?.(brand)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: '0.5rem 1rem 0.5rem 0.6rem',
        background: hov ? brand.accentBg : 'var(--color-surface)',
        border: `1.5px solid ${hov ? brand.accentColor + '50' : 'rgba(37,99,235,0.10)'}`,
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        transition: 'all 280ms cubic-bezier(0.16,1,0.3,1)',
        transform: hov ? 'translateY(-3px) scale(1.04)' : 'none',
        boxShadow: hov
          ? `0 8px 24px ${brand.accentColor}28, 0 2px 6px rgba(0,0,0,0.06)`
          : '0 1px 3px rgba(37,99,235,0.05)',
        flexShrink: 0,
        outline: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={brand.name}
    >
      {/* Logo circle */}
      <div style={{
        width: 28, height: 28,
        borderRadius: '50%',
        background: (!logoSrc || imgErr) ? brand.accentBg : 'transparent',
        border: `1px solid ${brand.accentColor}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
        transition: 'transform 280ms',
        transform: hov ? 'rotate(-6deg) scale(1.08)' : 'none',
      }}>
        {(!logoSrc || imgErr) ? (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.62rem', fontWeight: 900,
            color: brand.accentColor, lineHeight: 1,
          }}>
            {brand.name.slice(0, 2).toUpperCase()}
          </span>
        ) : (
          <img
            src={logoSrc}
            alt={brand.name}
            width={22} height={22}
            loading="lazy"
            style={{ objectFit: 'contain', width: 22, height: 22 }}
            onError={() => setImgErr(true)}
          />
        )}
      </div>

      {/* Name */}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.75rem', fontWeight: 800,
        color: hov ? brand.accentColor : 'var(--color-text)',
        transition: 'color 260ms',
        whiteSpace: 'nowrap',
      }}>
        {brand.name}
      </span>

      {/* Category chip — hover only */}
      <span style={{
        fontSize: '0.58rem', fontWeight: 700,
        color: brand.accentColor,
        background: brand.accentBg,
        padding: '0.12rem 0.45rem',
        borderRadius: 99,
        border: `1px solid ${brand.accentColor}25`,
        opacity: hov ? 1 : 0,
        transform: hov ? 'translateX(0)' : 'translateX(-6px)',
        transition: 'all 240ms cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}>
        {brand.category}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────
   TICKER ROW
───────────────────────────────────────── */
function TickerRow({ items, reverse = false, speed = 42, onBrandClick, loading }) {
  const [paused, setPaused] = useState(false);
  /* Double for seamless loop */
  const doubled = [...items, ...items];

  return (
    <div
      style={{ overflow: 'hidden', position: 'relative' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Edge fade masks */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(90deg,var(--color-bg) 0%,transparent 8%,transparent 92%,var(--color-bg) 100%)',
      }} />

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        width: 'max-content',
        animation: `${reverse ? 'ticker-rtl' : 'ticker-ltr'} ${speed}s linear infinite`,
        animationPlayState: paused ? 'paused' : 'running',
        willChange: 'transform',
        padding: '0.5rem 0',
      }}>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonPill key={i} />)
          : doubled.map((b, i) => (
              <BrandPill key={`${b._id}-${i}`} brand={b} onClick={onBrandClick} />
            ))
        }
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   BRAND DETAIL MODAL
───────────────────────────────────────── */
function BrandModal({ brand, onClose }) {
  if (!brand) return null;

  const BACKEND = process.env.NEXT_PUBLIC_API_URL || '';
  const logoSrc = brand.logoUrl
    ? brand.logoUrl.startsWith('http') ? brand.logoUrl : `${BACKEND}${brand.logoUrl}`
    : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fade-in 180ms ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-2xl,1.25rem)',
          padding: '2rem',
          maxWidth: 320, width: '100%',
          border: `1.5px solid ${brand.accentColor}30`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px ${brand.accentColor}18`,
          animation: 'slide-up 240ms cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Brand header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: brand.accentBg,
            border: `1.5px solid ${brand.accentColor}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {logoSrc ? (
              <img src={logoSrc} alt={brand.name} width={36} height={36}
                style={{ objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900, color: brand.accentColor }}>
                {brand.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.1rem',
              fontWeight: 900, color: 'var(--color-text)',
            }}>{brand.name}</h3>
            <span style={{
              display: 'inline-block', padding: '0.18rem 0.6rem',
              borderRadius: 99, background: brand.accentBg,
              border: `1px solid ${brand.accentColor}25`,
              fontSize: '0.62rem', fontWeight: 800,
              color: brand.accentColor, marginTop: 4,
            }}>
              {brand.category}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0.65rem', marginBottom: '1.25rem',
        }}>
          {[
            {
              label: 'Commission',
              value: brand.commissionRate != null
                ? `Up to ${brand.commissionRate}%`
                : 'Check App',
            },
            { label: 'Payout',      value: 'Instant'   },
            { label: 'Cookie Life', value: '30 days'   },
            { label: 'Status',      value: '🟢 Active'  },
          ].map(s => (
            <div key={s.label} style={{
              padding: '0.65rem 0.75rem',
              background: 'var(--color-surface-2,var(--color-surface))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(37,99,235,0.07)',
            }}>
              <div style={{ fontSize: '0.58rem', color: 'var(--color-faint,#9ca3af)', fontWeight: 700, marginBottom: 3 }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '0.82rem',
                fontWeight: 900, color: brand.accentColor,
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '0.75rem',
            background: `linear-gradient(135deg,${brand.accentColor},${brand.accentColor}cc)`,
            color: '#fff', border: 'none',
            borderRadius: 'var(--radius-xl,1rem)',
            fontFamily: 'var(--font-display)', fontSize: '0.82rem',
            fontWeight: 900, cursor: 'pointer',
            boxShadow: `0 6px 20px ${brand.accentColor}38`,
            transition: 'opacity 200ms',
          }}
        >
          Generate Link for {brand.name} →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT — TrustBar
───────────────────────────────────────── */
const ALL_CATEGORIES = ['All', 'E-Commerce', 'Fashion', 'Beauty', 'Health', 'Sports', 'Travel', 'Skincare', 'Audio', 'Eyewear', 'Footwear', 'Shopping'];

export default function TrustBar() {
  const dispatch   = useDispatch();
  const rawStores  = useSelector(s => s.stores.items);
  const loading    = useSelector(s => s.stores.loading);

  const [activeCat, setActiveCat]       = useState('All');
  const [selectedBrand, setSelectedBrand] = useState(null);

  /* Fetch on mount — only if not already loaded */
  useEffect(() => {
    if (!rawStores.length) dispatch(fetchStores());
  }, [dispatch, rawStores.length]);

  /* Normalise raw Store docs → display shape */
  const brands = useMemo(() => rawStores.map(normaliseStore), [rawStores]);

  /* Derive unique categories present in data */
  const presentCategories = useMemo(() => {
    const cats = new Set(brands.map(b => b.category));
    return ['All', ...ALL_CATEGORIES.slice(1).filter(c => cats.has(c))];
  }, [brands]);

  /* Filter by active category */
  const filtered = useMemo(() =>
    activeCat === 'All' ? brands : brands.filter(b => b.category === activeCat),
  [brands, activeCat]);

  /* Split into two ticker rows */
  const mid    = Math.ceil(filtered.length / 2);
  const rowA   = filtered.slice(0, mid);
  const rowB   = filtered.slice(mid);
  /* Fallback: if filter gives too few, use all brands for both rows */
  const rowAFull = rowA.length < 4 ? brands.slice(0, Math.ceil(brands.length / 2)) : rowA;
  const rowBFull = rowB.length < 4 ? brands.slice(Math.ceil(brands.length / 2))    : rowB;

  return (
    <>
      <style>{`
        @keyframes ticker-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ticker-rtl {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dot-pulse {
          0%,100%{box-shadow:0 0 0 3px rgba(5,150,105,0.22)}
          50%    {box-shadow:0 0 0 6px rgba(5,150,105,0.08)}
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="ticker-ltr"], [style*="ticker-rtl"] {
            animation-play-state: paused !important;
          }
        }
      `}</style>

      <section style={{
        background: 'linear-gradient(180deg,var(--color-bg) 0%,var(--color-surface) 100%)',
        borderTop:    '1px solid rgba(37,99,235,0.07)',
        borderBottom: '1px solid rgba(37,99,235,0.07)',
        paddingBlock: 'clamp(2.5rem,5vw,4rem)',
        overflow: 'hidden',
      }}>
        <div className="site-container">

          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
            marginBottom: '1.75rem',
          }}>
            <div>
              <p style={{
                fontSize: '0.6rem', fontWeight: 900,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--color-faint,#9ca3af)', marginBottom: '0.3rem',
              }}>
                ✦ Earning Partners
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.1rem,2.5vw,1.4rem)',
                fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.2,
              }}>
                {loading ? (
                  <span>Loading Brands…</span>
                ) : (
                  <>{brands.length}+ Trusted{' '}
                    <span style={{
                      background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Partner Brands
                    </span>
                  </>
                )}
              </h2>
            </div>

            {/* Live pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.45rem 1rem',
              background: 'var(--color-surface)',
              border: '1px solid rgba(37,99,235,0.12)',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#059669',
                boxShadow: '0 0 0 3px rgba(5,150,105,0.22)',
                animation: 'dot-pulse 2s ease-in-out infinite',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text)' }}>
                Live Commissions Active
              </span>
            </div>
          </div>

          {/* ── Category filter pills ── */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {presentCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                type="button"
                style={{
                  padding: '0.32rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${activeCat === cat ? '#2563eb' : 'rgba(37,99,235,0.12)'}`,
                  background: activeCat === cat
                    ? 'linear-gradient(135deg,#2563eb,#1d4ed8)'
                    : 'var(--color-surface)',
                  color: activeCat === cat ? '#fff' : 'var(--color-muted,#6b7280)',
                  fontSize: '0.7rem', fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 240ms cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: activeCat === cat ? '0 4px 14px rgba(37,99,235,0.30)' : 'none',
                  transform: activeCat === cat ? 'scale(1.04)' : 'scale(1)',
                  outline: 'none',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ticker rows ── */}
        <div style={{ marginBottom: '0.75rem' }}>
          <TickerRow
            items={rowAFull} reverse={false} speed={46}
            onBrandClick={setSelectedBrand} loading={loading}
          />
        </div>
        <TickerRow
          items={rowBFull} reverse={true} speed={38}
          onBrandClick={setSelectedBrand} loading={loading}
        />

        {/* ── Bottom trust strip ── */}
        <div className="site-container">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', marginTop: '1.75rem', flexWrap: 'wrap',
          }}>
            {[
              { dot: '#059669', text: 'Commissions verified by network' },
              { dot: '#2563eb', text: 'Real-time tracking on all brands' },
              { dot: '#7c3aed', text: '₹2.4Cr+ paid out this year'       },
            ].map(p => (
              <span key={p.text} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                border: '1px solid rgba(37,99,235,0.09)',
                fontSize: '0.68rem', fontWeight: 700,
                color: 'var(--color-muted,#6b7280)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.dot, flexShrink: 0 }} />
                {p.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand detail modal ── */}
      <BrandModal brand={selectedBrand} onClose={() => setSelectedBrand(null)} />
    </>
  );
}