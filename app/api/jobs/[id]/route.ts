import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { deleteJobCascade } from '@/lib/cascade';
import { updateJobSchema } from '@/lib/validators';

const SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(job);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const nextReq = req as unknown as NextRequest;
    const token = await getToken({ req: nextReq, secret: SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = (token as any).role as string | undefined;
    if (!role || (role !== 'employer' && role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.job.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // If not admin, ensure the employer owns the job
    const userId = token.sub as string;
    if (role !== 'admin' && existing.employerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const parse = updateJobSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Validation failed', details: parse.error.flatten() }, { status: 400 });
    }
    const { title, description, company, location, salary } = parse.data;
    const updated = await prisma.job.update({ where: { id: params.id }, data: { title, description, company, location, salary } });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const nextReq = req as unknown as NextRequest;
    const token = await getToken({ req: nextReq, secret: SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = (token as any).role as string | undefined;
    if (!role || (role !== 'employer' && role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.job.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const userId = token.sub as string;
    if (role !== 'admin' && existing.employerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Use cascade helper to remove applications and the job atomically
    await deleteJobCascade(params.id);
    return NextResponse.json({}, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
