"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-glass dark:shadow-2xl relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
