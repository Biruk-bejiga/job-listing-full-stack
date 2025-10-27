import NavBar from '../components/NavBar';
import { prisma } from '../lib/prisma';

export default async function Home() {
  const jobs = await prisma.job.findMany({ take: 10, orderBy: { createdAt: 'desc' } });

  return (
    <main>
      <NavBar />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Latest Jobs</h1>
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="p-4 bg-white rounded shadow">
              <a href={`/jobs/${job.id}`} className="text-lg font-semibold">{job.title}</a>
              <div className="text-sm text-gray-600">{job.company} • {job.location}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
