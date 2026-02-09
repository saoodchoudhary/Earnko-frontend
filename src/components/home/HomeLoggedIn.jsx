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
    (Array.isArray(obj) && obj) ||
    [];
  return Array.isArray(candidate) ? candidate : [];
}

async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return null; }
  }
  const txt = await res.text().catch(() => '');
  return { success: false, message: txt };
}

export default function HomeLoggedIn() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadStores() {
      try {
        if (!base) return;
        const res = await fetch(`${base}/api/stores`, { signal: controller.signal });
        const js = await safeJson(res);
        if (!res.ok) { setStores([]); return; }
        const list = Array.isArray(js?.data?.stores) ? js.data.stores : normalizeList(js);
        setStores(list);
      } catch {
        setStores([]);
      }
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

        const res = await fetch(`${base}/api/products?${params.toString()}`, { signal: controller.signal });
        const js = await safeJson(res);

        if (!res.ok) { setProducts([]); return; }
        setProducts(normalizeList(js));
      } catch {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [base, storeId]);

  const list = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  return (
    <main className="min-h-screen mt-16 bg-gradient-to-b from-gray-50 via-white to-white pb-28 md:pb-10">
      {/* soft background glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-[-80px] w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-[-120px] w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <BannerCarousel />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-gray-700">Hot Deals Live</span>
          </div>
        </div>
      </div>

      <StoreStrip base={base} stores={stores} title="Featured Partners" />

      <section className="container mx-auto px-4 pt-6 pb-10">
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <Sparkles className="w-5 h-5 text-blue-700" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                Top Selling Flash Deals
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Curated deals • Swipe on mobile • Copy link to earn commission
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-white/95 backdrop-blur border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-gray-900">Filter by store</div>
              <div className="text-xs text-gray-600 mt-1">Choose partner to refine results</div>
            </div>

            <div className="relative w-full md:w-[380px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-700" />
              <select
                className="w-full pl-11 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition appearance-none text-gray-800 font-semibold"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
              >
                <option value="">All Stores</option>
                {stores.map((s) => (
                  <option key={s._id || s.id || s.name} value={s._id || s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {loadingProducts ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="h-6 w-44 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="snap-start min-w-[85%] sm:min-w-[360px]">
                  <div className="h-[320px] bg-gray-200 rounded-2xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-blue-700" />
            </div>
            <div className="mt-4 text-lg font-extrabold text-gray-900">No Products Found</div>
            <div className="mt-1 text-sm text-gray-600 max-w-md mx-auto">
              Try selecting a different store or check back later.
            </div>
          </div>
        ) : (
          <>
            <div className="md:hidden">
              <ProductCarousel title="Exclusive Deals" subtitle="Swipe to discover more" rightHref="/products">
                {list.map((p) => (
                  <div key={p._id || p.id} className="snap-start min-w-[85%] sm:min-w-[360px]">
                    <ProductCard product={p} base={base} />
                  </div>
                ))}
              </ProductCarousel>
            </div>

            <div className="hidden md:block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {list.map((p) => (
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
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `}</style>
  );
}