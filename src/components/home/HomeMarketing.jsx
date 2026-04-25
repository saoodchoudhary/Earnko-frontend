'use client';

import { useEffect, useState } from 'react';
import '../../styles/earnko-home.css';

import FinalCTA        from './FinalCTA';
import Features        from './Features';
import HowItWorks      from './HowItWorks';
import Testimonials    from './Testimonials';
import TrustBar        from './TrustBar';
import Hero            from './Hero';  // ← HeroWrapper ki jagah Hero directly
import ProductCarousel from './ProductCarousel';

function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) { try { return res.json(); } catch { return null; } }
  return { success: false };
}

export default function HomeMarketing() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const [stores, setStores]   = useState([]);
  const [stats,  setStats]    = useState(null);   // ← stats state add karo

  // Stores fetch
  useEffect(() => {
    if (!base) return;
    const ctrl = new AbortController();
    fetch(`${base}/api/stores`, { signal: ctrl.signal })
      .then(r  => safeJson(r))
      .then(js => {
        const list =
          Array.isArray(js?.data?.stores) ? js.data.stores :
          Array.isArray(js?.data)         ? js.data         :
          Array.isArray(js)               ? js               : [];
        setStores(list);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [base]);

  // Stats fetch — client side (5 min cache via browser)
  useEffect(() => {
    if (!base) return;
    fetch(`${base}/api/stats/public`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(r => safeJson(r))
      .then(js => {
        if (!js?.success || !js?.data) return;
        const d = js.data;
        setStats([
          { key: 'payout', value: d.payout,  trend: d.payoutTrend },
          { key: 'users',  value: d.users,   trend: d.usersTrend  },
          { key: 'links',  value: d.links,   trend: d.linksTrend  },
          { key: 'stores', value: d.stores,  trend: d.storesTrend },
        ]);
      })
      .catch(() => {});
  }, [base]);

  return (
    <div className="home-wrapper">
      <Hero stats={stats} />  {/* ← stats pass karo, null pe fallback auto */}
      <TrustBar />
      <HowItWorks />
      <ProductCarousel />
      {/* <Features /> */}
      <Testimonials />
      {/* <FinalCTA /> */}
    </div>
  );
}