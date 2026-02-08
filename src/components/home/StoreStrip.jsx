'use client';

import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Store as StoreIcon, Link2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

function logoUrl(base, logo) {
  if (!logo) return '';
  const u = String(logo);
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) return `${String(base || '').replace(/\/+$/, '')}${u}`;
  return u;
}

export default function StoreStrip({ base, stores = [], title = 'Premium Partners' }) {
  const scrollerRef = useRef(null);
  const list = useMemo(() => (Array.isArray(stores) ? stores : []).filter(s => s?.isActive !== false), [stores]);

  const [busyId, setBusyId] = useState(null);

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(260, Math.round(el.clientWidth * 0.78));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const generateStoreLink = async (storeId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Please login to generate link');

      setBusyId(storeId);

      // NOTE: adjust endpoint to your backend if different
      const res = await fetch(`${base}/api/links/generate-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ storeId })
      });

      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json().catch(() => null) : null;

      if (!res.ok) throw new Error(data?.message || 'Failed to generate store link');

      const link = data?.data?.link || data?.link;
      if (!link) throw new Error('No link returned');

      await navigator.clipboard.writeText(link);
      toast.success('Store link copied!');
    } catch (err) {
      toast.error(err?.message || 'Failed to generate link');
    } finally {
      setBusyId(null);
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
            const id = s._id || s.id;
            const isBusy = busyId === id;

            return (
              <div
                key={id || s.name}
                className="snap-start shrink-0 w-[260px] sm:w-[300px]"
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
                      <div className="text-xs text-gray-600 mt-0.5">High commission partner</div>
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
                      onClick={() => generateStoreLink(id)}
                      disabled={isBusy}
                      className="py-2.5 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-md transition disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      <Link2 className="w-4 h-4" />
                      {isBusy ? '...' : 'Link'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
      </div>
    </section>
  );
}