// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/layout/admin/AdminDashboard';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  return <AdminDashboard />;
}