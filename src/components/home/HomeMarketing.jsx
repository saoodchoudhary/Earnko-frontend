'use client';

import { useEffect, useState } from 'react';
import '../../styles/earnko-home.css';

import FinalCTA        from './FinalCTA';
import Features        from './Features';
import Hero            from './Hero';
import HowItWorks      from './HowItWorks';
import ProductsSection from './ProductsSection';
import Testimonials    from './Testimonials';
import TrustBar        from './TrustBar';

function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) { try { return res.json(); } catch { return null; } }
  return { success: false };
}

export default function HomeMarketing() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const [stores, setStores] = useState([]);

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

  return (
    <div className="home-wrapper">
      <Hero />
      <TrustBar />
      <HowItWorks />
      <ProductsSection base={base} stores={stores} />
      {/* <Features /> */}
      <Testimonials />
      {/* <FinalCTA /> */}
    </div>
  );
}