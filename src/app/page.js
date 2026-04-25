// app/page.js — NO 'use client'
import Navbar         from '../components/Layout/Navbar';
import Footer         from '../components/Layout/Footer';
import HomePageClient from '../components/home/HomePageClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.earnko.com';

/* ─────────────────────────────────────────
   Homepage-specific metadata
   layout.js ke metadata ko override karta hai
───────────────────────────────────────── */
export const metadata = {
  title: 'Earnko — Earn Money by Sharing Affiliate Links | India\'s #1 Affiliate Platform',
  description:
    'Join 10,000+ Indians earning real commission on Flipkart, Myntra, Nykaa, Amazon & 200+ stores. Generate affiliate links free, earn cashback, withdraw via UPI instantly. Zero investment.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Earnko — Earn Money by Sharing Affiliate Links | India\'s #1 Affiliate Platform',
    description:
      'Join 10,000+ Indians earning real commission on Flipkart, Myntra, Nykaa & 200+ stores. Free signup. Withdraw via UPI.',
    url: SITE_URL,
    type: 'website',
  },
  twitter: {
    title: 'Earnko — Earn Money by Sharing Affiliate Links | India\'s #1 Affiliate Platform',
    description:
      'Join 10,000+ Indians earning real commission on Flipkart, Myntra, Nykaa & 200+ stores. Free signup. Withdraw via UPI.',
  },
};

/* ─────────────────────────────────────────
   Homepage JSON-LD — WebPage + FAQPage
   Google rich results ke liye
───────────────────────────────────────── */
const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: 'Earnko — Earn Money by Sharing Affiliate Links',
      description:
        'India\'s trusted affiliate marketing platform. Generate links for 200+ stores, earn commissions & cashback, withdraw via UPI.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-IN',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Earnko?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Earnko is India\'s affiliate marketing platform where you generate trackable links for 200+ top stores like Flipkart, Myntra, and Nykaa, and earn real commission on every purchase.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Earnko free to join?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Earnko is completely free. No investment required. Sign up in 30 seconds and start generating affiliate links immediately.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I withdraw my Earnko earnings?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can withdraw your Earnko earnings instantly via UPI. Once your commission is confirmed, the amount is credited to your wallet and you can transfer it to any UPI ID.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which stores are available on Earnko?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Earnko supports 200+ Indian stores including Flipkart, Myntra, Nykaa, Amazon, Ajio, and many more.',
          },
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      {/* Homepage-specific JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Navbar />
      <HomePageClient />
      <Footer />
    </>
  );
}