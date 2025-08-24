import profileItems from '@/data/profileMenuItem'
import Sidebar from "@/components/layout/user/Sidebar";
import Header from "@/components/layout/user/Header";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
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
        redirect('/');
    }

    // Create real user data from session
    const realUserData = {
        initials: (session.user?.displayname || session.user?.username)?.substring(0, 2).toUpperCase() || 'AD',
        name: session.user?.displayname || session.user?.username || 'Admin User',
        email: session.user?.email || 'admin@example.com',
        role: session.user?.role
    };

    // Dynamic sidebar items based on role
    const isAdmin = session.user?.role === "ADMIN";
    const { AdminSidebarItems, SidebarItems } = await import("@/data/SidebarItems");
    const sidebarItems = isAdmin ? AdminSidebarItems : SidebarItems;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="hidden lg:flex">
                <Sidebar
                    navItems={sidebarItems}
                    userItems={profileItems}
                    user={realUserData}
                />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Vùng nội dung chính */}
                <main className="flex-1 overflow-auto  bg-white text-gray-900">
                    {/* Header */}
                    <Header userProps={realUserData} HeaderItems={profileItems} />
                    {children}
                </main>
            </div>
        </div>
    );
}