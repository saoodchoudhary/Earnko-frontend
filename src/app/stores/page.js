'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Store as StoreIcon, Search, Globe, Star, Share2, Percent, X, Copy, Check, Loader2
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
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);

  const [storeQuery, setStoreQuery] = useState('');
  const [queryDebounced, setQueryDebounced] = useState(storeQuery);

  const [shareFor, setShareFor] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [sharingStoreId, setSharingStoreId] = useState(null);
  const [copied, setCopied] = useState(false);

  // NEW: Profit rates modal state
  const [ratesOpen, setRatesOpen] = useState(false);
  const [ratesFor, setRatesFor] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [profitRates, setProfitRates] = useState(null); // { storeRules, globalRules }

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

  useEffect(() => {
    const controller = new AbortController();
    async function loadStores() {
      try {
        setStoresLoading(true);
        if (!base) { setStores([]); return; }
        const res = await fetch(`${base}/api/stores`, { signal: controller.signal });
        const js = await safeJson(res);
        if (!res.ok) throw new Error(js?.message || `Failed to load stores (HTTP ${res.status})`);
        setStores(normalizeStores(js));
      } catch (err) {
        console.error('Load stores error:', err);
        setStores([]);
      } finally {
        setStoresLoading(false);
      }
    }
    loadStores();
    return () => controller.abort();
  }, [base]);

  const visibleStores = useMemo(() => {
    const q = queryDebounced.trim().toLowerCase();
    const list = Array.isArray(stores) ? stores : [];
    if (!q) return list;
    return list.filter(s => String(s.name || '').toLowerCase().includes(q));
  }, [stores, queryDebounced]);

  const requireLoginToGenerate = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) router.push('/login?next=/stores');
    return !!token;
  };

  // FIX: use universal backend endpoint (extrape/trackier/cuelinks)
  const shareStoreLink = async (store) => {
    if (!requireLoginToGenerate()) return;

    const url = store?.baseUrl;
    if (!url) {
      toast.error('This store does not have a shareable base URL yet');
      return;
    }
    if (!base) {
      toast.error('NEXT_PUBLIC_BACKEND_URL not set');
      return;
    }

    try {
      setSharingStoreId(store._id);
      setCopied(false);

      const token = localStorage.getItem('token');

      const res = await fetch(`${base}/api/affiliate/link-from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          url,
          storeId: store._id // optional, useful for stats
        })
      });

      const js = await safeJson(res);

      if (!res.ok) {
        if (res.status === 409 && js?.code === 'campaign_approval_required') {
          toast.error('Cuelinks campaign approval required for this store');
          return;
        }
        throw new Error(js?.message || 'Failed to generate link');
      }

      const providerLink = js?.data?.link;
      if (!providerLink) throw new Error('No provider link returned');

      setShareFor(store);
      setShareUrl(providerLink);
      setShareOpen(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to generate link');
    } finally {
      setSharingStoreId(null);
    }
  };

  // NEW: open profit rates modal + fetch
  const viewProfitRates = async (store) => {
    try {
      if (!base) {
        toast.error('NEXT_PUBLIC_BACKEND_URL not set');
        return;
      }
      setRatesFor(store);
      setProfitRates(null);
      setRatesOpen(true);
      setRatesLoading(true);

      const res = await fetch(`${base}/api/stores/${store._id}/profit-rates`);
      const js = await safeJson(res);
      if (!res.ok) throw new Error(js?.message || `Failed to load profit rates (HTTP ${res.status})`);

      setProfitRates(js?.data || null);
    } catch (err) {
      toast.error(err?.message || 'Failed to load profit rates');
      setProfitRates(null);
    } finally {
      setRatesLoading(false);
    }
  };

  const closeProfitRates = () => {
    setRatesOpen(false);
    setRatesFor(null);
    setProfitRates(null);
    setRatesLoading(false);
  };

  const getLogoUrl = (logo) => {
    if (!logo || typeof logo !== 'string') return '';
    if (logo.startsWith('http://') || logo.startsWith('https://')) return logo;
    return `${base}${logo}`;
  };

  const closeShare = () => {
    setShareOpen(false);
    setShareFor(null);
    setShareUrl('');
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  const openShareWindow = (url) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer,width=900,height=650');
    } catch {}
  };

  const messageText = shareFor?.name ? `Check out ${shareFor.name} deals` : `Check out this store`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <StoreIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Stores</h1>
                <p className="text-blue-100 mt-1">Discover affiliate-ready merchants</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Available Stores</div>
              <div className="text-xl font-bold">{storesLoading ? '...' : `${stores.length}+`}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search className="absolute top-6 left-3 -translate-y-1/2 w-4 h-4 text-white/70" />
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

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Browse Stores</h2>
            <Link href="/stores" className="text-sm text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          {storesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : visibleStores.length === 0 ? (
            <div className="text-center py-10">
              <StoreIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-gray-600">No stores match your search</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleStores.map(store => (
                <StoreItem
                  key={store._id}
                  store={store}
                  onShare={() => shareStoreLink(store)}
                  onViewProfit={() => viewProfitRates(store)}
                  getLogoUrl={getLogoUrl}
                  sharing={sharingStoreId === store._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profit rates modal */}
      {ratesOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeProfitRates} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  View Profit Rates — {ratesFor?.name || 'Store'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  Category-wise rates
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={closeProfitRates}>
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              {ratesLoading ? (
                <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              ) : !profitRates ? (
                <div className="text-sm text-gray-600">No rates found.</div>
              ) : (
                <div className="space-y-6">
                  <RatesTable title="Store-specific Rates" rows={profitRates.storeRules || []} />
                  {/* <RatesTable title="Global Default Rates" rows={profitRates.globalRules || []} /> */}
                </div>
              )}

              <div className="mt-5 text-[11px] text-gray-500">
                Note: These are indicative profit/commission rates by category. Final payout depends on tracking and network validation.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share modal (existing) */}
      {shareOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeShare} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    Share {shareFor?.name || 'Store'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    Choose a platform or copy the link
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={closeShare}>
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Affiliate link</div>
                <div className="text-sm text-gray-900 break-all">{shareUrl}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ShareTile label="WhatsApp" color="bg-green-50 text-green-700 border-green-200"
                  onClick={() => openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${messageText} ${shareUrl}`)}`)}
                />
                <ShareTile label="Facebook" color="bg-blue-50 text-blue-700 border-blue-200"
                  onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
                />
                <ShareTile label="Telegram" color="bg-cyan-50 text-cyan-700 border-cyan-200"
                  onClick={() => openShareWindow(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(messageText)}`)}
                />
                <ShareTile label="Twitter" color="bg-sky-50 text-sky-700 border-sky-200"
                  onClick={() => openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(messageText)}&url=${encodeURIComponent(shareUrl)}`)}
                />
              </div>

              <div className="text-[11px] text-gray-500">
                Note: This is the direct affiliate link from the provider. Purchases tracked to this link will count toward your earnings.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RatesTable({ title, rows }) {
  return (
    <div>
      <div className="font-semibold text-gray-900 mb-2">{title}</div>
      {(!rows || rows.length === 0) ? (
        <div className="text-sm text-gray-600">No rates.</div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 px-3 py-2">
            <div className="col-span-6">Category</div>
            <div className="col-span-3">Rate</div>
            <div className="col-span-3">Max Cap</div>
          </div>
          {rows.map((r) => (
            <div key={r._id} className="grid grid-cols-12 px-3 py-2 text-sm border-t border-gray-100">
              <div className="col-span-6 text-gray-900">{ r.categoryKey}</div>
              <div className="col-span-3 text-gray-700">
                {Number(r.commissionRate || 0)}{r.commissionType === 'percentage' ? '%' : ''}
              </div>
              <div className="col-span-3 text-gray-700">
                {r.maxCap != null ? `₹${Number(r.maxCap).toLocaleString()}` : '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShareTile({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`border ${color} rounded-lg px-3 py-2 font-semibold text-sm hover:shadow-sm transition-all`}
    >
      {label}
    </button>
  );
}

function StoreItem({ store, onShare, onViewProfit, getLogoUrl, sharing }) {
  const rateText =
    typeof store.commissionRate === 'number'
      ? `${Number(store.commissionRate)}${store.commissionType === 'percentage' ? '%' : ''}`
      : null;

  const logoUrl = getLogoUrl(store.logo);

  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all">
      <div className="">
          <div className='flex items-start justify-between gap-1'>
        <div className='flex items-start gap-3 mb-3'>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={store.name} className="w-10 h-10 object-contain" />
          ) : (
            <StoreIcon className="w-6 h-6 text-blue-600" />
          )}
        </div>
        
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate flex items-center gap-1">
            {store.name}
            {
            // store.isActive && <Star className="w-3.5 h-3.5 text-amber-500" />
            }
          </div>
          <div className="text-xs text-gray-500 truncate flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            {store.baseUrl ? new URL(store.baseUrl).hostname.replace(/^www\./, '') : '—'}
          </div>
        </div>
        </div>

        <button
          onClick={onViewProfit}
          className=" text-[12px] p-1 hover:underline  text-blue-600 hover:text-blue-700"
          title="View category-wise profit rates"
        >
          View Profit Rates
        </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center gap-1 text-gray-600">
          Upto <span className="font-medium">{rateText || 'Variable'}</span>
          <span className="text-xs text-gray-500 ml-1">Commission</span>
        </div>
        <div className="text-xs text-gray-500">
          Cookie: {store.cookieDuration ? `${store.cookieDuration}d` : '—'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onShare}
          disabled={sharing}
          className={`flex-1 py-2 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            sharing ? 'bg-blue-400 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg'
          }`}
          title="Generate affiliate link for this store"
        >
          {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          {sharing ? 'Generating...' : 'Share Store'}
        </button>

      </div>
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