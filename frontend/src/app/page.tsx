'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const {data : session, status}= useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Full-Stack Auth App
        </h1>
        
        <p className="text-gray-600 mb-8">
          Next.js + NestJS + PostgreSQL + Prisma
        </p>

        {status === 'loading' && (
          <div className="text-gray-500">Loading...</div>
        )}

        {status === 'unauthenticated' && (
          <div className="space-y-4">
            <p className="text-gray-700">Please sign in to continue</p>
            <Link
              href="/auth/signin"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {status === 'authenticated' && session && (
          <div className="space-y-4">
            <p className="text-green-700">
              Welcome back, <strong>{session.user.name}</strong>!
            </p>
            <p className="text-sm text-gray-600">
              Role: <span className="font-semibold">{session.user.role}</span>
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
