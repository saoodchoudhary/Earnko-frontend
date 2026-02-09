'use client';

import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Store as StoreIcon, Share2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

function logoUrl(base, logo) {
  if (!logo) return '';
  const u = String(logo);
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) return `${String(base || '').replace(/\/+$/, '')}${u}`;
  return u;
}

async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return null; }
  }
  const txt = await res.text().catch(() => '');
  return { success: false, message: txt };
}

export default function StoreStrip({ base, stores = [], title = 'Featured Partners' }) {
  const scrollerRef = useRef(null);

  const list = useMemo(
    () => (Array.isArray(stores) ? stores : []).filter(s => s && s.isActive !== false),
    [stores]
  );

  const [sharingStoreId, setSharingStoreId] = useState(null);

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(260, Math.round(el.clientWidth * 0.78));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const requireLogin = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Please login to generate link');
      return null;
    }
    return token;
  };

  // EXACTLY like Stores page: POST /api/affiliate/link-from-url
  const generateStoreLink = async (store) => {
    const token = requireLogin();
    if (!token) return;

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

      const res = await fetch(`${base}/api/affiliate/link-from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ url, storeId: store._id })
      });

      const js = await safeJson(res);

      if (!res.ok) {
        if (res.status === 409 && js?.code === 'campaign_approval_required') {
          toast.error('Campaign approval required for this store');
          return;
        }
        throw new Error(js?.message || 'Failed to generate link');
      }

      const link = js?.data?.link;
      if (!link) throw new Error('No provider link returned');

      await navigator.clipboard.writeText(link);
      toast.success('Store link copied!');
    } catch (err) {
      toast.error(err?.message || 'Failed to generate link');
    } finally {
      setSharingStoreId(null);
    }
  };

  if (!list.length) return null;

  return (
    <section className="container mx-auto px-4 mt-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="text-lg font-extrabold text-gray-900 truncate">{title}</div>
            <div className="text-sm text-gray-600 mt-0.5">Swipe to explore partners</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center"
              aria-label="Scroll stores left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center"
              aria-label="Scroll stores right"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2"
        >
          {list.map((s) => {
            const img = logoUrl(base, s.logo);
            const isSharing = sharingStoreId === s._id;

            return (
              <div
                key={s._id || s.id || s.name}
                className="snap-start shrink-0 w-[265px] sm:w-[310px]"
              >
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-4 hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={s.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <StoreIcon className="w-7 h-7 text-gray-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-gray-900 truncate">{s.name}</div>
                      <div className="text-xs text-gray-600 mt-0.5 truncate">
                        {s.baseUrl ? (() => { try { return new URL(s.baseUrl).hostname.replace(/^www\./, ''); } catch { return '—'; } })() : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a
                      href="/stores"
                      className="py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 text-sm flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>

                    <button
                      type="button"
                      onClick={() => generateStoreLink(s)}
                      disabled={isSharing}
                      className={`py-2.5 rounded-xl font-extrabold text-white text-sm transition flex items-center justify-center gap-2 ${
                        isSharing
                          ? 'bg-blue-400 cursor-wait'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-md'
                      }`}
                      title="Generate affiliate link"
                    >
                      {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                      {isSharing ? 'Generating...' : 'Generate'}
                    </button>
                  </div>

                  <div className="mt-3 text-[11px] text-gray-500 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Active
                    </span>
                    <span className="font-semibold text-gray-600">High commission</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NoScrollbar />
    </section>
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