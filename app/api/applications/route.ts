import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/authorize';
import { applicationSchema } from '../../../../lib/validators';

const SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, ['developer', 'admin']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const parse = applicationSchema.safeParse(body);
    if (!parse.success) return NextResponse.json({ error: 'Validation failed', details: parse.error.flatten() }, { status: 400 });

    const { jobId, resumeURL, coverLetter } = parse.data;
    const applicantId = (auth.token as any).sub as string;

    // Ensure job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Prevent duplicate applications by same applicant for same job
    const existing = await prisma.application.findFirst({ where: { jobId, applicantId } });
    if (existing) return NextResponse.json({ error: 'Already applied' }, { status: 409 });

    const application = await prisma.application.create({ data: { jobId, applicantId, resumeURL: resumeURL || null, coverLetter: coverLetter || null } });
    return NextResponse.json(application, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const applicantId = url.searchParams.get('applicantId');

    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const token = auth.token as any;

    if (!applicantId) return NextResponse.json({ error: 'applicantId required' }, { status: 400 });

    // only allow admin or the applicant themselves
    if (token.role !== 'admin' && token.sub !== applicantId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const applications = await prisma.application.findMany({ where: { applicantId }, orderBy: { createdAt: 'desc' }, include: { job: true } });
    return NextResponse.json(applications);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
