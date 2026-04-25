// src/app/blog/BlogClient.jsx  ← Client Component (filter + UI)
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

/* ─── Helpers ─────────────────────────────────────────────── */

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ─── Tag colors ──────────────────────────────────────────── */

const TAG_COLORS = {
  affiliate: { bg: '#eff6ff', color: '#1d4ed8', ring: '#bfdbfe' },
  tracking:  { bg: '#f5f3ff', color: '#6d28d9', ring: '#ddd6fe' },
  seo:       { bg: '#f0fdf4', color: '#15803d', ring: '#bbf7d0' },
  analytics: { bg: '#fffbeb', color: '#b45309', ring: '#fde68a' },
  earning:   { bg: '#fff1f2', color: '#be123c', ring: '#fecdd3' },
};

function TagBadge({ tag }) {
  const key = tag?.toLowerCase();
  const s = TAG_COLORS[key] || { bg: '#f3f4f6', color: '#374151', ring: '#e5e7eb' };
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{
        background: s.bg,
        color: s.color,
        boxShadow: `0 0 0 1px ${s.ring}`,
      }}
    >
      {tag}
    </span>
  );
}

/* ─── Gradient palette ────────────────────────────────────── */

const GRADS = [
  { from: '#2563eb', to: '#06b6d4' },
  { from: '#7c3aed', to: '#a855f7' },
  { from: '#059669', to: '#0d9488' },
  { from: '#f43f5e', to: '#ec4899' },
  { from: '#f59e0b', to: '#f97316' },
  { from: '#a21caf', to: '#ec4899' },
];

function GradPlaceholder({ idx }) {
  const g = GRADS[idx % GRADS.length];
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
    >
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full bg-white/5" />
      <svg
        className="relative z-10 w-10 h-10 text-white/30"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

/* ─── Featured Card ───────────────────────────────────────── */

function FeaturedCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col lg:flex-row overflow-hidden rounded-3xl bg-white transition-all duration-300"
      style={{
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow =
          '0 20px 48px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.07)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)')
      }
    >
      {/* Top accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] z-10 rounded-t-3xl"
        style={{
          background: 'linear-gradient(90deg,#2563eb,#06b6d4,#8b5cf6)',
        }}
      />

      {/* Thumbnail */}
      <div className="lg:w-[42%] min-h-[240px] lg:min-h-[360px] relative flex-shrink-0 overflow-hidden">
        {post.coverImage ? (
          <>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top,rgba(0,0,0,0.28) 0%,transparent 60%)',
              }}
            />
          </>
        ) : (
          <GradPlaceholder idx={0} />
        )}
        <div className="absolute top-4 left-4 z-10">
          <span
            className="px-2.5 py-1 rounded-full text-white text-[10px] font-black tracking-widest uppercase"
            style={{
              background: 'rgba(37,99,235,0.88)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
            }}
          >
            ★ Featured
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-7 lg:p-9 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(post.tags || []).slice(0, 3).map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
          <h2 className="text-xl lg:text-[1.6rem] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors leading-[1.25] line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-3 text-gray-500 text-sm leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}
            >
              {(post.author || 'E').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800">
                {post.author || 'Earnko'}
              </div>
              <div className="text-xs text-gray-400">{formatDate(post.date)}</div>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-blue-600 px-4 py-2 rounded-xl transition-all group-hover:gap-2.5"
            style={{ background: '#eff6ff' }}
          >
            Read Article
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Post Card ───────────────────────────────────────────── */

function PostCard({ post, index }) {
  const g = GRADS[index % GRADS.length];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden"
      style={{
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          '0 16px 40px rgba(37,99,235,0.10), 0 4px 12px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="relative w-full h-52 overflow-hidden flex-shrink-0">
        {post.coverImage ? (
          <>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top,rgba(0,0,0,0.18) 0%,transparent 55%)',
              }}
            />
          </>
        ) : (
          <GradPlaceholder idx={index} />
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(post.tags || []).slice(0, 2).map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>
        <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 flex-1">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
              style={{
                background: `linear-gradient(135deg,${g.from},${g.to})`,
              }}
            >
              {(post.author || 'E').slice(0, 1).toUpperCase()}
            </div>
            <span className="text-xs text-gray-400">{formatDate(post.date)}</span>
          </div>
          <span className="text-xs font-extrabold text-blue-600 group-hover:underline underline-offset-2">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Filter Pill ─────────────────────────────────────────── */

function FilterPill({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150"
      style={
        active
          ? {
              background: 'linear-gradient(135deg,#2563eb,#0891b2)',
              color: '#fff',
              boxShadow: '0 3px 10px rgba(37,99,235,0.30)',
              border: '1px solid transparent',
            }
          : {
              background: '#fff',
              color: '#4b5563',
              border: '1px solid #e5e7eb',
            }
      }
    >
      {label}
      {count !== undefined && (
        <span
          className="text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none"
          style={
            active
              ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
              : { background: '#f3f4f6', color: '#6b7280' }
          }
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── StatPill ────────────────────────────────────────────── */

function StatPill({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-blue-200 font-medium mt-0.5">{label}</div>
    </div>
  );
}

/* ─── Main Export ─────────────────────────────────────────── */

export default function BlogClient({ posts }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read active tag from URL — ?tag=earning  →  "earning"
  const activeTag = searchParams.get('tag') || 'All';

  // Tag click → push new URL (no page reload)
  function handleTagClick(tag) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag === 'All') {
      params.delete('tag');
    } else {
      params.set('tag', tag.toLowerCase());
    }
    router.push(`/blog?${params.toString()}`, { scroll: false });
  }

  // Build tag list with counts
  const tagCounts = useMemo(() => {
    const map = {};
    posts.forEach((p) =>
      (p.tags || []).forEach((t) => {
        map[t] = (map[t] || 0) + 1;
      })
    );
    return map;
  }, [posts]);

  const allTags = useMemo(
    () => ['All', ...Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])],
    [tagCounts]
  );

  // Filter posts — case-insensitive match
  const filtered = useMemo(() => {
    if (activeTag === 'All') return posts;
    return posts.filter((p) =>
      (p.tags || []).map((t) => t.toLowerCase()).includes(activeTag.toLowerCase())
    );
  }, [posts, activeTag]);

  const [featured, ...rest] = filtered;
  const uniqueTopics = Object.keys(tagCounts).length;

  return (
    <div className="min-h-screen mt-[62px] bg-[#f6f7fb]">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg,#1e3a8a 0%,#2563eb 50%,#0891b2 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle,#93c5fd,transparent)',
            }}
          />
          <div
            className="absolute -bottom-16 right-1/4 w-80 h-80 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle,#67e8f9,transparent)',
            }}
          />
        </div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle,rgba(255,255,255,0.6) 1px,transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-[1280px] mx-auto px-5 py-16 md:py-20">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white text-xs font-bold tracking-wide mb-5"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              Earnko Knowledge Hub
            </div>

            <h1 className="text-4xl md:text-[3.2rem] font-black text-white leading-[1.1] tracking-tight">
              Affiliate Marketing
              <br />
              <span style={{ color: '#67e8f9' }}>Guides & Insights</span>
            </h1>
            <p className="mt-4 text-blue-100 text-lg max-w-xl leading-relaxed">
              Deep-dive guides on link tracking, cookie attribution, conversion
              analytics, and earning strategies for creators in India.
            </p>

            <div className="mt-10 flex items-center gap-8 flex-wrap">
              <StatPill value={posts.length} label="Articles" />
              <div className="w-px h-8 bg-white/20" />
              <StatPill value={uniqueTopics} label="Topics" />
              <div className="w-px h-8 bg-white/20" />
              <StatPill value="Free" label="Always" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <div
        className="sticky top-[62px] z-30 bg-white/95 border-b border-gray-200"
        style={{ backdropFilter: 'blur(12px)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-[1280px] mx-auto px-5">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
            {allTags.map((tag) => (
              <FilterPill
                key={tag}
                label={tag}
                count={tag === 'All' ? posts.length : tagCounts[tag]}
                active={
                  activeTag === 'All'
                    ? tag === 'All'
                    : tag.toLowerCase() === activeTag.toLowerCase()
                }
                onClick={() => handleTagClick(tag)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Posts ── */}
      <div className="max-w-[1280px] mx-auto px-5 py-12">
        {filtered.length === 0 ? (
          /* Empty state */
          <div
            className="bg-white rounded-2xl p-16 text-center"
            style={{ border: '2px dashed #e5e7eb' }}
          >
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-700 font-bold text-lg">
              No posts in &quot;{activeTag}&quot;
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Try selecting a different topic above.
            </p>
            <button
              onClick={() => handleTagClick('All')}
              className="mt-5 px-5 py-2 rounded-xl text-sm font-bold text-blue-600 transition-colors"
              style={{ background: '#eff6ff' }}
            >
              Show all articles
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured */}
            {featured && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-black text-blue-600 tracking-widest uppercase">
                    Featured
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                <FeaturedCard post={featured} />
              </div>
            )}

            {/* Rest */}
            {rest.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-black text-gray-500 tracking-widest uppercase">
                    {activeTag === 'All' ? 'All Articles' : `${activeTag} Articles`}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">
                    {rest.length} article{rest.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p, i) => (
                    <PostCard key={p.slug} post={p} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CTA Banner ── */}
      <section className="mt-4 mb-16 max-w-[1280px] mx-auto px-5">
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-center"
          style={{
            background: 'linear-gradient(135deg,#1e3a8a,#2563eb 50%,#0891b2)',
          }}
        >
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-white/8 pointer-events-none" />
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle,rgba(255,255,255,0.5) 1px,transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black text-cyan-300 tracking-widest uppercase mb-3"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Start Today
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Ready to start earning?
            </h2>
            <p className="mt-2 text-blue-200 text-sm max-w-sm mx-auto">
              Generate affiliate links, track clicks in real-time, and grow your
              income with Earnko.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/dashboard/affiliate"
                className="px-6 py-2.5 rounded-xl text-blue-700 font-extrabold text-sm hover:-translate-y-0.5 transition-all"
                style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                Generate a Link →
              </Link>
              <Link
                href="/stores"
                className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:bg-white/20"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
              >
                Browse Stores
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}