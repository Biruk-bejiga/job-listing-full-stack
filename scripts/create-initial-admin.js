#!/usr/bin/env node
/*
  Create initial admin user using INITIAL_ADMIN_EMAIL env var.
  Usage:
    INITIAL_ADMIN_EMAIL=admin@example.com node scripts/create-initial-admin.js
*/
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL;
  if (!email) {
    console.error('Error: set INITIAL_ADMIN_EMAIL environment variable');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const name = process.env.INITIAL_ADMIN_NAME || 'Admin';
  const user = await prisma.user.create({ data: { email, name, role: 'admin' } });
  console.log('Created admin user:', user.email, 'id=', user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
