import { redirect } from 'next/navigation';
import NavBar from '../../../components/NavBar';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export default async function EmployerDashboard() {
  const session = await getServerSession(authOptions as any);
  if (!session) return redirect('/api/auth/signin');
  const role = (session.user as any).role;
  if (role !== 'employer') return redirect('/api/auth/signin');

  return (
    <main>
      <NavBar />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
        <p>Only employers can see this page.</p>
      </div>
    </main>
  );
}
