'use client'
import DisabledGuard from "@/components/guards/DisabledGuard";
import UserLayoutClient from "@/components/layout/user/UserLayoutClient";
import I18nProvider from "@/providers/I18nProvider";
import SessionContext from "@/contexts/SessionContext";
import { useSession } from 'next-auth/react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Single source of truth for session - called only once at layout level
  const { data: session, status } = useSession();

  return (
    <SessionContext.Provider value={{ session, status }}>
      <I18nProvider>
        <DisabledGuard session={session} status={status}>
          <UserLayoutClient>
            {children}
          </UserLayoutClient>
        </DisabledGuard>
      </I18nProvider>
    </SessionContext.Provider>
  );
}