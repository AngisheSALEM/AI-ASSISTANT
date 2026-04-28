import Link from "next/link";
import {
  LayoutDashboard,
  UserSquare2,
  Database,
  BarChart3,
  Settings,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  orgId: string;
}

export default function Sidebar({ orgId }: SidebarProps) {
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

      <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
        <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
          <PlusCircle size={20} />
          <span>Nouvel Agent</span>
        </button>
      </div>
    </aside>
  );
}
