import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminUsersPage from '@/components/admin/AdminUsersPage';

export default async function AdminUsersPageRoute() {
  // Server-side authentication validation
  const session = await getServerSession(authOptions);
  
  // Server-side redirects - no client loading states needed
  if (!session) {
    redirect("/auth");
  }
  
  // Role-based access control on server
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Pure SSR render - instant page load with authentication guaranteed
  return <AdminUsersPage />;
}