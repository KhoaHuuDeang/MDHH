"use client"

import { useEffect, useState } from 'react';

export default function AuthDebugger() {
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_BACKEND_URL: process.env.NEXTAUTH_BACKEND_URL,
      NODE_ENV: process.env.NODE_ENV,
      // Don't log sensitive vars like secrets
    });
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4">
      <h3 className="font-bold text-sm mb-2">🔧 Auth Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>NEXTAUTH_URL: {envVars.NEXTAUTH_URL || '❌ Not set'}</div>
        <div>BACKEND_URL: {envVars.NEXTAUTH_BACKEND_URL || '❌ Not set'}</div>
        <div>NODE_ENV: {envVars.NODE_ENV}</div>
        <div className="text-blue-600">
          💡 Check browser Network tab for failed requests
        </div>
        <div className="text-blue-600">
          💡 Check browser Console for detailed logs
        </div>
      </div>
    </div>
  );
}
