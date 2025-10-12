// middleware.js
import { NextResponse } from 'next/server';

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
  // This middleware only runs on paths defined in `config.matcher` below.
  const cookie = req.cookies.get('site_unlocked')?.value;
  if (cookie === '1') return NextResponse.next();

  const accessToken = req.nextUrl.searchParams.get('access');
  const expected = process.env.ACCESS_TOKEN;

  if (accessToken && expected && accessToken === expected) {
    const res = NextResponse.redirect(req.nextUrl.pathname);
    const sc = makeSetCookie('site_unlocked', '1', {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/'
    });
    res.headers.set('Set-Cookie', sc);
    return res;
  }

  const redirectTo = new URL('/unlock.html', req.url);
  redirectTo.searchParams.set('r', req.nextUrl.pathname + (req.nextUrl.search || ''));
  return NextResponse.redirect(redirectTo);
}

// 👇 ONLY protect these paths.
// Add more private areas as needed (e.g., '/docs/:path*').
export const config = {
  matcher: [
    '/investor-hub',     // hub page
    '/docs/:path*'       // any private docs folder you add later (optional)
  ]
};
