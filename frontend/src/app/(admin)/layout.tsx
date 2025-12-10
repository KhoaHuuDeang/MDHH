import profileItems from '@/data/profileMenuItem'
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminLayoutClient from '@/components/layout/admin/AdminLayoutClient';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Server-side authentication validation for ALL admin routes
    const session = await getServerSession(authOptions);
    
    // Authentication guards
    if (!session) {
        redirect('/auth');
    }
    
    // Role-based access control
    if (session.user.role !== "ADMIN") {
        redirect('/home?error=unauthorized');
    }

    // Create real user data from session
    const realUserData = {
        initials: (session.user?.displayname || session.user?.username)?.substring(0, 2).toUpperCase() || 'AD',
        name: session.user?.displayname || session.user?.username || 'Admin User',
        email: session.user?.email || 'admin@example.com',
        avatar: session.user?.avatar || '/logo.svg',
        role: session.user?.role
    };

    // Dynamic sidebar items based on role
    const isAdmin = session.user?.role === "ADMIN";
    const { AdminSidebarItems, SidebarItems } = await import("@/data/SidebarItems");
    const sidebarItems = isAdmin ? AdminSidebarItems : SidebarItems;

    return (
        <AdminLayoutClient
            sidebarItems={sidebarItems}
            profileItems={profileItems}
            userData={realUserData}
        >
            {children}
        </AdminLayoutClient>
    );
}