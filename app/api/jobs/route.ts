import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const job = await prisma.job.create({ data: body });
  return NextResponse.json(job, { status: 201 });
}
