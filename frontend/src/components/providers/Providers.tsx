'use client'
import { SessionProvider } from 'next-auth/react'
import { ToastContainer } from 'react-toastify'
import { ReactNode } from 'react'
import 'react-toastify/dist/ReactToastify.css'
interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      {children}
    </SessionProvider>
  )
}
