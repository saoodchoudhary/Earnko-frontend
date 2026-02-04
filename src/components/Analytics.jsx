'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-9EWWM5JE3M';

export default function Analytics() {
  const pathname = usePathname();

  // Push a page_view on route changes (App Router)
  useEffect(() => {
    if (!MEASUREMENT_ID) return;

    // Ensure gtag is available
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', MEASUREMENT_ID, {
        page_path: pathname,
        page_location: typeof window !== 'undefined' ? window.location.href : undefined,
        page_title: typeof document !== 'undefined' ? document.title : undefined
      });
    }
  }, [pathname]);

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Initial page load
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}', {
            page_path: window.location.pathname
          });
          // Expose for later usage
          window.gtag = window.gtag || gtag;
        `}
      </Script>
    </>
  );
}