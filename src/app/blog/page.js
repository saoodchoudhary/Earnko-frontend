// src/app/blog/page.js  ← Server Component (SEO + data fetch only)
import { Suspense } from 'react';
import { getAllPostsMeta } from '@/lib/blog';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import BlogClient from './BlogClient';

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

export default function BlogPage() {
  const posts = getAllPostsMeta();

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
      {/* Suspense is REQUIRED when using useSearchParams() inside BlogClient */}
      <Suspense fallback={<div className="min-h-screen mt-[62px] bg-[#f6f7fb]" />}>
        <BlogClient posts={posts} />
      </Suspense>
      <Footer />
    </>
  );
}