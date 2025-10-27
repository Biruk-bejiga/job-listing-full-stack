# Job Listing Full Stack (Next.js + Prisma + MongoDB + NextAuth + Tailwind)

This repository is a starter scaffold for a job listing application built with Next.js App Router, Prisma (MongoDB), NextAuth (Google provider), and Tailwind CSS.

## Features
- Two roles: Developer and Employer
- Developers: browse jobs, view job details, apply for jobs
- Employers: post, edit, delete jobs

## Folder structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components (NavBar, forms, cards)
- `lib/` - shared utilities (Prisma client, auth)
- `prisma/` - Prisma schema
- `public/` - static assets

## Env
Copy `.env.example` to `.env` and fill values.

## Setup

1. Install dependencies

```powershell
cd c:\Projects\job-listing-full-stack
npm install
```

2. Generate Prisma client

```powershell
npx prisma generate
```

3. Push schema to MongoDB (use with caution — use migrations for SQL DBs)

```powershell
npx prisma db push --accept-data-loss
```

4. Run dev server

```powershell
npm run dev
```

## Seed data (optional)

You can populate the database with sample admin, employer, developer, jobs, and one application.

1. Ensure `.env` has `DATABASE_URL` set and you have run prisma push.

2. Run the seed script:

```powershell
npm run seed
```

You can customize emails by setting environment variables before running the script:

```powershell
$env:SEED_ADMIN_EMAIL = 'admin@example.com'
$env:SEED_EMPLOYER_EMAIL = 'employer@example.com'
$env:SEED_DEV_EMAIL = 'dev@example.com'
npm run seed
```

After seeding, sign in using the seeded emails via Google (you may need to create accounts with those emails in your Google OAuth test users), or use the `create-admin` script to create the admin account that you then sign in with.

## Example API calls

List jobs (public):

```powershell
Invoke-RestMethod http://localhost:3000/api/jobs
```

Apply to a job (developer must be authenticated in browser; this example uses curl with cookie/token omitted):

```bash
curl -X POST http://localhost:3000/api/applications \
	-H "Content-Type: application/json" \
	-d '{"jobId":"<JOB_ID>","resumeURL":"https://example.com/resume.pdf","coverLetter":"I am interested."}'
```

Get applications for a developer (admin or the developer themselves):

```powershell
# replace <APPLICANT_ID> with the user's id returned from the seed script
Invoke-RestMethod "http://localhost:3000/api/applications?applicantId=<APPLICANT_ID>"
```

## NextAuth Google setup
- Create OAuth credentials in Google Cloud Console
- Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Set `NEXTAUTH_URL` to your site URL (http://localhost:3000 for local)
- Set `NEXTAUTH_SECRET` (use a strong random value)

### Creating an initial admin

To create the first admin (who can create employer accounts), set the `INITIAL_ADMIN_EMAIL` environment variable and run the included script:

```powershell
$env:INITIAL_ADMIN_EMAIL = 'admin@example.com'; npm run create-admin
```

This will create a user with `role = admin`. After that, sign in with that email via Google (or create the user via the admin UI) to complete the account.

## Prisma Models
See `prisma/schema.prisma` for models: User, Account, Session, VerificationToken, Job, Application.

## Notes
- This is a scaffold. You'll want to add role-based UI, authentication checks in API routes, and improve validation and error handling.
- Designed for MongoDB via Prisma's MongoDB connector.
