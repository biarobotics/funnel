// middleware.js
import { NextResponse } from 'next/server';

// Build a Set-Cookie header (Edge-safe)
function setUnlockCookie(res) {
  // 30 days
  res.headers.set(
    'Set-Cookie',
    'site_unlocked=1; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Lax'
  );
}

export function middleware(req) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // If already unlocked via cookie → allow
  const unlocked = req.cookies.get('site_unlocked')?.value === '1';
  if (unlocked) return NextResponse.next();

  // If access token present and correct → set cookie and allow
  const token = url.searchParams.get('access');
  const expected = process.env.ACCESS_TOKEN; // <-- set this in Vercel Env Vars

  if (token && expected && token === expected) {
    const res = NextResponse.redirect(new URL(pathname, req.url));
    setUnlockCookie(res);
    return res;
  }

  // Otherwise send to unlock page (preserve return path)
  const unlock = new URL('/unlock.html', req.url);
  unlock.searchParams.set('r', pathname + (url.search || ''));
  return NextResponse.redirect(unlock);
}

// IMPORTANT: limit the middleware to ONLY the private routes
export const config = {
  matcher: [
    '/investor-hub',
    '/investor-hub/:path*',
    '/docs/:path*'
  ],
};
