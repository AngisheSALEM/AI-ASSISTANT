"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserSquare2,
  Database,
  Brain,
  BarChart3,
  Plug,
  CreditCard,
  Settings,
  PlusCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CreditGauge } from "@/components/ui/CreditGauge";

interface SidebarProps {
  orgId: string;
}

interface OrgData {
  plan: string;
  credits: number;
}

export default function Sidebar({ orgId }: SidebarProps) {
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await fetch(`/api/organization/${orgId}`);
        if (res.ok) {
          const data = await res.json();
          setOrgData(data);
        }
      } catch (err) {
        console.error("Failed to fetch org data", err);
      }
    }
    fetchOrg();
  }, [orgId]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/organization/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrgData((prev) => prev ? { ...prev, plan: data.plan } : null);
      }
    } catch (err) {
      console.error("Upgrade failed", err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { name: "Overview", href: `/${orgId}`, icon: LayoutDashboard },
    { name: "My Agents", href: `/${orgId}/agents`, icon: UserSquare2 },
    { name: "Knowledge Base", href: `/${orgId}/knowledge`, icon: Database },
    { name: "Thinking Studio", href: `/${orgId}/thinking`, icon: Brain },
    { name: "Insights & Reports", href: `/${orgId}/analytics`, icon: BarChart3 },
    { name: "Integrations", href: `/${orgId}/integrations`, icon: Plug },
    { name: "Subscription & Billing", href: `/${orgId}/billing`, icon: CreditCard },
    { name: "Settings", href: `/${orgId}/settings`, icon: Settings },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-black/50 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 flex flex-col h-screen sticky top-0 transition-colors">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-gray-900 dark:bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold font-fraunces tracking-tighter text-gray-900 dark:text-white">Opere</h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group",
                isActive
                  ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "text-blue-500 dark:text-cyan-400")} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        {orgData && (
          <div className="p-5 mb-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40">Plan</span>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase border",
                orgData.plan === "PREMIUM"
                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                  : "bg-gray-200/50 dark:bg-white/10 text-gray-600 dark:text-white/60 border-transparent"
              )}>
                {orgData.plan}
              </span>
            </div>

            <CreditGauge value={orgData.credits} max={orgData.plan === "PREMIUM" ? 2000 : 100} />

            {orgData.plan !== "PREMIUM" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-black/5 dark:shadow-white/5 disabled:opacity-50"
              >
                <Zap size={14} fill="currentColor" />
                <span>{loading ? "..." : "Upgrade"}</span>
              </motion.button>
            )}
          </div>
        )}

        <Link href={`/${orgId}/marketplace`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-cyan-600 dark:hover:to-blue-700 text-white py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <PlusCircle size={20} />
            <span>Nouvel Agent</span>
          </motion.div>
        </Link>
      </div>
    </aside>
  );
}
