import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, UserSquare2, Database, Brain, BarChart3, Plug, CreditCard, Settings, PlusCircle, Zap, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CreditGauge } from "@/components/ui/CreditGauge";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";

interface SidebarProps {
  orgId: string;
}

interface OrgData {
  id: string;
  name: string;
  plan: string;
  credits: number;
}

export default function Sidebar({ orgId }: SidebarProps) {
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [location] = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    if (orgId && orgId !== "demo-org") {
      api.org.get(orgId)
        .then(setOrgData)
        .catch(() => setOrgData({ id: orgId, name: "Votre Organisation", plan: "STANDARD", credits: 85 }));
    } else {
      setOrgData({ id: orgId, name: "Votre Organisation", plan: "STANDARD", credits: 85 });
    }
  }, [orgId]);

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
    <aside className="w-72 bg-white/70 dark:bg-black/50 backdrop-blur-xl border-r border-black/5 dark:border-white/5 flex flex-col h-screen sticky top-0 transition-colors">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-zinc-900 dark:bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold font-fraunces tracking-tighter text-[--text-primary] dark:text-white">Opere</h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-[--text-secondary] dark:text-white/30">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group",
                isActive
                  ? "bg-black/5 dark:bg-white/10 text-[--text-primary] dark:text-white shadow-sm"
                  : "text-[--text-secondary] dark:text-white/60 hover:text-[--text-primary] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "text-blue-600 dark:text-cyan-400")} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        {orgData && (
          <div className="p-5 mb-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[--text-secondary] dark:text-white/40">Plan</span>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase border",
                orgData.plan === "PREMIUM"
                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                  : "bg-black/10 dark:bg-white/10 text-[--text-primary] dark:text-white/60 border-transparent"
              )}>
                {orgData.plan}
              </span>
            </div>
            <CreditGauge value={orgData.credits} max={orgData.plan === "PREMIUM" ? 2000 : 100} />
            {orgData.plan !== "PREMIUM" && (
              <Link href={`/${orgId}/billing`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center space-x-2 bg-zinc-900 dark:bg-white text-white dark:text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg cursor-pointer"
                >
                  <Zap size={14} fill="currentColor" />
                  <span>Upgrade</span>
                </motion.div>
              </Link>
            )}
          </div>
        )}

        <Link href={`/${orgId}/marketplace`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer mb-4"
          >
            <PlusCircle size={20} />
            <span>Nouvel Agent</span>
          </motion.div>
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-[--text-secondary] dark:text-white/40 hover:text-[--text-primary] dark:hover:text-white transition-colors rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
