import { prisma } from '../../../lib/prisma';
import NavBar from '../../../components/NavBar';
import ApplyForm from '../../../components/ApplyForm';

export default async function JobPage({ params }: { params: { id: string }}) {
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return <div>Job not found</div>;

  return (
    <main>
      <NavBar />
      <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow mt-6">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <div className="text-sm text-gray-600">{job.company} • {job.location}</div>
        <div className="mt-4 whitespace-pre-line">{job.description}</div>

        {/* Apply form (client) */}
        <ApplyForm jobId={job.id} />
      </div>
    </main>
  );
}
