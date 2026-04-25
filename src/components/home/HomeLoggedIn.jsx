'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, ShoppingBag, Sparkles, Zap } from 'lucide-react';

import BannerCarousel from './BannerCarousel';
import BottomBar from './BottomBar';
import ProductCard from './ProductCard';
import ProductCarousel from './ProductCarousel';
import StoreStrip from './StoreStrip';

function normalizeList(obj) {
  const candidate =
    (obj?.data?.items && Array.isArray(obj.data.items) && obj.data.items) ||
    (obj?.data && Array.isArray(obj.data) && obj.data) ||
    (obj?.items && Array.isArray(obj.items) && obj.items) ||
    (Array.isArray(obj) && obj) || [];
  return Array.isArray(candidate) ? candidate : [];
}

async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) { try { return await res.json(); } catch { return null; } }
  return { success: false, message: await res.text().catch(() => '') };
}

export default function HomeLoggedIn() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const [stores, setStores]                   = useState([]);
  const [storeId, setStoreId]                 = useState('');
  const [products, setProducts]               = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadStores() {
      try {
        if (!base) return;
        const res = await fetch(`${base}/api/stores`, { signal: controller.signal });
        const js  = await safeJson(res);
        if (!res.ok) { setStores([]); return; }
        const list = Array.isArray(js?.data?.stores) ? js.data.stores : normalizeList(js);
        setStores(list);
      } catch { setStores([]); }
    }
    loadStores();
    return () => controller.abort();
  }, [base]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        if (!base) return;
        setLoadingProducts(true);
        const params = new URLSearchParams();
        if (storeId) params.set('storeId', storeId);
        params.set('sort', 'popular');
        params.set('limit', '12');
        const res = await fetch(`${base}/api/products?${params}`, { signal: controller.signal });
        const js  = await safeJson(res);
        if (!res.ok) { setProducts([]); return; }
        setProducts(normalizeList(js));
      } catch { setProducts([]); }
      finally { setLoadingProducts(false); }
    }
    loadProducts();
    return () => controller.abort();
  }, [base, storeId]);

  const list = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  return (
    <main className="min-h-screen mt-[60px] pb-28 md:pb-10" style={{ background: '#f4f6fb' }}>

      {/* ── Subtle ambient glow (fixed) ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-[-80px] w-72 h-72 bg-blue-400/8 rounded-full blur-3xl" />
        <div className="absolute top-40 right-[-120px] w-96 h-96 bg-cyan-400/8 rounded-full blur-3xl" />
      </div>

      {/* ── Banner carousel ── */}
      <div>
        <BannerCarousel />
      </div>

      {/* ── Store strip ── */}
      <StoreStrip base={base} stores={stores} title="Featured Partners" />

      {/* ═════════════════════════════════════════════
          PRODUCTS SECTION
      ═════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 max-w-5xl pt-6 pb-10">

        {/* ── Section header — compact, not a big hero ── */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#eff6ff,#e0f2fe)', border: '1px solid #bfdbfe' }}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] md:text-xl font-extrabold text-gray-900 leading-tight">
              Top Selling Flash Deals
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Curated deals · Swipe on mobile · Copy link to earn commission
            </p>
          </div>
        </div>

        {/* ── Filter row ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 p-3.5 rounded-2xl bg-white border border-gray-200"
          style={{ boxShadow: '0 1px 6px rgba(37,99,235,0.05)' }}
        >
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-gray-900">Filter by store</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Choose a partner to refine results</p>
          </div>
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-600 pointer-events-none" />
            <select
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-[13px] font-semibold text-gray-800 outline-none appearance-none transition-all"
              style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
              value={storeId}
              onChange={e => setStoreId(e.target.value)}
              onFocus={e => { e.target.style.border = '1.5px solid #3b82f6'; }}
              onBlur={e => { e.target.style.border = '1.5px solid #e2e8f0'; }}
            >
              <option value="">All Stores</option>
              {stores.map(s => (
                <option key={s._id || s.id || s.name} value={s._id || s.id}>{s.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-gray-400 rotate-45" />
            </div>
          </div>
        </div>

        {/* ── Product list ── */}
        {loadingProducts ? (
          /* Loading skeleton */
          <div
            className="bg-white border border-gray-200 rounded-2xl p-4"
            style={{ boxShadow: '0 1px 6px rgba(37,99,235,0.05)' }}
          >
            <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="shrink-0 w-[85%] sm:w-[320px]">
                  <div className="h-[300px] bg-gray-200 rounded-2xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : list.length === 0 ? (
          <div
            className="text-center py-14 bg-white rounded-2xl border-2 border-dashed border-gray-200"
          >
            <div
              className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg,#eff6ff,#e0f2fe)', border: '1px solid #bfdbfe' }}
            >
              <ShoppingBag className="w-7 h-7 text-blue-500" />
            </div>
            <p className="text-[15px] font-extrabold text-gray-900">No Products Found</p>
            <p className="text-[13px] text-gray-500 mt-1 max-w-xs mx-auto">
              Try selecting a different store or check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: horizontal carousel */}
            <div className="md:hidden">
              <ProductCarousel title="Exclusive Deals" subtitle="Swipe to discover more" rightHref="/products">
                {list.map(p => (
                  <div key={p._id || p.id} className="snap-start min-w-[85%] sm:min-w-[340px]">
                    <ProductCard product={p} base={base} />
                  </div>
                ))}
              </ProductCarousel>
            </div>

            {/* Desktop: grid */}
            <div
              className="hidden md:block bg-white border border-gray-200 rounded-2xl p-5"
              style={{ boxShadow: '0 1px 6px rgba(37,99,235,0.05)' }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {list.map(p => (
                  <ProductCard key={p._id || p.id} product={p} base={base} />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <BottomBar />
      <NoScrollbar />
    </main>
  );
}

function NoScrollbar() {
  return (
    <style jsx global>{`
      .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
      .no-scrollbar::-webkit-scrollbar { display:none; }
    `}</style>
  );
}