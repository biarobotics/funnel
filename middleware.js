// middleware.js — gate ONLY private areas (investor-hub, docs)
import { NextResponse } from 'next/server';

function setUnlockCookie(res) {
  res.headers.set(
    'Set-Cookie',
    'site_unlocked=1; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Lax'
  );
}

export function middleware(req) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // already unlocked?
  if (req.cookies.get('site_unlocked')?.value === '1') {
    return NextResponse.next();
  }

  // token-based unlock: https://yoursite/?access=YOUR_TOKEN
  const token = url.searchParams.get('access');
  const expected = process.env.ACCESS_TOKEN;
  if (token && expected && token === expected) {
    const res = NextResponse.redirect(new URL(pathname, req.url));
    setUnlockCookie(res);
    return res;
  }

  // Private sections only
  const isPrivate =
    pathname === '/investor-hub' ||
    pathname.startsWith('/investor-hub/') ||
    pathname.startsWith('/docs/');

  if (isPrivate) {
    const u = new URL('/unlock.html', req.url);
    u.searchParams.set('r', pathname + (url.search || ''));
    return NextResponse.redirect(u);
  }

  return NextResponse.next();
}

// !! CRITICAL: run only on private routes
export const config = {
  matcher: ['/investor-hub', '/investor-hub/:path*', '/docs/:path*']
};
