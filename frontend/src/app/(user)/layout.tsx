import DisabledGuard from "@/components/guards/DisabledGuard";
import UserLayoutClient from "@/components/layout/user/UserLayoutClient";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DisabledGuard>
      <UserLayoutClient>
        {children}
      </UserLayoutClient>
    </DisabledGuard>
  );
}