import Sidebar from "@/components/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  orgId: string;
}

export default function DashboardLayout({ children, orgId }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA] dark:bg-black">
      <Sidebar orgId={orgId} />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute inset-0 bg-white/40 dark:bg-transparent pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
