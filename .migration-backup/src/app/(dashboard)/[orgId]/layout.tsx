import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA] dark:bg-black">
      <Sidebar orgId={params.orgId} />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute inset-0 bg-white/40 dark:bg-transparent pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
