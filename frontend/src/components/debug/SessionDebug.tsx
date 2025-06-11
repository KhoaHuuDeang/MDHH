'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function SessionDebug() {
  const { data: session } = useSession()
  const [cookieInfo, setCookieInfo] = useState<any>({})

  useEffect(() => {
    // Check cookies
    const cookies = document.cookie
    const sessionCookie = cookies
      .split('; ')
      .find(row => row.startsWith('next-auth.session-token=') || row.startsWith('__Secure-next-auth.session-token='))
    
    // Check localStorage
    const localStorageKeys = Object.keys(localStorage)
    const nextAuthLS = localStorageKeys.filter(key => key.includes('next-auth'))

    setCookieInfo({
      hasCookie: !!sessionCookie,
      cookieValue: sessionCookie ? 'Found (check if accessible)' : 'Not found',
      localStorageKeys: nextAuthLS,
      canAccessFromJS: !!sessionCookie // If we can see it, it's not httpOnly
    })
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Session Debug Info</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Session Data:</h3>
        <pre className="bg-white p-2 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Storage Analysis:</h3>
        <ul className="list-disc ml-4">
          <li>Cookie found: {cookieInfo.hasCookie ? '✅' : '❌'}</li>
          <li>Accessible from JavaScript: {cookieInfo.canAccessFromJS ? '⚠️ YES (Security Risk)' : '✅ NO (HttpOnly)'}</li>
          <li>LocalStorage keys: {cookieInfo.localStorageKeys?.join(', ') || 'None'}</li>
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-red-600">Security Issues:</h3>
        <ul className="list-disc ml-4 text-red-600">
          {session?.accessToken && (
            <li>⚠️ Backend accessToken exposed in session</li>
          )}
          {cookieInfo.canAccessFromJS && (
            <li>⚠️ Session cookie accessible from JavaScript (XSS risk)</li>
          )}
        </ul>
      </div>

      <div className="bg-yellow-100 p-3 rounded">
        <h4 className="font-semibold">Recommendations:</h4>
        <ul className="list-disc ml-4 text-sm">
          <li>Remove accessToken from session object</li>
          <li>Store accessToken securely server-side</li>
          <li>Use server actions for API calls</li>
          <li>Ensure cookies have httpOnly flag</li>
        </ul>
      </div>
    </div>
  )
}
