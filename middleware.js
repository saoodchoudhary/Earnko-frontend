import { NextResponse } from 'next/server';

const RESERVED_ROUTES = new Set([
  '',

  // public pages
  'about',
  'contact',
  'privacy',
  'privacy-policy',
  'terms',
  'terms-and-conditions',

  // ✅ blog (SEO pages)
  'blog',

  // auth / app
  'login',
  'register',
  'oauth',
  'stores',
  'products',
  'dashboard',
  'admin',

  // common files
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
]);

function isLikelyShortCode(code) {
  if (!code) return false;
  if (code.length < 4 || code.length > 32) return false;

  // avoid purely numeric
  if (/^\d+$/.test(code)) return false;

  // allow only URL-safe short tokens
  return /^[a-zA-Z0-9_-]+$/.test(code);
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // ✅ Always allow blog routes (both /blog and /blog/<slug>)
  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    return NextResponse.next();
  }

  // Skip Next internals, API, and static files
  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // any file like .png, .css, .js etc.
  ) {
    return NextResponse.next();
  }

  // If path has multiple segments, it's a real route, don't treat as shortlink
  // e.g. /dashboard/affiliate, /products/123
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) {
    return NextResponse.next();
  }

  const code = segments[0];

  // Skip known/reserved routes so pages work when logged out too
  if (RESERVED_ROUTES.has(code)) {
    return NextResponse.next();
  }

  // Only redirect if it looks like a short code
  if (!isLikelyShortCode(code)) {
    return NextResponse.next();
  }

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  if (!backend) return NextResponse.next();

  return NextResponse.redirect(
    new URL(`${backend.replace(/\/+$/, '')}/r/${encodeURIComponent(code)}`)
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};