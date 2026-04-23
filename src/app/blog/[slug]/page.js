import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import {
  getAllPostsMeta,
  getPostBySlug,
  getRecentPosts,
  getRelatedPosts
} from '@/lib/blog';
import Footer from '@/components/Layout/Footer';
import Navbar from '@/components/Layout/Navbar';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.earnko.com';

export function generateStaticParams() {
  const posts = getAllPostsMeta();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.meta.slug}`;
  const images = post.meta.coverImage ? [{ url: post.meta.coverImage }] : [];

  return {
    title: `${post.meta.title} | Earnko Blog`,
    description: post.meta.excerpt || '',
    alternates: { canonical: url },
    openGraph: {
      title: post.meta.title,
      description: post.meta.excerpt || '',
      url,
      type: 'article',
      images,
    },
    twitter: {
      card: post.meta.coverImage ? 'summary_large_image' : 'summary',
      title: post.meta.title,
      description: post.meta.excerpt || '',
      images: post.meta.coverImage ? [post.meta.coverImage] : [],
    },
  };
}

/* ─── Helpers ─────────────────────────────────────────────── */

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
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[`~!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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

const TAG_COLORS = {
  affiliate: 'bg-blue-50 text-blue-700 ring-blue-200',
  tracking: 'bg-violet-50 text-violet-700 ring-violet-200',
  seo: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  analytics: 'bg-amber-50 text-amber-700 ring-amber-200',
  earning: 'bg-rose-50 text-rose-700 ring-rose-200',
};

function TagBadge({ tag }) {
  const cls = TAG_COLORS[tag?.toLowerCase()] || 'bg-gray-100 text-gray-600 ring-gray-200';
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${cls}`}>
      {tag}
    </span>
  );
}

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ─── TOC ─────────────────────────────────────────────────── */

function Toc({ items }) {
  if (!items?.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h16M4 18h10" />
        </svg>
        <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">On this page</span>
      </div>
      <nav className="p-4 space-y-1">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`flex items-start gap-2 py-1 text-sm rounded-lg px-2 hover:bg-blue-50 hover:text-blue-700 transition-colors group ${
              it.level === 3 ? 'pl-6 text-gray-500 text-xs' : 'text-gray-700 font-medium'
            }`}
          >
            <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${it.level === 2 ? 'bg-blue-400 group-hover:bg-blue-600' : 'bg-gray-300 group-hover:bg-blue-400'}`} />
            {it.title}
          </a>
        ))}
      </nav>
    </div>
  );
}

/* ─── Sidebar card ────────────────────────────────────────── */

function SideCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ─── Post links list ─────────────────────────────────────── */

function PostLinksList({ items }) {
  if (!items?.length) return <div className="text-sm text-gray-400 py-1">No articles yet.</div>;
  return (
    <div className="space-y-3">
      {items.map((p) => (
        <Link key={p.slug} href={`/blog/${p.slug}`} className="flex gap-3 group">
          {p.coverImage && (
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <Image src={p.coverImage} alt={p.title} fill className="object-cover" sizes="56px" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-gray-400 mb-0.5">{p.date ? new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
            <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {p.title}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─── Reading progress ────────────────────────────────────── */

function ReadingProgressBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200/60">
      <div id="reading-bar" className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-none" style={{ width: '0%' }} />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var b=document.getElementById('reading-bar');if(!b)return;window.addEventListener('scroll',function(){var e=document.documentElement,s=e.scrollTop,t=e.scrollHeight-e.clientHeight;b.style.width=t>0?Math.round(s/t*100)+'%':'0%';},{passive:true});})();`,
        }}
      />
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  const canonicalUrl = `${SITE_URL}/blog/${post.meta.slug}`;
  const readTime = estimateReadTime(post.content);
  const tocItems = extractToc(post.content);
  const recent = getRecentPosts({ limit: 5, excludeSlug: post.meta.slug });
  const related = getRelatedPosts({ post, limit: 4 });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.excerpt || '',
    url: canonicalUrl,
    datePublished: post.meta.date || undefined,
    dateModified: post.meta.date || undefined,
    author: { '@type': 'Organization', name: post.meta.author || 'Earnko' },
    publisher: {
      '@type': 'Organization',
      name: 'Earnko',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    ...(post.meta.coverImage ? { image: `${SITE_URL}${post.meta.coverImage}` } : {}),
  };

  return (
    <>
      <Navbar/>
      <JsonLd data={jsonLd} />
      <ReadingProgressBar />
      <div className="min-h-screen mt-[80px] bg-[#f8f9fc]">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 min-h-[340px] md:min-h-[380px]">
       
          {/* Mesh overlay */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl" />
          </div>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)', backgroundSize: '28px 28px' }} />

          <div className="relative container mx-auto px-4 py-12 md:py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-blue-200 mb-6 flex-wrap" aria-label="breadcrumb">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              <span className="text-white/60 line-clamp-1 max-w-[200px]">{post.meta.title}</span>
            </nav>

            {/* Tags */}
            {Array.isArray(post.meta.tags) && post.meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.meta.tags.slice(0, 5).map((t) => (
                  <span key={t} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 ring-1 ring-white/20 text-white tracking-wide">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight max-w-3xl">
              {post.meta.title}
            </h1>

            {post.meta.excerpt && (
              <p className="mt-4 text-blue-100 text-base md:text-lg max-w-2xl leading-relaxed">
                {post.meta.excerpt}
              </p>
            )}

            {/* Meta pills */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 ring-1 ring-white/20">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-white text-[10px] font-bold">
                  {(post.meta.author || 'E').slice(0, 1).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-white">{post.meta.author || 'Earnko'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 ring-1 ring-white/20">
                <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-xs font-semibold text-white">{formatDate(post.meta.date)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 ring-1 ring-white/20">
                <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-semibold text-white">{readTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cover image strip below hero (prominent display) ── */}
        {post.meta.coverImage && (
          <div className="container mx-auto px-4">
            <div className="relative -mt-10 rounded-2xl overflow-hidden shadow-xl border border-white h-56 md:h-72 lg:h-[480px] max-w-4xl mx-auto">
              <Image
                src={post.meta.coverImage}
                alt={post.meta.title}
                fill
                className="object-fit"
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
          </div>
        )}

        {/* ── Main 3-col grid ──────────────────────────────── */}
        <div className={`container mx-auto px-4 ${post.meta.coverImage ? 'py-8' : 'py-10'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left sidebar */}
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="sticky top-20 space-y-5">
                <Toc items={tocItems} />
                <SideCard
                  title="Quick links"
                  icon={<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                >
                  <div className="space-y-1">
                    {[
                      { href: '/stores', label: '🏪 Browse Stores' },
                      { href: '/dashboard/affiliate', label: '🔗 Generate Affiliate Link' },
                      { href: '/contact', label: '💬 Contact Support' },
                      { href: '/blog', label: '📰 Back to Blog' },
                    ].map(({ href, label }) => (
                      <Link key={href} href={href} className="flex items-center justify-between text-sm text-blue-600 hover:text-blue-800 font-semibold py-1.5 border-b border-gray-100 last:border-0 group">
                        <span>{label}</span>
                        <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                      </Link>
                    ))}
                  </div>
                </SideCard>
              </div>
            </aside>

            {/* Article */}
            <main className="lg:col-span-6 order-1 lg:order-2">
              <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

                <div className="p-6 md:p-10">
                  {/* MDX content — styled via .blog-content in globals.css */}
                  <div className="blog-content">
                    <MDXRemote source={post.content} />
                  </div>

                  {/* Tags footer */}
                  {Array.isArray(post.meta.tags) && post.meta.tags.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-gray-100">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {post.meta.tags.map((t) => <TagBadge key={t} tag={t} />)}
                      </div>
                    </div>
                  )}

                  {/* Author bar */}
                  <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
                        {(post.meta.author || 'E').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Written by</div>
                        <div className="font-extrabold text-gray-900">{post.meta.author || 'Earnko'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Affiliate marketing + link tracking guides by Earnko team.</div>
                      </div>
                    </div>
                    <Link href="/dashboard/affiliate" className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-blue-200 transition">
                      Create a Link →
                    </Link>
                  </div>
                </div>
              </article>

              {/* Prev / Next */}
              {recent.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Link href={`/blog/${recent[0]?.slug}`} className="group flex flex-col p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition">
                    <span className="text-xs text-gray-400 mb-1">← Previous</span>
                    <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">{recent[0]?.title}</span>
                  </Link>
                  {recent[1] && (
                    <Link href={`/blog/${recent[1]?.slug}`} className="group flex flex-col p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition text-right">
                      <span className="text-xs text-gray-400 mb-1">Next →</span>
                      <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">{recent[1]?.title}</span>
                    </Link>
                  )}
                </div>
              )}
            </main>

            {/* Right sidebar */}
<aside className="lg:col-span-3 order-3">
  <div className="lg:sticky lg:top-24 self-start space-y-5">
                {/* Author */}
                <SideCard
                  title="Author"
                  icon={<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-base flex-shrink-0">
                      {(post.meta.author || 'E').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-gray-900 text-sm">{post.meta.author || 'Earnko'}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">Tips and best practices for creators and affiliates.</div>
                      <a href="mailto:contact@earnko.com" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                        contact@earnko.com
                      </a>
                    </div>
                  </div>
                </SideCard>

                {/* CTA */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white">
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                  <div className="relative z-10">
                    <div className="text-base font-extrabold">Ready to earn?</div>
                    <p className="text-blue-100 text-xs mt-1 leading-relaxed">Generate affiliate links and track conversions in real-time.</p>
                    <Link href="/dashboard/affiliate" className="mt-4 flex items-center justify-center gap-1 py-2 rounded-xl bg-white text-blue-600 text-xs font-extrabold hover:shadow-lg transition">
                      Generate Link →
                    </Link>
                  </div>
                </div>

                {/* Related */}
                <SideCard
                  title="Related articles"
                  icon={<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                >
                  <PostLinksList items={related} />
                </SideCard>

                {/* Recent */}
                <SideCard
                  title="Recent articles"
                  icon={<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                >
                  <PostLinksList items={recent} />
                </SideCard>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}