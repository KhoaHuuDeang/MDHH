import DisabledGuard from "@/components/guards/DisabledGuard";
import UserLayoutClient from "@/components/layout/user/UserLayoutClient";
import I18nProvider from "@/providers/I18nProvider";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <DisabledGuard>
        <UserLayoutClient>
          {children}
        </UserLayoutClient>
      </DisabledGuard>
    </I18nProvider>
  );
}