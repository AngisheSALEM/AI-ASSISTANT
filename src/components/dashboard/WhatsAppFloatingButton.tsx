"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Phone, QrCode, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WhatsAppFloatingButtonProps {
  orgId: string;
}

export function WhatsAppFloatingButton({ orgId }: WhatsAppFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleTestMessage = () => {
    if (phoneNumber) {
      // Format number and open WhatsApp
      const formattedNumber = phoneNumber.replace(/\D/g, "");
      window.open(`https://wa.me/${formattedNumber}?text=Bonjour, je teste mon agent Opere!`, "_blank");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-20 right-0 w-[340px] overflow-hidden"
          >
            {/* Card Container */}
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/50 border border-black/5 dark:border-white/10">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-5 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">WhatsApp Business</h3>
                      <p className="text-white/80 text-xs">Testez votre agent IA</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/90">
                    Envoyez un message de test a votre agent via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white dark:bg-zinc-900 p-5 space-y-4">
                {/* Phone Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-white/40">
                    Numero de telephone
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+243 XXX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl text-sm",
                        "bg-gray-50 dark:bg-white/5",
                        "border border-gray-200 dark:border-white/10",
                        "focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
                        "transition-all outline-none",
                        "text-text-primary dark:text-white placeholder:text-gray-400"
                      )}
                    />
                  </div>
                </div>

                {/* Test Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTestMessage}
                  disabled={!phoneNumber}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all",
                    "bg-gradient-to-r from-emerald-500 to-green-600 text-white",
                    "hover:from-emerald-600 hover:to-green-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "shadow-lg shadow-emerald-500/25"
                  )}
                >
                  <Send size={16} />
                  Envoyer un message test
                </motion.button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-[10px] uppercase tracking-wider text-gray-400 bg-white dark:bg-zinc-900">
                      ou
                    </span>
                  </div>
                </div>

                {/* QR Code Option */}
                <Link
                  href={`/${orgId}/integrations?setup=whatsapp-qr`}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-all group",
                    "bg-gray-50 dark:bg-white/5",
                    "hover:bg-gray-100 dark:hover:bg-white/10",
                    "border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-white/10">
                      <QrCode size={16} className="text-gray-600 dark:text-white/60" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary dark:text-white">
                        Scanner QR Code
                      </p>
                      <p className="text-[10px] text-text-secondary dark:text-white/40">
                        Connexion rapide avec WhatsApp
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                </Link>

                {/* Settings Link */}
                <Link
                  href={`/${orgId}/integrations`}
                  className="block text-center text-xs text-cyan-500 hover:underline"
                >
                  Configurer WhatsApp Business API
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
          "shadow-lg",
          isOpen
            ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 shadow-zinc-800/30"
            : "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/40"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Badge */}
        {!isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900"
          >
            1
          </motion.span>
        )}

        {/* Pulse Ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-emerald-500 opacity-20" />
        )}
      </motion.button>
    </div>
  );
}
