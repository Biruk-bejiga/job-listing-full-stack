import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from './prisma';

const SECRET = process.env.NEXTAUTH_SECRET;

/**
 * Read next-auth token from a Request (App Router API route Request)
 */
export async function getTokenFromRequest(req: Request) {
  const nextReq = req as unknown as NextRequest;
  const token = await getToken({ req: nextReq, secret: SECRET });
  return token;
}

/**
 * Require authentication and optional role check.
 * Returns { ok: true, token } on success or { ok: false, response } on failure.
 */
export async function requireAuth(req: Request, roles?: string[]) {
  const token = await getTokenFromRequest(req);
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (roles && roles.length > 0) {
    const role = (token as any).role as string | undefined;
    if (!role || !roles.includes(role)) {
      return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }
  }

  return { ok: true, token };
}

/**
 * Check ownership for resources. Currently supports 'job'.
 * Returns { ok: true } if owner or admin, otherwise { ok: false, response }.
 */
export async function requireOwnership(req: Request, resource: 'job', resourceId: string) {
  const res = await requireAuth(req);
  if (!res.ok) return res;
  const token = res.token as any;

  // admins bypass ownership checks
  if (token.role === 'admin') return { ok: true };

  if (resource === 'job') {
    const job = await prisma.job.findUnique({ where: { id: resourceId } });
    if (!job) return { ok: false, response: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
    if (job.employerId !== token.sub) {
      return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }
    return { ok: true };
  }

  return { ok: false, response: NextResponse.json({ error: 'Unsupported resource' }, { status: 400 }) };
}

/**
 * Usage example in an API route:
 *
 * const { ok, response, token } = await requireAuth(req, ['employer']);
 * if (!ok) return response;
 * // token.sub contains user id
 */

export default {};
