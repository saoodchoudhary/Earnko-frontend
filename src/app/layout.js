import './globals.css';
import { Providers } from '../context/Providers';
import { Toaster } from 'react-hot-toast';
import Analytics from '@/components/Analytics';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.earnko.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'Earnko — Earn Money by Sharing Affiliate Links in India',
    template: '%s | Earnko'
  },
  description:
    'Earnko is India\'s trusted affiliate marketing platform. Generate affiliate links for Flipkart, Myntra, Nykaa & 500+ stores, earn commissions and cashback, and withdraw instantly via UPI.',
  applicationName: 'Earnko',
  keywords: [
    'Earnko',
    'earnko affiliate',
    'earnko app',
    'earnko.com',
    'affiliate marketing India',
    'earn money online India',
    'affiliate link generator India',
    'earn commissions India',
    'cashback affiliate India',
    'Flipkart affiliate',
    'Myntra affiliate',
    'Nykaa affiliate',
    'affiliate platform India',
    'earn by sharing links',
    'creator monetization India',
    'UPI earnings',
    'influencer affiliate platform',
    'best affiliate platform India',
    'passive income India',
    'online paise kamao',
    'paise kamane wala app',
    'affiliate marketing kaise kare'
  ],
  authors: [{ name: 'Earnko', url: SITE_URL }],
  creator: 'Earnko',
  publisher: 'Earnko',

  alternates: {
    canonical: '/'
  },

  // Favicons and icons
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#0ea5e9' }
    ]
  },

  manifest: '/site.webmanifest',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    title: 'Earnko — Earn Money by Sharing Affiliate Links in India',
    siteName: 'Earnko',
    description:
      'India\'s trusted affiliate marketing platform. Generate links for 500+ stores, earn commissions & cashback, and withdraw via UPI instantly.',
    images: [
      {
        url: '/images/earnko-logo.png',
        width: 1200,
        height: 630,
        alt: 'Earnko — Earn Money by Sharing Affiliate Links in India'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Earnko — Earn Money by Sharing Affiliate Links in India',
    description:
      'India\'s trusted affiliate marketing platform. Generate links for 500+ stores, earn commissions & cashback, and withdraw via UPI instantly.',
    images: ['/images/earnko-logo.png'],
    creator: '@earnko'
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Earnko'
  },

  category: 'technology',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Earnko',
      alternateName: ['Earnko Affiliate', 'Earnko India'],
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/earnko-logo.png`,
        width: 512,
        height: 512
      },
   sameAs: [
  'https://www.linkedin.com/in/earn-ko-65311b3a5/',
  'https://www.instagram.com/earnko_official'
]
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Earnko',
      alternateName: 'Earnko',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-IN'
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <Analytics/>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}