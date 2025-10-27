import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const application = await prisma.application.create({ data: body });
  return NextResponse.json(application, { status: 201 });
}
