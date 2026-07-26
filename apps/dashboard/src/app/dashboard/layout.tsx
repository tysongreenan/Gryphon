import { AppSidebar } from "@/components/app/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar openCount={1} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
