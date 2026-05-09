"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: string;
  trendLabel?: string;
  progress?: number;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-cyan-500",
  trend,
  trendLabel,
  progress,
  subtitle,
  linkHref,
  linkLabel,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        "bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl",
        "border border-black/[0.05] dark:border-white/[0.06]",
        "shadow-lg shadow-black/[0.03] dark:shadow-none",
        "hover:border-black/[0.08] dark:hover:border-white/[0.1]",
        "group"
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/[0.02] dark:to-cyan-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-text-secondary dark:text-white/50 uppercase tracking-wider">
            {title}
          </p>
          <div className={cn("p-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] group-hover:scale-110 transition-transform", iconColor)}>
            <Icon size={16} />
          </div>
        </div>

        {/* Value */}
        <p className="text-2xl md:text-3xl font-bold text-text-primary dark:text-white mb-2">
          {value}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {trend && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {trend}
              </span>
              {trendLabel && (
                <span className="text-[10px] text-text-secondary dark:text-white/40">
                  {trendLabel}
                </span>
              )}
            </div>
          )}

          {progress !== undefined && (
            <div className="w-full">
              <div className="h-1.5 bg-black/[0.05] dark:bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                />
              </div>
            </div>
          )}

          {subtitle && !progress && !trend && (
            <span className="text-[10px] text-text-secondary dark:text-white/40">
              {subtitle}
            </span>
          )}

          {linkHref && linkLabel && (
            <Link
              href={linkHref}
              className="text-xs font-medium text-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 inline-flex items-center gap-1 transition-colors"
            >
              {linkLabel}
              <ArrowUpRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
