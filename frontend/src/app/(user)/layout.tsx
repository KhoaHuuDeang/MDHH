// import { authOptions } from "@/lib/auth";
import SidebarItems from "@/data/SidebarItems";
import { mockUserData } from '@/data/MockUser'
import profileItems from '@/data/profileMenuItem'
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
import Footer from "@/components/layout/user/Footer";
import Sidebar from "@/components/layout/user/Sidebar";
import Header from "@/components/layout/user/Header";
export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   redirect('/auth/signin');
  // }

  // Create user data from session
  // const userData = {
  //   initials: session.user?.name?.substring(0, 2).toUpperCase() || 'UN',
  //   name: session.user?.name || 'Unknown User',
  //   email: session.user?.email || 'unknown@email.com'
  // };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar - Hidden on mobile by default */}
      <div className="hidden lg:flex">
        <Sidebar
          navItems={SidebarItems}
          userItems={profileItems}
          user={mockUserData}
        />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Vùng nội dung chính */}
        <main className="flex-1 overflow-auto  bg-white text-gray-900">
          {/* Header */}
          <Header userProps={mockUserData} HeaderItems={profileItems} />
          {/* Footer */}
          {children}
          <Footer />
        </main>


      </div>
    </div>
  );
}