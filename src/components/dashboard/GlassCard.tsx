"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hover) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlightX = useSpring(mouseX, { stiffness: 400, damping: 30 });
  const spotlightY = useSpring(mouseY, { stiffness: 400, damping: 30 });

  const spotlightBackground = useTransform(
    [spotlightX, spotlightY],
    ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(0, 240, 255, 0.03), transparent 40%)`
  );

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300",
        "bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl",
        "border border-black/[0.05] dark:border-white/[0.06]",
        "shadow-lg shadow-black/[0.03] dark:shadow-none",
        hover && isHovered && "border-black/[0.08] dark:border-white/[0.1]",
        className
      )}
    >
      {/* Spotlight Effect */}
      {hover && (
        <motion.div
          className="pointer-events-none absolute inset-0 transition duration-300"
          style={{ background: spotlightBackground }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
