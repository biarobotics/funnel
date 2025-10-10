// middleware.js — Basic Auth for private pages

// Which paths to protect:
export const config = {
  matcher: [
    '/investor-preview',
    '/investor-preview/(.*)',
    '/investor-hub',
    '/investor-hub/(.*)',
  ],
};

export function middleware(req) {
  // Expect HTTP Basic Authorization header: "Basic base64(user:pass)"
  const auth = req.headers.get('authorization') || '';

  // Build the expected value from environment variables
  const user = process.env.INV_USER;
  const pass = process.env.INV_PASS;

  // If env vars are missing, fail closed
  if (!user || !pass) {
    return new Response('Server config error', { status: 500 });
  }

  // `btoa` is available in the Edge runtime (Web API)
  const expected = 'Basic ' + btoa(`${user}:${pass}`);

  if (auth === expected) {
    // Auth OK → allow request through
    return; // returning undefined continues the chain
  }

  // Not authorized → ask browser to show login prompt
  return new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Investor Area"',
    },
  });
}
