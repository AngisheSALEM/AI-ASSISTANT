import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA] dark:bg-[#050505]">
      <Sidebar orgId={params.orgId} />
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle gradient overlay for light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] via-transparent to-blue-500/[0.02] pointer-events-none dark:hidden" />
        
        {/* Content */}
        <div className="relative z-10 p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
