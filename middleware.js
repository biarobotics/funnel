// middleware.js
import { NextResponse } from 'next/server';

// Helper to create Set-Cookie header (Edge-friendly)
function makeSetCookie(name, value, opts = {}) {
  const parts = [`${name}=${value}`];
  if (opts.maxAge) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.secure) parts.push('Secure');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  return parts.join('; ');
}

export function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Allow Next internals, static assets used by build, and the unlock page + public files
  const allowlist = [
    /^\/_next\//,
    /^\/favicon.ico$/,
    /^\/robots.txt$/,
    /^\/unlock(\.html)?$/,
    /^\/assets\//, // optional: images or css you want public
  ];
  if (allowlist.some((re) => re.test(pathname))) return NextResponse.next();

  // Read cookie
  const cookie = req.cookies.get('site_unlocked')?.value;

  // If cookie present and equals '1', allow
  if (cookie === '1') return NextResponse.next();

  // If query param ?access=TOKEN is present and matches env ACCESS_TOKEN -> set cookie and redirect
  const accessToken = req.nextUrl.searchParams.get('access');
  const expected = process.env.ACCESS_TOKEN; // set this in Vercel

  if (accessToken && expected && accessToken === expected) {
    // Set cookie for 30 days
    const res = NextResponse.redirect(req.nextUrl.pathname);
    const sc = makeSetCookie('site_unlocked', '1', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/'
    });
    res.headers.set('Set-Cookie', sc);
    return res;
  }

  // Otherwise redirect to unlock page (preserve original path as ?r=original to optionally link back)
  const redirectTo = new URL('/unlock.html', req.url);
  redirectTo.searchParams.set('r', req.nextUrl.pathname + (req.nextUrl.search || ''));
  return NextResponse.redirect(redirectTo);
}

// Apply middleware site-wide except _next/static assets (handled in allowlist)
export const config = {
  matcher: ['/((?!_next/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map|txt)).*)']
};
