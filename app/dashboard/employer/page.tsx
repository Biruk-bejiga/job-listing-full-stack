import NavBar from '../../../components/NavBar';
import JobCardEmployer from '../../../components/JobCardEmployer';
import { prisma } from '../../../lib/prisma';
import { getServerAuthSession } from '../../../lib/auth';
import { redirect } from 'next/navigation';

export default async function EmployerDashboard() {
  const session = await getServerAuthSession();
  if (!session) return redirect('/api/auth/signin');
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (role !== 'employer' && role !== 'admin') return redirect('/api/auth/signin');

  const jobs = await prisma.job.findMany({ where: { employerId: userId }, orderBy: { createdAt: 'desc' } });

  return (
    <main>
      <NavBar />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Employer Dashboard</h1>

        <div className="grid gap-4">
          {jobs.length === 0 && <div className="text-gray-600">You haven't posted any jobs yet.</div>}
          {jobs.map((job) => (
            <JobCardEmployer key={job.id} job={job} onDeleted={(id: string) => {
              // client components handle removal via revalidation or refresh; simple page-level redirect not implemented here
              // Could implement optimistic UI or re-fetch via SWR in future
            }} onUpdated={(updated: any) => {
              // similarly handle updates
            }} />
          ))}
        </div>
      </div>
    </main>
  );
}
