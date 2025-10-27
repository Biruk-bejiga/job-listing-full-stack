import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Configure matcher to only run for API routes
export const config = {
  matcher: '/api/:path*'
};

// Define simple role rules based on path + method
const rules = [
  // Admin-only endpoints
  { path: '/api/auth/signup-employer', methods: ['POST'], roles: ['admin'] },

  // Jobs: creating/updating/deleting requires employer or admin
  { pathPrefix: '/api/jobs', methods: ['POST', 'PATCH', 'DELETE'], roles: ['employer', 'admin'] },

  // Applications: creating an application requires developer or admin
  { path: '/api/applications', methods: ['POST'], roles: ['developer', 'admin'] }
];

function matchRule(urlPath: string, method: string) {
  for (const r of rules) {
    if (r.path && r.path === urlPath && r.methods.includes(method)) return r;
    if (r.pathPrefix && urlPath.startsWith(r.pathPrefix) && r.methods.includes(method)) return r;
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const method = req.method || 'GET';

  const rule = matchRule(pathname, method);
  if (!rule) {
    // No rule => allow
    return NextResponse.next();
  }

  // Get token (reads next-auth session token from cookies)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  const role = (token as any).role as string | undefined;
  if (!role || !rule.roles.includes(role)) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'content-type': 'application/json' } });
  }

  return NextResponse.next();
}
