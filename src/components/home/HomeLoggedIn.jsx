'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Zap, Gift, Store, TrendingUp, Filter,
  ShoppingBag, DollarSign, Sparkles, ArrowRight,
  Copy, Star, BarChart3
} from 'lucide-react';

function normalizeList(obj) {
  const candidate =
    (obj?.data?.items && Array.isArray(obj.data.items) && obj.data.items) ||
    (obj?.data && Array.isArray(obj.data) && obj.data) ||
    (obj?.items && Array.isArray(obj.items) && obj.items) ||
    (Array.isArray(obj) && obj) ||
    [];
  return Array.isArray(candidate) ? candidate : [];
}

export default function HomeLoggedIn() {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [quickStats, setQuickStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    activeLinks: 0
  });

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

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
    async function loadInitial() {
      try {
        // Load stores
        const sRes = await fetch(`${base}/api/stores`, { signal: controller.signal });
        const sData = await safeJson(sRes);
        if (sRes.ok) {
          const list =
            Array.isArray(sData?.data?.stores) ? sData.data.stores :
            normalizeList(sData);
          setStores(list);
        }

        // Load quick stats
        const token = localStorage.getItem('token');
        if (token) {
          const statsRes = await fetch(`${base}/api/user/quick-stats`, {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` }
          });
          const statsData = await safeJson(statsRes);
          if (statsRes.ok) {
            const payload = statsData?.data || {};
            setQuickStats({
              totalEarnings: Number(payload.totalEarnings || 0),
              pendingPayouts: Number(payload.pendingPayouts || 0),
              activeLinks: Number(payload.activeLinks || 0),
            });
          }
        }
      } catch {
        // ignore initial failures
      }
    }
    if (base) loadInitial();
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

  useEffect(() => {
    const controller = new AbortController();
    async function loadOffers() {
      try {
        setLoadingOffers(true);
        const params = new URLSearchParams({ limit: '8', sort: 'commission' });
        const oRes = await fetch(`${base}/api/public/offers?${params.toString()}`, { signal: controller.signal });
        const oData = await safeJson(oRes);
        if (oRes.ok) {
          // FIX: Backend returns offers under data.offers (fallbacks included)
          const list =
            Array.isArray(oData?.data?.offers) ? oData.data.offers :
            Array.isArray(oData?.offers) ? oData.offers :
            normalizeList(oData);
          setOffers(list);
        } else {
          setOffers([]);
        }
      } catch {
        setOffers([]);
      } finally { setLoadingOffers(false); }
    }
    if (base) loadOffers();
    return () => controller.abort();
  }, [base]);

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

  const quickActions = [
    { icon: <Zap className="w-5 h-5" />, label: 'Generate Link', href: '/dashboard/affiliate', color: 'from-blue-500 to-cyan-500' },
    // { icon: <Gift className="w-5 h-5" />, label: 'Top Offers', href: '/offers', color: 'from-amber-500 to-orange-500' },
    { icon: <Store className="w-5 h-5" />, label: 'Browse Stores', href: '/stores', color: 'from-green-500 to-emerald-500' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/analytics', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <main className="min-h-screen mt-16 bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="w-full">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome back! 🎉</h1>
              <p className="text-blue-100 text-base md:text-lg mb-6 max-w-2xl">
                Discover amazing deals and start generating affiliate links to earn commissions.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 max-w-xl mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4">
                  <div className="text-xs md:text-sm text-blue-100">Total Earnings</div>
                  <div className="text-lg md:text-2xl font-bold">₹{quickStats.totalEarnings.toLocaleString()}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4">
                  <div className="text-xs md:text-sm text-blue-100">Pending</div>
                  <div className="text-lg md:text-2xl font-bold">₹{quickStats.pendingPayouts.toLocaleString()}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4">
                  <div className="text-xs md:text-sm text-blue-100">Active Links</div>
                  <div className="text-lg md:text-2xl font-bold">{quickStats.activeLinks}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 md:gap-3">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="px-4 py-2.5 md:px-6 md:py-3 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    {action.icon}
                    <span className="text-sm md:text-base">{action.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="container mx-auto px-4 py-8">
        {/* <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs md:text-sm font-semibold text-amber-700">HOT DEALS</span>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">Featured Deals</h2>
            <p className="text-gray-600 mt-1 text-sm md:text-base">High commission offers for maximum earnings</p>
          </div>
          <a
            href="/offers"
            className="mt-1 md:mt-0 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-sm md:text-base"
          >
            View all offers
            <ArrowRight className="w-4 h-4" />
          </a>
        </div> */}

        {loadingOffers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : !Array.isArray(offers) || offers.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No offers available</h3>
            <p className="text-gray-600">Check back later for new deals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((offer, idx) => (
              <div key={offer._id || idx} className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 truncate max-w-[180px] sm:max-w-[220px]">
                        {offer.store?.name || 'Store'}
                      </div>
                      <div className="font-bold text-gray-900 line-clamp-1">
                        {offer.title || offer.categoryKey || 'Offer'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  {offer.commissionRate ? (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-bold text-green-600">
                        Up to {Number(offer.commissionRate).toFixed(0)}% commission
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* <a
                    href={`/stores/${offer.store?._id || ''}`}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center text-sm"
                  >
                    View Store
                  </a> */}
                  {/* Keep product link generation for products only; for offers, guide to generator */}
                  <a
                  style={{color : "white"}}
                    href="/dashboard/affiliate"
                    className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-center text-sm"
                  >
                    Generate Link
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 pb-12">
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
                  {/* Product Image */}
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

                    {/* Store Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold max-w-[60%] truncate">
                      {p.store?.name || 'Store'}
                    </div>

                    {/* Commission Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                      High Commission
                    </div>
                  </div>

                  {/* Product Info */}
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

                    {/* Action Button */}
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

          {/* Load More Button */}
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
            style={{color:"white"}}
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