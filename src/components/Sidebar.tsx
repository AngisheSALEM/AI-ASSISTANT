"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  UserSquare2,
  Database,
  BarChart3,
  Settings,
  PlusCircle,
  Zap,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    { name: "Dashboard", href: `/${orgId}`, icon: LayoutDashboard },
    { name: "Mes Agents", href: `/${orgId}/agents`, icon: UserSquare2 },
    { name: "Connaissances", href: `/${orgId}/knowledge`, icon: Database },
    { name: "Analytics", href: `/${orgId}/analytics`, icon: BarChart3 },
    { name: "Paramètres", href: `/${orgId}/settings`, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold text-blue-600">Agentia-Kin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {orgData && (
        <div className="p-4 mx-4 mb-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan actuel</span>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-bold",
              orgData.plan === "PREMIUM" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
            )}>
              {orgData.plan}
            </span>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Coins size={16} className="text-amber-500" />
            <span className="text-sm font-medium">{orgData.credits} crédits</span>
          </div>

          {orgData.plan !== "PREMIUM" && (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50"
            >
              <Zap size={14} fill="currentColor" />
              <span>{loading ? "Chargement..." : "Passer au Premium"}</span>
            </button>
          )}
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
        <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
          <PlusCircle size={20} />
          <span>Nouvel Agent</span>
        </button>
      </div>
    </aside>
  );
}
