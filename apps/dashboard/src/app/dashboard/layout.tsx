import { auth } from "@clerk/nextjs/server";

import { AppSidebar } from "@/components/app/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
