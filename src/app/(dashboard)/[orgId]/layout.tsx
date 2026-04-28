import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar orgId={params.orgId} />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-zinc-900">
        {children}
      </main>
    </div>
  );
}
