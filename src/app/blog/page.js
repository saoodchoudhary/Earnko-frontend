import Link from 'next/link';
import Image from 'next/image';
import { getAllPostsMeta } from '@/lib/blog';
import Footer from '@/components/Layout/Footer';
import Navbar from '@/components/Layout/Navbar';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.earnko.com';

export const metadata = {
  title: 'Blog — Affiliate Marketing Tips & Tracking Guides | Earnko',
  description:
    'Earnko Blog — affiliate marketing tips, link tracking guides, cookie attribution, and earning strategies for creators in India.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Earnko Blog — Affiliate & Earning Guides',
    description:
      'Affiliate marketing tips, link tracking guides, and earning strategies for creators in India.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${cls}`}>
      {tag}
    </span>
  );
}

const CARD_GRADS = [
  'from-blue-600 via-blue-500 to-cyan-400',
  'from-violet-500 to-purple-600',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-fuchsia-500 to-pink-600',
];

/* Fallback when no coverImage */
function ImgPlaceholder({ grad, label }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${grad} flex flex-col items-center justify-center relative overflow-hidden`}>
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-4 w-40 h-40 rounded-full bg-white/5" />
      <svg className="relative z-10 w-9 h-9 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {label && (
        <span className="relative z-10 mt-2 text-[10px] font-bold text-white/40 tracking-widest uppercase">{label}</span>
      )}
    </div>
  );
}

function FeaturedCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col lg:flex-row overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 rounded-t-3xl z-10" />

      {/* Thumbnail panel */}
      <div className="lg:w-2/5 min-h-[256px] lg:min-h-[380px] relative flex-shrink-0 overflow-hidden">
        {post.coverImage ? (
          <>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </>
        ) : (
          <ImgPlaceholder grad={CARD_GRADS[0]} />
        )}
        {/* Featured badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase shadow-lg">
            ★ Featured
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(post.tags || []).slice(0, 3).map((t) => <TagBadge key={t} tag={t} />)}
          </div>
          <h2 className="text-xl lg:text-2xl font-bold lg:font-extrabold line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-3 text-gray-500 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(post.author || 'E').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-800">{post.author || 'Earnko'}</div>
              <div className="text-xs text-gray-400">{formatDate(post.date)}</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:gap-2 transition-all">
            Read
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post, index }) {
  const grad = CARD_GRADS[index % CARD_GRADS.length];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Thumbnail or gradient fallback */}
      <div className="relative w-full h-64 overflow-hidden flex-shrink-0">
        {post.coverImage ? (
          <>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
          </>
        ) : (
          <ImgPlaceholder grad={grad} />
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {(post.tags || []).slice(0, 2).map((t) => <TagBadge key={t} tag={t} />)}
        </div>

        <h3 className="text-base font-bold line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
        )}

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
              {(post.author || 'E').slice(0, 1).toUpperCase()}
            </div>
            <span className="text-xs text-gray-400">{formatDate(post.date)}</span>
          </div>
          <span className="text-xs font-bold text-blue-600 group-hover:underline">Read →</span>
        </div>
      </div>
    </Link>
  );
}

function CategoryPill({ label, active }) {
  return (
    <button
      className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
          : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
      }`}
    >
      {label}
    </button>
  );
}

function StatPill({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-blue-200 font-medium mt-0.5">{label}</div>
    </div>
  );
}

export default function BlogPage() {
  const posts = getAllPostsMeta();
  const [featured, ...rest] = posts;
  const allTags = ['All', ...Array.from(new Set(posts.flatMap(p => p.tags || [])))];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
            ],
          }),
        }}
      />
<Navbar />
      <div className="min-h-screen mt-[80px] bg-[#f8f9fc]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-300 rounded-full blur-3xl" />
          </div>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="relative container mx-auto px-4 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 ring-1 ring-white/20 text-white text-xs font-semibold tracking-wide mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                Earnko Knowledge Hub
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight">
                Affiliate Marketing<br />
                <span className="text-cyan-300">Guides & Insights</span>
              </h1>
              <p className="mt-4 text-blue-100 text-lg max-w-xl leading-relaxed">
                Deep-dive guides on link tracking, cookie attribution, conversion analytics, and strategies to grow your affiliate earnings in India.
              </p>
              <div className="mt-10 flex gap-8">
                <StatPill value={posts.length} label="Articles" />
                <div className="w-px bg-white/20" />
                <StatPill value={Array.from(new Set(posts.flatMap(p => p.tags || []))).length} label="Topics" />
                <div className="w-px bg-white/20" />
                <StatPill value="Free" label="Always" />
              </div>
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none -mx-1 px-1">
              {allTags.slice(0, 10).map((t, i) => (
                <CategoryPill key={t} label={t} active={i === 0} />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-500 font-medium">No posts yet.</p>
              <p className="text-sm text-gray-400 mt-1">Add files in <code className="font-mono bg-gray-100 px-1 rounded">src/content/blog</code></p>
            </div>
          ) : (
            <div className="space-y-12">
              {featured && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-black text-blue-600 tracking-widest uppercase">Featured</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  <FeaturedCard post={featured} />
                </div>
              )}
              {rest.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-black text-gray-500 tracking-widest uppercase">All Articles</span>
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">{rest.length} articles</span>
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

        {/* Bottom CTA */}
        <section className="mt-8 mb-16 container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-10 text-center">
            <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold text-white">Ready to start earning?</h2>
              <p className="mt-2 text-blue-100 text-sm max-w-sm mx-auto">
                Generate your affiliate links, track clicks, and optimize your earnings with Earnko.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <Link href="/dashboard/affiliate" className="px-6 py-2.5 rounded-xl bg-white text-blue-600 font-bold text-sm hover:shadow-lg transition">Generate a Link →</Link>
                <Link href="/stores" className="px-6 py-2.5 rounded-xl bg-white/15 ring-1 ring-white/30 text-white font-semibold text-sm hover:bg-white/20 transition">Browse Stores</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    <Footer/>
    </>
  );
}