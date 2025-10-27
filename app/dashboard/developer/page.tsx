import NavBar from '../../../components/NavBar';
import { prisma } from '../../../lib/prisma';
import { getServerAuthSession } from '../../../lib/auth';
import { redirect } from 'next/navigation';

export default async function DeveloperDashboard() {
  const session = await getServerAuthSession();
  if (!session) return redirect('/api/auth/signin');
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (role !== 'developer' && role !== 'admin') return redirect('/api/auth/signin');

  const applications = await prisma.application.findMany({ where: { applicantId: userId }, orderBy: { createdAt: 'desc' }, include: { job: true } });

  return (
    <main>
      <NavBar />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Developer Dashboard</h1>

        <div className="grid gap-4">
          {applications.length === 0 && <div className="text-gray-600">You haven't applied to any jobs yet.</div>}
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{app.job.title}</h3>
                  <div className="text-sm text-gray-600">{app.job.company} • {app.job.location}</div>
                </div>
                <div className="text-sm text-gray-500">Applied {new Date(app.createdAt).toLocaleString()}</div>
              </div>
              {app.coverLetter && <div className="mt-3 whitespace-pre-line text-sm">{app.coverLetter}</div>}
              {app.resumeURL && <div className="mt-2"><a href={app.resumeURL} className="text-blue-600">View resume</a></div>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
