"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumGlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function PremiumGlassCard({ children, className }: PremiumGlassCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlightX = useSpring(mouseX, { stiffness: 400, damping: 30 });
  const spotlightY = useSpring(mouseY, { stiffness: 400, damping: 30 });

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300",
        // Light mode
        "bg-white/70 backdrop-blur-xl border border-black/[0.06] shadow-glass",
        // Dark mode
        "dark:bg-neutral-900/50 dark:border-white/[0.08] dark:shadow-glass-dark dark:backdrop-blur-xl",
        // Hover states
        isHovered 
          ? "border-black/[0.1] dark:border-white/[0.15] shadow-lg" 
          : "",
        className
      )}
    >
      {/* Spotlight effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl transition duration-300"
        style={{
          background: useTransform(
            [spotlightX, spotlightY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(6, 182, 212, 0.04), transparent 40%)`
          ),
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
