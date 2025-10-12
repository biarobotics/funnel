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
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Public files and routes (NO gate)
  const allowlist = [
    /^\/_next\//,
    /^\/favicon\.ico$/,
    /^\/robots\.txt$/,
    /^\/unlock(\.html)?$/,
    /^\/success(\.html)?$/,
    /^\/index(\.html)?$/,
    /^\/land(\.html)?$/,   // <-- public
    /^\/build(\.html)?$/,  // <-- public
    /^\/invest(\.html)?$/, // your investor opt-in form stays public
    /^\/assets\//,
    /^\/public\//          // in case assets are referenced that way
  ];
  if (allowlist.some((re) => re.test(pathname))) return NextResponse.next();

  // Everything else requires token (e.g., /investor-hub, docs, etc.)
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

export const config = {
  matcher: ['/((?!_next/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map|txt|pdf)).*)']
};
