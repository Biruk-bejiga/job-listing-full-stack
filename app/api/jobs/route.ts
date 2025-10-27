import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createJobSchema } from '@/lib/validators';

const SECRET = process.env.NEXTAUTH_SECRET;

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(jobs);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Authorization: only employer or admin
  // next-auth getToken expects a NextRequest-like object in App Router API routes.
  // The global Request is compatible for cookies reading by next-auth in newer versions,
  // but to be safe we coerce to NextRequest where necessary.
  const nextReq = req as unknown as NextRequest;
  const token = await getToken({ req: nextReq, secret: SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = (token as any).role as string | undefined;
    if (!role || (role !== 'employer' && role !== 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const parse = createJobSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Validation failed', details: parse.error.flatten() }, { status: 400 });
    }

    const { title, description, company, location, salary } = parse.data;
    const employerId = token.sub as string;
    const job = await prisma.job.create({ data: { title, description, company, location, salary: salary || null, employerId } });
    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
