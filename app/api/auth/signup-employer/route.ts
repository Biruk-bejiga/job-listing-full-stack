import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

// Role-based employer signup: only authenticated admins can create or upgrade employers.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, email } = body;
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  // Create or return existing user with employer role
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Update role to employer if not already
    if (existing.role !== 'employer') {
      const updated = await prisma.user.update({ where: { email }, data: { role: 'employer', name } as any });
      return NextResponse.json({ user: updated });
    }
    return NextResponse.json({ user: existing });
  }

  const user = await prisma.user.create({ data: { email, name, role: 'employer' } as any });
  return NextResponse.json({ user }, { status: 201 });
}
