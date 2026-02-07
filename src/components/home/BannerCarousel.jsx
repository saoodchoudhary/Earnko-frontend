'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function toAbsoluteUrl(base, url) {
  if (!url) return '';
  const u = String(url);
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/')) return `${String(base || '').replace(/\/+$/, '')}${u}`;
  return u;
}

export default function BannerCarousel({
  heightClass = 'h-[210px] sm:h-[260px] md:h-[420px] lg:h-[540px]',
  intervalMs = 5000,
  className = '',
}) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);

  // for timer reset
  const intervalRef = useRef(null);

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  const visible = useMemo(() => (Array.isArray(items) ? items : []).filter(Boolean), [items]);

  const stopAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (loading) return;
    if (visible.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % visible.length;
        // scroll after state updates
        requestAnimationFrame(() => scrollToIndex(next, 'smooth', false));
        return next;
      });
    }, intervalMs);
  };

  const resetAutoplay = () => {
    // on arrow click / dot click: timer reset
    startAutoplay();
  };

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        if (!base) return;
        setLoading(true);

        const res = await fetch(`${base}/api/public/banners`, { signal: controller.signal });
        const js = await safeJson(res);

        if (!res.ok) {
          setItems([]);
          return;
        }

        const list = Array.isArray(js?.data?.items) ? js.data.items : [];
        setItems(list);
        setActiveIndex(0);
      } catch (err) {
        if (err?.name !== 'AbortError') console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [base]);

  // keep refs aligned
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, visible.length);
  }, [visible.length]);

  const scrollToIndex = (idx, behavior = 'smooth', shouldResetTimer = true) => {
    const container = scrollerRef.current;
    const el = cardRefs.current[idx];
    if (!container || !el) return;

    container.scrollTo({ left: el.offsetLeft, behavior });
    setActiveIndex(idx);

    if (shouldResetTimer) resetAutoplay();
  };

  const prev = () => {
    if (visible.length <= 1) return;
    const nextIdx = (activeIndex - 1 + visible.length) % visible.length;
    scrollToIndex(nextIdx, 'smooth', true);
  };

  const next = () => {
    if (visible.length <= 1) return;
    const nextIdx = (activeIndex + 1) % visible.length;
    scrollToIndex(nextIdx, 'smooth', true);
  };

  // update active dot on manual scroll
  useEffect(() => {
    const container = scrollerRef.current;
    if (!container) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollLeft = container.scrollLeft;
        let bestIdx = 0;
        let bestDist = Infinity;

        for (let i = 0; i < cardRefs.current.length; i++) {
          const el = cardRefs.current[i];
          if (!el) continue;
          const dist = Math.abs(el.offsetLeft - scrollLeft);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        }
        setActiveIndex(bestIdx);
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener('scroll', onScroll);
    };
  }, [visible.length]);

  // start autoplay when ready
  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, visible.length, intervalMs]);

  // on first render after load, snap to first
  useEffect(() => {
    if (!loading && visible.length > 0) {
      requestAnimationFrame(() => scrollToIndex(0, 'auto', false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, visible.length]);

  if (!base) return null;
  if (!loading && visible.length === 0) return null;

  return (
    <section className={`w-full bg-white ${className}`}>
      <div className="relative w-full overflow-hidden">
        {loading ? (
          <div className={`w-full ${heightClass} bg-gray-200 animate-pulse`} />
        ) : (
          <>
            <div
              ref={scrollerRef}
              className="flex overflow-x-auto snap-x snap-mandatory banner-scroll"
            >
              {visible.map((b, idx) => {
                const img = toAbsoluteUrl(base, b.imageUrl); // FIX: /uploads path works
                return (
                  <div
                    key={b._id || idx}
                    ref={(el) => { cardRefs.current[idx] = el; }}
                    className="snap-start shrink-0 w-full"
                  >
                    <a
                      href={b.linkUrl || '#'}
                      target={b.linkUrl ? '_blank' : undefined}
                      rel={b.linkUrl ? 'noopener noreferrer' : undefined}
                      className="block w-full"
                      draggable={false}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={b.title || 'Banner'}
                        className={`w-full ${heightClass} object-cover select-none`}
                        draggable={false}
                      />
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Left/Right buttons */}
            {visible.length > 1 && (
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

            {/* Dots INSIDE banner */}
            {visible.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 ">
                {visible.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToIndex(i, 'smooth', true)}
                    className={`h-[6px] rounded-full transition-all ${
                      i === activeIndex ? 'w-[12px] bg-white' : 'w-[6px] bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to banner ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .banner-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .banner-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}