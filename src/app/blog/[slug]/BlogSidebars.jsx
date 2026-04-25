'use client';

import Link from 'next/link';
import Image from 'next/image';

/* ─── TOC ────────────────────────────────────────────────── */
export function Toc({ items }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100" style={{ background: 'linear-gradient(135deg,#eff6ff,#f0f9ff)' }}>
        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h16M4 18h10" />
        </svg>
        <span className="text-xs font-black text-blue-700 tracking-wider uppercase">On this page</span>
      </div>
      <nav className="p-3 space-y-0.5 max-h-[320px] overflow-y-auto">
        {items.map((it, i) => (
          <a
            key={`${it.id}-${i}`}
            href={`#${it.id}`}
            className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg transition-all text-sm group hover:bg-blue-50 hover:text-blue-700"
            style={{ paddingLeft: it.level === 3 ? '1.5rem' : '0.5rem' }}
          >
            <span
              className="mt-1.5 flex-shrink-0 rounded-full"
              style={{
                width: it.level === 2 ? '7px' : '5px',
                height: it.level === 2 ? '7px' : '5px',
                background: it.level === 2 ? '#3b82f6' : '#93c5fd',
                marginTop: '6px',
              }}
            />
            <span className={`leading-snug ${it.level === 3 ? 'text-gray-400 text-xs' : 'text-gray-700 font-semibold'}`}>
              {it.title}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
}

/* ─── Quick Links ────────────────────────────────────────── */
const QUICK_LINKS = [
  { href: '/stores', label: '🏪  Browse Stores' },
  { href: '/dashboard/affiliate', label: '🔗  Generate Affiliate Link' },
  { href: '/contact', label: '💬  Contact Support' },
  { href: '/blog', label: '📰  Back to Blog' },
];

export function QuickLinks() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100" style={{ background: 'linear-gradient(135deg,#f9fafb,#f3f4f6)' }}>
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span className="text-xs font-black text-gray-600 tracking-wider uppercase">Quick links</span>
      </div>
      <div className="p-4">
        <div className="space-y-0.5">
          {QUICK_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between text-[13px] py-2 px-2 rounded-lg font-semibold text-blue-600 group transition-all border-b border-gray-50 last:border-0 hover:bg-blue-50"
            >
              <span>{label}</span>
              <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Share Buttons ──────────────────────────────────────── */
export function ShareButtons({ url, title }) {
  const encoded = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);

  const shares = [
    {
      label: 'Twitter',
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encTitle}`,
      bg: '#000',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encTitle}%20${encoded}`,
      bg: '#25d366',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encoded}&text=${encTitle}`,
      bg: '#2AABEE',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      label: 'Copy link',
      href: null,
      bg: '#6366f1',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100" style={{ background: 'linear-gradient(135deg,#f9fafb,#f3f4f6)' }}>
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="text-xs font-black text-gray-600 tracking-wider uppercase">Share this article</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {shares.map((s) =>
            s.href ? (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{ background: s.bg }}
              >
                {s.icon}{s.label}
              </a>
            ) : (
              <button
                key={s.label}
                onClick={() => navigator.clipboard?.writeText(url)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{ background: s.bg }}
              >
                {s.icon}{s.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Post mini-list (used in both sidebars) ─────────────── */
export function PostLinksList({ items }) {
  if (!items?.length)
    return <div className="text-sm text-gray-400 py-2 text-center">No articles yet.</div>;

  const GRADS = [
    'linear-gradient(135deg,#2563eb,#06b6d4)',
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#059669,#0d9488)',
    'linear-gradient(135deg,#f43f5e,#ec4899)',
    'linear-gradient(135deg,#f59e0b,#f97316)',
  ];

  return (
    <div className="space-y-4">
      {items.map((p, i) => (
        <Link key={p.slug} href={`/blog/${p.slug}`} className="flex gap-3 group">
          <div
            className="relative flex-shrink-0 rounded-xl overflow-hidden"
            style={{ width: '52px', height: '52px', background: '#f3f4f6' }}
          >
            {p.coverImage ? (
              <Image src={p.coverImage} alt={p.title} fill className="object-cover" sizes="52px" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-sm font-black"
                style={{ background: GRADS[i % GRADS.length] }}
              >
                {(p.title || 'E').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {p.date && (
              <div className="text-[10px] text-gray-400 mb-0.5 font-medium">
                {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
            <div className="text-[13px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {p.title}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─── Prev / Next navigation ─────────────────────────────── */
export function PrevNextNav({ recent }) {
  if (!recent?.length) return null;
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link
        href={`/blog/${recent[0]?.slug}`}
        className="group flex flex-col p-4 bg-white rounded-2xl transition-all hover:shadow-[0_8px_24px_rgba(37,99,235,0.10)] hover:border-blue-200"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </span>
        <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {recent[0]?.title}
        </span>
      </Link>

      {recent[1] && (
        <Link
          href={`/blog/${recent[1]?.slug}`}
          className="group flex flex-col p-4 bg-white rounded-2xl transition-all text-right hover:shadow-[0_8px_24px_rgba(37,99,235,0.10)] hover:border-blue-200"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-end gap-1">
            Next
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {recent[1]?.title}
          </span>
        </Link>
      )}
    </div>
  );
}

/* ─── Related post card ──────────────────────────────────── */
const TAG_STYLES = {
  affiliate: { bg: '#dbeafe', color: '#1e40af', ring: '#93c5fd' },
  tracking:  { bg: '#ede9fe', color: '#5b21b6', ring: '#c4b5fd' },
  seo:       { bg: '#d1fae5', color: '#065f46', ring: '#6ee7b7' },
  analytics: { bg: '#fef3c7', color: '#92400e', ring: '#fcd34d' },
  earning:   { bg: '#ffe4e6', color: '#9f1239', ring: '#fda4af' },
  strategy:  { bg: '#f0f9ff', color: '#0c4a6e', ring: '#7dd3fc' },
  trending:  { bg: '#fdf4ff', color: '#6b21a8', ring: '#d8b4fe' },
};

function TagBadge({ tag }) {
  const key = tag?.toLowerCase();
  const s = TAG_STYLES[key] || { bg: '#f3f4f6', color: '#374151', ring: '#d1d5db' };
  return (
    <span
      className="inline-flex items-center font-bold rounded-full text-[10px] px-2.5 py-0.5"
      style={{ background: s.bg, color: s.color, boxShadow: `0 0 0 1px ${s.ring}` }}
    >
      {tag}
    </span>
  );
}

export function RelatedPostsGrid({ related }) {
  if (!related?.length) return null;
  const GRADS = [
    'linear-gradient(135deg,#2563eb,#06b6d4)',
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#059669,#0d9488)',
    'linear-gradient(135deg,#f43f5e,#ec4899)',
  ];

  return (
    <div className="mt-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">You might also like</h2>
          <div className="w-12 h-1 rounded-full mt-2" style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4)' }} />
        </div>
        <Link href="/blog" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
          All posts →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {related.map((p, i) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[0_12px_32px_rgba(37,99,235,0.10)] hover:-translate-y-0.5"
            style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="relative w-full overflow-hidden" style={{ height: '160px' }}>
              {p.coverImage ? (
                <Image
                  src={p.coverImage}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes="(max-width:768px) 100vw, 25vw"
                />
              ) : (
                <div className="w-full h-full" style={{ background: GRADS[i % GRADS.length] }} />
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.25),transparent)' }} />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(p.tags || []).slice(0, 2).map((t) => <TagBadge key={t} tag={t} />)}
              </div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug flex-1">
                {p.title}
              </h4>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  {p.date ? new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                </span>
                <span className="text-[11px] font-extrabold text-blue-600">Read →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}