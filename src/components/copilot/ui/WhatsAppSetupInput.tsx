"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { Lock, Phone, Send, CheckCircle2, Edit2 } from "lucide-react";

interface WhatsAppSetupInputProps {
  onSubmit: (data: { accessToken: string; phoneId: string }) => void;
  isSubmitting?: boolean;
  result?: { accessToken: string; phoneId: string; status?: string };
  onEdit?: () => void;
  error?: boolean;
}

export function WhatsAppSetupInput({
  onSubmit,
  isSubmitting,
  result,
  onEdit,
  error
}: WhatsAppSetupInputProps) {
  const [accessToken, setAccessToken] = useState(result?.accessToken || "");
  const [phoneId, setPhoneId] = useState(result?.phoneId || "");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken && phoneId) {
      onSubmit({ accessToken, phoneId });
    }
  };

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <PremiumGlassCard className="p-4 sm:p-6 max-w-md w-full relative border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h5 className="text-foreground">WhatsApp Connecte</h5>
                <p className="text-xs text-muted-foreground">Phone ID: {result.phoneId}</p>
              </div>
            </div>
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                title="Modifier les identifiants"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </PremiumGlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <PremiumGlassCard className={`p-4 sm:p-6 max-w-md w-full ${error ? 'border-red-500/50' : ''}`}>
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Phone className="h-5 w-5 text-green-500" />
          </div>
          <h5 className="text-foreground">Configuration WhatsApp</h5>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Access Token
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="EAAB..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-foreground/5 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Phone ID
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="1092..."
                value={phoneId}
                onChange={(e) => setPhoneId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-foreground/5 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!accessToken || !phoneId || isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-lg font-semibold text-sm transition-all"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-background/20 border-t-background animate-spin rounded-full" />
            ) : (
              <>
                Valider la configuration
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
          {error && <p className="text-xs text-red-500 text-center">Identifiants invalides. Veuillez reessayer.</p>}
        </form>
      </PremiumGlassCard>
    </motion.div>
  );
}
