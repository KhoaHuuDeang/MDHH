'use client'
import { SessionProvider } from 'next-auth/react'
import { ToastContainer } from 'react-toastify'
import { ReactNode } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from "@/components/layout/user/Sidebar";
import SidebarItems from "@/data/SidebarItems";
import  {mockUserData}  from '@/data/MockUser'
import profileItems from '@/data/profileMenuItem'
interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <Sidebar navItems={SidebarItems} userItems={profileItems} user = {mockUserData}/>
      <ToastContainer position="top-right" autoClose={3000} />
      {children}
    </SessionProvider>
  )
}
