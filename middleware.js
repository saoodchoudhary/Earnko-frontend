import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // skip known paths
  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/stores') ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/login') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // treat single segment as short code
  const code = pathname.slice(1);
  if (!code) return NextResponse.next();

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  if (!backend) return NextResponse.next();

  return NextResponse.redirect(new URL(`${backend.replace(/\/+$/, '')}/r/${encodeURIComponent(code)}`));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
