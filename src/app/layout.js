import './globals.css';
import { Providers } from '../context/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  // Use your production site URL for absolute OpenGraph/Twitter links
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://earnko.in'),

  title: {
    default: 'Earnko — Earn by Sharing',
    template: '%s · Earnko'
  },
  description:
    'Earnko is an affiliate marketing platform for creators and shoppers in India to earn commissions and cashback by sharing product links.',
  applicationName: 'Earnko',
  keywords: [
    'Earnko',
    'affiliate',
    'cashback',
    'commissions',
    'links',
    'UPI',
    'India',
    'influencer'
  ],
  authors: [{ name: 'Earnko' }],
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
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.earnko.com',
    title: 'Earnko — Earn by Sharing',
    siteName: 'Earnko',
    description:
      'Affiliate marketing platform to earn commissions and cashback on products you love.',
    images: [
      {
        url: '/images/earnko-logo.png', // place this in /public
        width: 1200,
        height: 630,
        alt: 'Earnko — Earn by Sharing'
      }
    ]
  },

  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Earnko — Earn by Sharing',
  //   description:
  //     'Affiliate marketing platform to earn commissions and cashback on products you love.',
  //   images: ['/og-image.png'], // place this in /public
  //   creator: '@earnko'
  // },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Earnko'
  },

  category: 'technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}