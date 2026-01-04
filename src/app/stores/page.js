'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store as StoreIcon, Search, TrendingUp,
  Zap, Star, ChevronRight, Crown, Award,
  ShoppingBag, Percent, Globe, ExternalLink
} from 'lucide-react';

export default function StoresPage() {
  return (
    <Suspense fallback={<StoresSkeleton />}>
      <StoresPageInner />
    </Suspense>
  );
}

function StoresPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const [stores, setStores] = useState([]);
  const [offers, setOffers] = useState([]);

  const [storesLoading, setStoresLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);

  const initialStore = params?.get('store') || 'all';
  const [selectedStore, setSelectedStore] = useState(initialStore);

  // Search stores (NOT offers)
  const [storeQuery, setStoreQuery] = useState('');
  const [queryDebounced, setQueryDebounced] = useState(storeQuery);

  // Debounce search input for smoother UX
  useEffect(() => {
    const t = setTimeout(() => setQueryDebounced(storeQuery), 200);
    return () => clearTimeout(t);
  }, [storeQuery]);

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  const normalizeStores = (js) => {
    const d = js?.data;
    const list = d?.stores || js?.stores || [];
    return Array.isArray(list) ? list : [];
  };

  const normalizeOffers = (js) => {
    const d = js?.data;
    const list = d?.offers || js?.offers || d?.items || js?.items || [];
    return Array.isArray(list) ? list : [];
  };

  // Keep selectedStore in sync if URL query changes
  useEffect(() => {
    if (initialStore !== selectedStore) setSelectedStore(initialStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStore]);

  // Load stores from backend
  useEffect(() => {
    const controller = new AbortController();
    async function loadStores() {
      try {
        setStoresLoading(true);
        if (!base) { setStores([]); return; }
        const res = await fetch(`${base}/api/stores`, { signal: controller.signal });
        const js = await safeJson(res);
        if (!res.ok) throw new Error(js?.message || `Failed to load stores (HTTP ${res.status})`);
        const list = normalizeStores(js);
        setStores(list);
      } catch {
        setStores([]);
      } finally {
        setStoresLoading(false);
      }
    }
    loadStores();
    return () => controller.abort();
  }, [base]);

  // Load offers from backend — use storeId when a specific store is selected
  useEffect(() => {
    const controller = new AbortController();
    async function loadOffers() {
      try {
        setOffersLoading(true);
        if (!base) { setOffers([]); return; }
        const sp = new URLSearchParams();
        if (selectedStore && selectedStore !== 'all') sp.set('storeId', selectedStore);
        const url = `${base}/api/public/offers${sp.toString() ? `?${sp.toString()}` : ''}`;
        const res = await fetch(url, { signal: controller.signal });
        const js = await safeJson(res);
        if (!res.ok) throw new Error(js?.message || `Failed to load offers (HTTP ${res.status})`);
        const list = normalizeOffers(js);
        setOffers(list);
      } catch {
        setOffers([]);
      } finally {
        setOffersLoading(false);
      }
    }
    loadOffers();
    return () => controller.abort();
  }, [base, selectedStore]);

  // Reflect selectedStore in URL
  useEffect(() => {
    const search = new URLSearchParams();
    if (selectedStore && selectedStore !== 'all') search.set('store', selectedStore);
    const qs = search.toString();
    router.replace(`/stores${qs ? `?${qs}` : ''}`);
  }, [selectedStore, router]);

  // Filter stores by search query
  const visibleStores = useMemo(() => {
    const q = queryDebounced.trim().toLowerCase();
    const list = Array.isArray(stores) ? stores : [];
    if (!q) return list;
    return list.filter(s => String(s.name || '').toLowerCase().includes(q));
  }, [stores, queryDebounced]);

  // Selected store object
  const selectedStoreData = useMemo(
    () => (selectedStore === 'all' ? null : (stores || []).find(s => s._id === selectedStore) || null),
    [selectedStore, stores]
  );

  // Offers (already filtered by backend if store selected)
  const filteredOffers = useMemo(() => {
    const baseList = offers || [];
    // Basic stable sort: by rate desc, then updated/created desc
    return [...baseList].sort((a, b) => {
      const rateDiff = (b.rate || 0) - (a.rate || 0);
      if (rateDiff !== 0) return rateDiff;
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });
  }, [offers]);

  const requireLoginToGenerate = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) router.push('/login?next=/dashboard/affiliate');
    else router.push('/dashboard/affiliate');
  };

  // Formatting
  const fmtPct = (n) => `${Number(n || 0)}%`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <StoreIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Stores & Offers</h1>
                <p className="text-blue-100 mt-1">Discover high-commission affiliate programs</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Available Stores</div>
              <div className="text-xl font-bold">{storesLoading ? '...' : `${stores.length}+`}</div>
            </div>
          </div>

          {/* Top toolbar: Search stores */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute top-6 left-3  -translate-y-1/2 w-4 h-4 text-white/70" />
              <input
                type="search"
                placeholder="Search stores..."
                value={storeQuery}
                onChange={(e) => setStoreQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/15 text-white placeholder:text-white/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <div className="mt-2 text-xs text-white/80">
                {storesLoading ? 'Loading stores...' : `Showing ${visibleStores.length} of ${stores.length}`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Stores Grid (no horizontal scroll; responsive grid) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Browse Stores</h2>
            <Link href="/stores" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {storesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : visibleStores.length === 0 ? (
            <div className="text-center py-10">
              <StoreIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-gray-600">No stores match your search</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* All Stores tile */}
              <StoreCard
                active={selectedStore === 'all'}
                onClick={() => setSelectedStore('all')}
                label="All Stores"
                icon={<Globe className="w-5 h-5 text-blue-600" />}
                meta={`${stores.length} total`}
              />
              {visibleStores.map(store => (
                <StoreCard
                  key={store._id}
                  active={selectedStore === store._id}
                  onClick={() => setSelectedStore(store._id)}
                  label={store.name}
                  logo={store.logo}
                  meta={store.affiliateNetwork ? store.affiliateNetwork : 'Affiliate'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatTile
            icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
            label="Available Offers"
            value={offersLoading ? 0 : filteredOffers.length}
            bg="from-blue-100 to-cyan-100"
          />
          <StatTile
            icon={<Percent className="w-5 h-5 text-green-600" />}
            label="Avg. Commission"
            value={
              offersLoading || filteredOffers.length === 0
                ? 0
                : Math.round(filteredOffers.reduce((sum, o) => sum + (o.rate || 0), 0) / filteredOffers.length)
            }
            suffix="%"
            bg="from-green-100 to-emerald-100"
          />
          <StatTile
            icon={<Zap className="w-5 h-5 text-amber-600" />}
            label="Top Commission"
            value={offersLoading || filteredOffers.length === 0 ? 0 : Math.max(...filteredOffers.map(o => o.rate || 0))}
            suffix="%"
            bg="from-amber-100 to-orange-100"
          />
        </div>

        {/* Offers Grid */}
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedStore === 'all' ? 'All Offers' : `${selectedStoreData?.name || 'Store'} Offers`}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {offersLoading ? 'Loading offers...' : `${filteredOffers.length} offers available`}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Click on any offer to generate affiliate link
            </div>
          </div>

          {offersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Offers Found</h3>
              <p className="text-gray-600 mb-4">
                {selectedStore === 'all' ? 'No offers available.' : 'No offers available for the selected store.'}
              </p>
              <button
                onClick={() => {
                  setSelectedStore('all');
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                View All Offers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map(offer => (
                <OfferCard key={offer._id} offer={offer} onGenerate={requireLoginToGenerate} />
              ))}
            </div>
          )}
        </div>

        {/* Featured Section */}
        {!offersLoading && filteredOffers.some(o => o.featured) && (
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold">Featured Offers</h3>
                <p className="text-blue-100">Special high-commission opportunities</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOffers.filter(o => o.featured).slice(0, 2).map(offer => (
                <div key={offer._id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {offer.store?.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={offer.store.logo} alt={offer.store.name} className="w-6 h-6 rounded" />
                      ) : (
                        <StoreIcon className="w-5 h-5" />
                      )}
                      <span className="font-medium">{offer.store?.name}</span>
                    </div>
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                      {fmtPct(offer.rate || 0)} Commission
                    </span>
                  </div>
                  <div className="text-sm mb-2">{offer.title || offer.name}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      High Converting
                    </span>
                    <button onClick={requireLoginToGenerate} className="text-white hover:text-blue-100 flex items-center gap-1">
                      Generate Link
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StoreCard({ label, logo, icon, active, onClick, meta }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-3 rounded-xl border transition-all text-left w-full
        ${active ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'}`}
      aria-pressed={active ? 'true' : 'false'}
    >
      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={label} className="w-6 h-6 object-contain" />
        ) : icon ? (
          <div className="w-6 h-6 text-blue-600">{icon}</div>
        ) : (
          <StoreIcon className="w-5 h-5 text-blue-600" />
        )}
      </div>
      <div className="min-w-0">
        <div className="font-medium text-gray-900 truncate">{label}</div>
        <div className="text-xs text-gray-500 truncate">{meta || 'Affiliate'}</div>
      </div>
      {active ? (
        <Star className="w-4 h-4 text-amber-500 ml-auto" />
      ) : null}
    </button>
  );
}

function StatTile({ icon, label, value, suffix = '', bg = 'from-gray-100 to-gray-200' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${bg} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-lg font-bold text-gray-900">{value}{suffix}</div>
        </div>
      </div>
    </div>
  );
}

function OfferCard({ offer, onGenerate }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-gray-200 flex items-center justify-center">
            {offer.store?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offer.store.logo} alt={offer.store.name} className="w-6 h-6 object-contain" />
            ) : (
              <StoreIcon className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{offer.store?.name}</div>
            <div className="text-xs text-gray-500">Affiliate Program</div>
          </div>
        </div>
        {offer.featured && <Award className="w-4 h-4 text-amber-500" />}
      </div>

      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
        {offer.title || offer.categoryKey}
      </h3>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {offer.description || 'High converting affiliate offer'}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold text-green-600">
          Up to {offer.commissionRate || 0}%
        </div>
        <div className="text-xs text-gray-500">Commission</div>
      </div>

      <button
        className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105"
        onClick={onGenerate}
      >
        <Zap className="w-4 h-4" />
        Generate Link
      </button>
    </div>
  );
}

function StoresSkeleton() {
  return (
    <div className="min-h-screen">
      <section className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="h-6 w-48 bg-white/20 rounded" />
          <div className="h-4 w-72 bg-white/10 rounded mt-2" />
        </div>
      </section>
      <section className="container mx-auto px-4 py-6">
        <div className="h-40 bg-gray-200 rounded" />
      </section>
    </div>
  );
}