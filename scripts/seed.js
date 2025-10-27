#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'birukbejga8@gmail.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: 'Admin User', role: 'admin' },
    create: { email: adminEmail, name: 'Admin User', role: 'admin' }
  });
  console.log('Admin:', admin.email, admin.id);

  // Create employer
  const employerEmail = process.env.SEED_EMPLOYER_EMAIL || 'birukbejga8@gmail.com';
  const employer = await prisma.user.upsert({
    where: { email: employerEmail },
    update: { name: 'Acme Employer', role: 'employer' },
    create: { email: employerEmail, name: 'Acme Employer', role: 'employer' }
  });
  console.log('Employer:', employer.email, employer.id);

  // Create developer
  const devEmail = process.env.SEED_DEV_EMAIL || 'birukbejga8@gmail.com';
  const developer = await prisma.user.upsert({
    where: { email: devEmail },
    update: { name: 'Dev User', role: 'developer' },
    create: { email: devEmail, name: 'Dev User', role: 'developer' }
  });
  console.log('Developer:', developer.email, developer.id);

  // Create jobs (ensure idempotent)
  const job1 = await prisma.job.create({
    where: { title: 'Backend Engineer' },
    update: {},
    create: {
      title: 'Backend Engineer',
      description: 'Work on APIs and services.',
      company: 'Acme Co',
      location: 'Remote',
      salary: '$100k-$130k',
      employerId: employer.id
    }
  });

  const job2 = await prisma.job.upsert({
    where: { title: 'Frontend Engineer' },
    update: {},
    create: {
      title: 'Frontend Engineer',
      description: 'Work on React and UI.',
      company: 'Acme Co',
      location: 'Remote',
      salary: '$90k-$120k',
      employerId: employer.id
    }
  });

  console.log('Jobs created:', job1.id, job2.id);

  // Create an application by developer to job1
  const existingApp = await prisma.application.findFirst({ where: { jobId: job1.id, applicantId: developer.id } });
  if (!existingApp) {
    const app = await prisma.application.create({
      data: {
        jobId: job1.id,
        applicantId: developer.id,
        resumeURL: 'https://example.com/resume.pdf',
        coverLetter: 'I am excited to apply.'
      }
    });
    console.log('Application created:', app.id);
  } else {
    console.log('Application already exists:', existingApp.id);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
