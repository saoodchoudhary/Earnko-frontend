import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import {
  getAllPostsMeta,
  getPostBySlug,
  getRecentPosts,
  getRelatedPosts,
} from '@/lib/blog';
import Footer from '@/components/Layout/Footer';
import Navbar from '@/components/Layout/Navbar';

// ✅ Sab interactive components alag file se import
import {
  Toc,
  QuickLinks,
  ShareButtons,
  PostLinksList,
  PrevNextNav,
  RelatedPostsGrid,
} from './BlogSidebars';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.earnko.com';

/* ─── Static params ──────────────────────────────────────── */
export function generateStaticParams() {
  return getAllPostsMeta().map((p) => ({ slug: p.slug }));
}

/* ─── Metadata (SEO first priority) ─────────────────────── */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.meta.slug}`;
  const images = post.meta.coverImage
    ? [{ url: post.meta.coverImage, width: 1200, height: 630 }]
    : [];

  return {
    title: `${post.meta.title} | Earnko Blog`,
    description: post.meta.excerpt || '',
    alternates: { canonical: url },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: post.meta.title,
      description: post.meta.excerpt || '',
      url,
      type: 'article',
      images,
      publishedTime: post.meta.date,
      authors: [post.meta.author || 'Earnko'],
      tags: post.meta.tags || [],
    },
    twitter: {
      card: post.meta.coverImage ? 'summary_large_image' : 'summary',
      title: post.meta.title,
      description: post.meta.excerpt || '',
      images: post.meta.coverImage ? [post.meta.coverImage] : [],
    },
  };
}

/* ─── Helpers (pure, no client code) ────────────────────── */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function estimateReadTime(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function slugifyHeading(s) {
  return String(s || '').trim().toLowerCase()
    .replace(/[`~!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function extractToc(mdx) {
  const lines = String(mdx || '').split('\n');
  const items = [];
  for (const line of lines) {
    const m = line.match(/^(###|##)\s+(.+)\s*$/);
    if (!m) continue;
    const level = m[1] === '##' ? 2 : 3;
    const title = m[2].trim();
    if (!title) continue;
    items.push({ level, title, id: slugifyHeading(title) });
  }
  return items.slice(0, 24);
}

/* ─── Tag Badge (server safe — no handlers) ──────────────── */
const TAG_STYLES = {
  affiliate: { bg: '#dbeafe', color: '#1e40af', ring: '#93c5fd' },
  tracking:  { bg: '#ede9fe', color: '#5b21b6', ring: '#c4b5fd' },
  seo:       { bg: '#d1fae5', color: '#065f46', ring: '#6ee7b7' },
  analytics: { bg: '#fef3c7', color: '#92400e', ring: '#fcd34d' },
  earning:   { bg: '#ffe4e6', color: '#9f1239', ring: '#fda4af' },
  strategy:  { bg: '#f0f9ff', color: '#0c4a6e', ring: '#7dd3fc' },
  trending:  { bg: '#fdf4ff', color: '#6b21a8', ring: '#d8b4fe' },
};

function TagBadge({ tag, large = false }) {
  const s = TAG_STYLES[tag?.toLowerCase()] || { bg: '#f3f4f6', color: '#374151', ring: '#d1d5db' };
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full ${large ? 'text-xs px-3 py-1' : 'text-[10px] px-2.5 py-0.5'}`}
      style={{ background: s.bg, color: s.color, boxShadow: `0 0 0 1px ${s.ring}` }}
    >
      {tag}
    </span>
  );
}

/* ─── Reading progress (inline script — server safe) ─────── */
function ReadingProgressBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px]" style={{ background: 'rgba(0,0,0,0.08)' }}>
      <div id="reading-bar" className="h-full transition-none" style={{ width: '0%', background: 'linear-gradient(90deg,#2563eb,#06b6d4,#8b5cf6)' }} />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var b=document.getElementById('reading-bar');if(!b)return;window.addEventListener('scroll',function(){var e=document.documentElement,s=e.scrollTop,t=e.scrollHeight-e.clientHeight;b.style.width=t>0?Math.round(s/t*100)+'%':'0%';},{passive:true});})();`,
        }}
      />
    </div>
  );
}

/* ─── JSON-LD ─────────────────────────────────────────────── */
function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/* ─── Sidebar card (server safe — no handlers) ───────────── */
function SideCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100" style={{ background: 'linear-gradient(135deg,#f9fafb,#f3f4f6)' }}>
        <span className="text-blue-500">{icon}</span>
        <span className="text-xs font-black text-gray-600 tracking-wider uppercase">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  const canonicalUrl = `${SITE_URL}/blog/${post.meta.slug}`;
  const readTime    = estimateReadTime(post.content);
  const tocItems    = extractToc(post.content);
  const recent      = getRecentPosts({ limit: 5, excludeSlug: post.meta.slug });
  const related     = getRelatedPosts({ post, limit: 4 });

  // SEO: JSON-LD BlogPosting schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline:      post.meta.title,
    description:   post.meta.excerpt || '',
    url:           canonicalUrl,
    datePublished: post.meta.date || undefined,
    dateModified:  post.meta.date || undefined,
    author:        { '@type': 'Organization', name: post.meta.author || 'Earnko', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Earnko',
      url:  SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    keywords:  (post.meta.tags || []).join(', '),
    inLanguage: 'en-IN',
    ...(post.meta.coverImage ? { image: `${SITE_URL}${post.meta.coverImage}` } : {}),
  };

  // Breadcrumb schema
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.meta.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <Navbar />
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd} />
      <ReadingProgressBar />

      <div className="min-h-screen bg-[#f6f7fb]" style={{ marginTop: '62px' }}>

        {/* ══ HERO ══════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 45%,#0891b2 100%)', minHeight: '360px' }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-16 w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle,#93c5fd,transparent)' }} />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle,#67e8f9,transparent)' }} />
          </div>
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '26px 26px' }} />

          <div className="relative container mx-auto px-5 py-12 md:py-16">
            {/* Breadcrumb — SEO + visual */}
            <nav className="flex items-center gap-1.5 text-xs text-blue-200 mb-6 flex-wrap" aria-label="breadcrumb">
              <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
              <svg className="w-3 h-3 flex-shrink-0 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              <Link href="/blog" className="hover:text-white transition-colors font-medium">Blog</Link>
              <svg className="w-3 h-3 flex-shrink-0 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              <span className="text-white/50 line-clamp-1 max-w-[200px]">{post.meta.title}</span>
            </nav>

            {/* Tags */}
            {Array.isArray(post.meta.tags) && post.meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {post.meta.tags.slice(0, 5).map((t) => (
                  <span key={t} className="text-[10px] font-black px-3 py-1 rounded-full tracking-wider uppercase" style={{ background: 'rgba(255,255,255,0.13)', color: '#e0f2fe', boxShadow: '0 0 0 1px rgba(255,255,255,0.18)' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* H1 — SEO most important */}
            <h1 className="font-black text-white leading-[1.1] tracking-tight max-w-3xl" style={{ fontSize: 'clamp(1.65rem,4vw,2.75rem)' }}>
              {post.meta.title}
            </h1>

            {post.meta.excerpt && (
              <p className="mt-4 max-w-2xl leading-relaxed" style={{ color: '#bfdbfe', fontSize: 'clamp(0.95rem,1.5vw,1.1rem)' }}>
                {post.meta.excerpt}
              </p>
            )}

            {/* Meta pills */}
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.13)', boxShadow: '0 0 0 1px rgba(255,255,255,0.18)' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black" style={{ background: 'rgba(255,255,255,0.25)' }}>
                  {(post.meta.author || 'E').slice(0, 1).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-white">{post.meta.author || 'Earnko'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.13)', boxShadow: '0 0 0 1px rgba(255,255,255,0.18)' }}>
                <svg className="w-3.5 h-3.5" style={{ color: '#93c5fd' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-xs font-semibold text-white">{formatDate(post.meta.date)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.13)', boxShadow: '0 0 0 1px rgba(255,255,255,0.18)' }}>
                <svg className="w-3.5 h-3.5" style={{ color: '#93c5fd' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-semibold text-white">{readTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ COVER IMAGE ════════════════════════════════════════ */}
        {post.meta.coverImage && (
          <div className="max-w-[1280px] mx-auto px-5">
            <div
              className="relative -mt-10 rounded-2xl overflow-hidden mx-auto"
              style={{ maxWidth: '820px', height: 'clamp(180px,35vw,420px)', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '3px solid #fff' }}
            >
              <Image
                src={post.meta.coverImage}
                alt={post.meta.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width:1024px) 100vw, 820px"
              />
            </div>
          </div>
        )}

        {/* ══ 3-COLUMN GRID ══════════════════════════════════════ */}
        <div className="container mx-auto px-5" style={{ paddingTop: post.meta.coverImage ? '2.5rem' : '3rem', paddingBottom: '4rem' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT SIDEBAR */}
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="sticky top-20 space-y-5">
                {/* ✅ Client Components — handlers work here */}
                <Toc items={tocItems} />
                <QuickLinks />
                <div className="hidden lg:block">
                  <ShareButtons url={canonicalUrl} title={post.meta.title} />
                </div>
              </div>
            </aside>

            {/* MAIN ARTICLE */}
            <main className="lg:col-span-6 order-1 lg:order-2 min-w-0">
              <article className="bg-white rounded-3xl overflow-hidden" style={{ border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="h-1" style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4,#8b5cf6)' }} />

                <div className="p-6 md:p-10">
                  {/* MDX — Server rendered for SEO */}
                  <div className="blog-content">
                    <MDXRemote source={post.content} />
                  </div>

                  {/* Tags footer */}
                  {Array.isArray(post.meta.tags) && post.meta.tags.length > 0 && (
                    <div className="mt-10 pt-6" style={{ borderTop: '1px solid #f3f4f6' }}>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tagged Under</div>
                      <div className="flex flex-wrap gap-2">
                        {post.meta.tags.map((t) => <TagBadge key={t} tag={t} large />)}
                      </div>
                    </div>
                  )}

                  {/* Author card */}
                  <div className="mt-8 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg,#eff6ff,#f0f9ff)', border: '1px solid #bfdbfe' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
                        {(post.meta.author || 'E').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-bold">Written by</div>
                        <div className="font-black text-gray-900 text-sm">{post.meta.author || 'Earnko'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Affiliate marketing + link tracking guides by Earnko team.</div>
                      </div>
                    </div>
                    <Link href="/dashboard/affiliate" className="flex-shrink-0 px-5 py-2.5 rounded-xl text-white text-xs font-extrabold transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                      Create a Link →
                    </Link>
                  </div>
                </div>
              </article>

              {/* Mobile share */}
              <div className="mt-5 lg:hidden">
                <ShareButtons url={canonicalUrl} title={post.meta.title} />
              </div>

              {/* Prev / Next — Client Component */}
              <PrevNextNav recent={recent} />
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="lg:col-span-3 order-3">
              <div className="lg:sticky lg:top-20 space-y-5">

                {/* Author */}
                <SideCard title="Author" icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                }>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
                      {(post.meta.author || 'E').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-gray-900 text-sm">{post.meta.author || 'Earnko'}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">Affiliate marketing tips for creators and publishers.</div>
                      <a href="mailto:contact@earnko.com" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                        contact@earnko.com
                      </a>
                    </div>
                  </div>
                </SideCard>

                {/* CTA */}
                <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb,#0891b2)' }}>
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#fff,transparent)' }} />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full mb-3 tracking-wider" style={{ background: 'rgba(255,255,255,0.15)', boxShadow: '0 0 0 1px rgba(255,255,255,0.2)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      LIVE NOW
                    </div>
                    <div className="text-base font-black mb-1">Ready to earn?</div>
                    <p className="text-blue-100 text-xs leading-relaxed mb-4">Generate affiliate links and track real-time conversions on Earnko.</p>
                    <Link href="/dashboard/affiliate" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-blue-700 text-xs font-extrabold transition-all hover:shadow-lg" style={{ background: '#fff' }}>
                      Generate Link →
                    </Link>
                  </div>
                </div>

                {/* Related — Client Component */}
                <SideCard title="Related articles" icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                }>
                  <PostLinksList items={related} />
                </SideCard>

                {/* Recent — Client Component */}
                <SideCard title="Recent articles" icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                }>
                  <PostLinksList items={recent} />
                </SideCard>
              </div>
            </aside>
          </div>

          {/* Related posts grid — Client Component */}
          <RelatedPostsGrid related={related} />
        </div>
      </div>

      <Footer />
    </>
  );
}