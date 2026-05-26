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
  Zap,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [isExpertMode, setIsExpertMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kin_opere_expert_mode");
    if (saved === "true") {
      setIsExpertMode(true);
    }
  }, []);

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

  const toggleExpertMode = () => {
    const newVal = !isExpertMode;
    setIsExpertMode(newVal);
    localStorage.setItem("kin_opere_expert_mode", String(newVal));
    window.dispatchEvent(new Event("kin_opere_expert_mode_changed"));
  };

  const allMenuItems = [
    { name: "Overview", href: `/${orgId}`, icon: LayoutDashboard },
    { name: "My Agents", href: `/${orgId}/agents`, icon: UserSquare2 },
    { name: "Automations", href: `/${orgId}/automations`, icon: Zap },
    { name: "Knowledge Base", href: `/${orgId}/knowledge`, icon: Database },
    { name: "Thinking Studio", href: `/${orgId}/thinking`, icon: Brain, expertOnly: true },
    { name: "Insights", href: `/${orgId}/analytics`, icon: BarChart3 },
    { name: "Integrations", href: `/${orgId}/integrations`, icon: Plug },
    { name: "Billing", href: `/${orgId}/billing`, icon: CreditCard },
    { name: "Settings", href: `/${orgId}/settings`, icon: Settings },
  ];

  const menuItems = allMenuItems.filter(item => !item.expertOnly || isExpertMode);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="glass-sidebar flex flex-col h-screen sticky top-0 transition-colors relative group"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-8 z-50 p-1.5 rounded-full",
          "bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10",
          "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "hover:bg-gray-50 dark:hover:bg-zinc-700"
        )}
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-gray-600 dark:text-white/70" />
        ) : (
          <ChevronLeft size={14} className="text-gray-600 dark:text-white/70" />
        )}
      </button>

      {/* Logo */}
      <div className={cn("p-6", isCollapsed && "px-4")}>
        <Link href="/" className="flex items-center gap-3 group/logo">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20"
          >
            <Zap size={isCollapsed ? 18 : 20} className="text-white" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold tracking-tight text-foreground"
              >
                Opere
              </motion.h1>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
            >
              Menu
            </motion.div>
          )}
        </AnimatePresence>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item relative",
                isCollapsed && "justify-center px-0",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
              )}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <item.icon 
                size={20} 
                className={cn(
                  "shrink-0 transition-all duration-200",
                  isActive && "text-cyan-500 dark:text-cyan-400",
                  "group-hover/item:scale-110"
                )} 
              />
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded-md opacity-0 group-hover/item:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={cn("p-4 mt-auto space-y-6", isCollapsed && "px-2")}>
        {/* Credits & Plan */}
        <AnimatePresence>
          {orgData && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 glass-card space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase",
                  orgData.plan === "PREMIUM"
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                    : "bg-foreground/5 text-muted-foreground"
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
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 hover:bg-foreground/90"
                >
                  <Zap size={14} />
                  <span>{loading ? "..." : "Upgrade"}</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Expert Toggle */}
        <div className={cn("flex items-center justify-between", isCollapsed ? "justify-center" : "px-2 py-1")}>
          {!isCollapsed && (
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sliders size={14} className={cn(isExpertMode ? "text-cyan-500 animate-pulse" : "text-muted-foreground")} />
              Mode Expert
            </span>
          )}
          <button
            onClick={toggleExpertMode}
            className={cn(
              "relative transition-all duration-300",
              isCollapsed 
                ? cn(
                    "p-2.5 border rounded-xl flex items-center justify-center transition-all",
                    isExpertMode 
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-500 shadow-lg shadow-cyan-500/10" 
                      : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-muted-foreground hover:text-foreground"
                  )
                : cn(
                    "w-9 h-5 rounded-full relative",
                    isExpertMode ? "bg-cyan-500" : "bg-black/10 dark:bg-white/10"
                  )
            )}
          >
            {isCollapsed ? (
              <Sliders size={18} className={cn("shrink-0 transition-transform duration-300", isExpertMode && "rotate-90 text-cyan-500")} />
            ) : (
              <div
                className={cn(
                  "w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all duration-300",
                  isExpertMode ? "left-5" : "left-0.5"
                )}
              />
            )}
          </button>
        </div>

        {/* WhatsApp CTA Button - Primary Action */}
        <Link href={`/${orgId}/integrations?setup=whatsapp`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all cursor-pointer",
              "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700",
              "text-white shadow-lg shadow-emerald-500/25",
              isCollapsed && "px-3"
            )}
          >
            <MessageCircle size={isCollapsed ? 20 : 18} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm whitespace-nowrap overflow-hidden"
                >
                  WhatsApp
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>

        {/* New Agent Button */}
        <Link href={`/${orgId}/marketplace`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all cursor-pointer",
              "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
              "text-white shadow-lg shadow-blue-500/25",
              isCollapsed && "px-3"
            )}
          >
            <PlusCircle size={isCollapsed ? 20 : 18} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm whitespace-nowrap overflow-hidden"
                >
                  Nouvel Agent
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </div>
    </motion.aside>
  );
}
