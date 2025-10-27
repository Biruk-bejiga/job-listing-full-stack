import NavBar from '../../components/NavBar';
import { prisma } from '../../lib/prisma';
import Link from 'next/link';

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main>
      <NavBar />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">All Jobs</h1>
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="p-4 bg-white rounded shadow">
              <Link href={`/jobs/${job.id}`} className="text-lg font-semibold">{job.title}</Link>
              <div className="text-sm text-gray-600">{job.company} • {job.location}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
