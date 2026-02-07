'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Zap, Store, Filter,
  ShoppingBag, ArrowRight,
  Copy, Star, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';
import BannerCarousel from './BannerCarousel';

function normalizeList(obj) {
  const candidate =
    (obj?.data?.items && Array.isArray(obj.data.items) && obj.data.items) ||
    (obj?.data && Array.isArray(obj.data) && obj.data) ||
    (obj?.items && Array.isArray(obj.items) && obj.items) ||
    (Array.isArray(obj) && obj) ||
    [];
  return Array.isArray(candidate) ? candidate : [];
}

function toAbsoluteUrl(base, url) {
  if (!url) return '';
  const u = String(url);
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) return `${String(base || '').replace(/\/+$/, '')}${u}`;
  return u;
}

function FullHeroBannerCarousel({ base }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);

  const touchStartX = useRef(null);
  const isDragging = useRef(false);

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        if (!base) { setItems([]); return; }
        setLoading(true);
        const res = await fetch(`${base}/api/public/banners`, { signal: controller.signal });
        const js = await safeJson(res);
        if (!res.ok) {
          setItems([]);
          return;
        }
        const list = Array.isArray(js?.data?.items) ? js.data.items : [];
        setItems(list);
        setActive(0);
      } catch (err) {
        if (err?.name !== 'AbortError') setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [base]);

  const visible = useMemo(() => (Array.isArray(items) ? items : []).filter(Boolean), [items]);
  const count = visible.length;

  const go = (idx) => {
    if (!count) return;
    const next = (idx + count) % count;
    setActive(next);
  };
  const next = () => go(active + 1);
  const prev = () => go(active - 1);

  // Optional autoplay (uncomment if needed)
  // useEffect(() => {
  //   if (count <= 1) return;
  //   const t = setInterval(() => next(), 5000);
  //   return () => clearInterval(t);
  // }, [count, active]);

  const onTouchStart = (e) => {
    if (!count) return;
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
    isDragging.current = true;
  };
  const onTouchMove = () => {};
  const onTouchEnd = (e) => {
    if (!count) return;
    const startX = touchStartX.current;
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    touchStartX.current = null;

    if (!isDragging.current) return;
    isDragging.current = false;

    if (startX == null || endX == null) return;
    const dx = endX - startX;

    // swipe threshold
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next();
    else prev();
  };

  const current = count ? visible[active] : null;
  const img = current ? toAbsoluteUrl(base, current.imageUrl) : '';

  return (
    <section className="w-full bg-white">
      <div className="relative w-full overflow-hidden">
        {/* Aspect ratio: mobile taller, desktop wider */}
        <div
          className="w-full bg-gray-100"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {loading ? (
            <div className="w-full h-[210px] sm:h-[260px] md:h-[420px] lg:h-[380px] animate-pulse bg-gray-200" />
          ) : !current ? (
            <div className="w-full h-[210px] sm:h-[260px] md:h-[420px] lg:h-[380px] flex items-center justify-center text-gray-500">
              No banners
            </div>
          ) : (
            <a
              href={current.linkUrl || '#'}
              target={current.linkUrl ? '_blank' : undefined}
              rel={current.linkUrl ? 'noopener noreferrer' : undefined}
              className="block w-full"
              draggable={false}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={current.title || 'Banner'}
                className="w-full h-[210px] sm:h-[260px] md:h-[420px] lg:h-[540px] object-cover select-none"
                draggable={false}
              />
            </a>
          )}
        </div>

        {/* Left/Right buttons (EarnPe style) */}
        {count > 1 && !loading && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg border border-gray-200 flex items-center justify-center transition"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>

            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg border border-gray-200 flex items-center justify-center transition"
              aria-label="Next banner"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {count > 1 && !loading && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {visible.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === active ? 'w-6 bg-white shadow' : 'w-2.5 bg-white/60'
                }`}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function HomeLoggedIn() {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  // Only load stores for product filter now (since hero removed)
  useEffect(() => {
    const controller = new AbortController();
    async function loadStores() {
      try {
        const sRes = await fetch(`${base}/api/stores`, { signal: controller.signal });
        const sData = await safeJson(sRes);
        if (sRes.ok) {
          const list =
            Array.isArray(sData?.data?.stores) ? sData.data.stores : normalizeList(sData);
          setStores(list);
        }
      } catch {
        setStores([]);
      }
    }
    if (base) loadStores();
    return () => controller.abort();
  }, [base]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const params = new URLSearchParams();
        if (storeId) params.set('storeId', storeId);
        params.set('sort', 'popular');
        params.set('limit', '9');
        const pRes = await fetch(`${base}/api/products?${params.toString()}`, { signal: controller.signal });
        const pData = await safeJson(pRes);
        if (pRes.ok) {
          setProducts(normalizeList(pData));
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally { setLoadingProducts(false); }
    }
    if (base) loadProducts();
    return () => controller.abort();
  }, [base, storeId]);

  const generateCuelinksProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Please login to generate link');
      const res = await fetch(`${base}/api/links/generate-cuelinks-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ productId })
      });
      const data = await safeJson(res);
      if (!res.ok) {
        if (res.status === 409 && data?.code === 'campaign_approval_required') {
          toast.error('Campaign needs approval. Please apply in Cuelinks.');
          return;
        }
        throw new Error(data?.message || 'Failed to generate Cuelinks link');
      }
      const link = data?.data?.link;
      if (!link) throw new Error('No link returned');
      await navigator.clipboard.writeText(link);
      toast.success('Affiliate link copied to clipboard!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate');
    }
  };

  return (
    <main className="min-h-screen mt-16 bg-gradient-to-b from-gray-50 to-white">
      {/* HERO REMOVED -> Full Banner Carousel */}
      <BannerCarousel />

      {/* Products Section */}
      <section className="container mx-auto px-4 py-8 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                Explore Products
              </h2>
              <p className="text-gray-600 mt-1">Find products to promote and earn commissions</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="w-full sm:w-auto pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                >
                  <option value="">All Stores</option>
                  {Array.isArray(stores) && stores.map((s) => (
                    <option key={s._id || s.id || s.name} value={s._id || s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-600">Try selecting a different store</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p._id || p.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {Array.isArray(p.images) && p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.title || p.name || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold max-w-[60%] truncate">
                      {p.store?.name || 'Store'}
                    </div>

                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                      High Commission
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 truncate">
                      {p.category || 'Product'}
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                      {p.title || p.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {p.description || 'Premium product with high conversion rate'}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xl font-bold text-gray-900">
                          ₹{Number(p.price || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Price</div>
                      </div>

                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => generateCuelinksProduct(p._id || p.id)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                    >
                      <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Copy Affiliate Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-8 text-center">
              <a
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                View All Products
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-blue-200">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Boost Your Earnings?
            </h2>
            <p className="text-gray-600 mb-8">
              Start generating affiliate links and earn commissions on every sale
            </p>
            <a
              style={{ color: 'white' }}
              href="/dashboard/affiliate"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
            >
              <Zap className="w-5 h-5" />
              Start Generating Links
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <StyleTag />
    </main>
  );
}

// Local utility CSS for line clamping on titles without plugin
const styles = `
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;

const StyleTag = () => <style dangerouslySetInnerHTML={{ __html: styles }} />;