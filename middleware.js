// middleware.js
import { NextResponse } from 'next/server';

const PROTECTED_PREFIX = '/investor-hub';

function setUnlockCookie(res) {
  res.headers.set(
    'Set-Cookie',
    'site_unlocked=1; Max-Age=2592000; Path=/; HttpOnly; Secure; SameSite=Lax'
  );
}

export function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;

  // HARD GUARD: if it's not /investor-hub... bail out immediately.
  if (!pathname.startsWith(PROTECTED_PREFIX)) return NextResponse.next();

  // Allow the unlock page itself
  if (pathname === '/unlock' || pathname === '/unlock.html') {
    return NextResponse.next();
  }

  // Already unlocked?
  const unlocked = req.cookies.get('site_unlocked')?.value === '1';
  if (unlocked) return NextResponse.next();

  // Token unlock (?access=TOKEN)
  const token = searchParams.get('access');
  const expected = process.env.ACCESS_TOKEN;
  if (token && expected && token === expected) {
    const res = NextResponse.redirect(new URL(pathname, req.url)); // remove query
    setUnlockCookie(res);
    return res;
  }

  // Otherwise, send to unlock
  const unlock = new URL('/unlock.html', req.url);
  unlock.searchParams.set('r', pathname + (req.nextUrl.search || ''));
  return NextResponse.redirect(unlock);
}

// EXTRA guard via matcher too
export const config = {
  matcher: ['/investor-hub', '/investor-hub/', '/investor-hub/:path*'],
};
    '/docs/:path*'
  ],
};
