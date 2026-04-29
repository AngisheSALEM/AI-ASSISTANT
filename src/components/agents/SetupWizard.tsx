"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mic,
  UploadCloud,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { cn } from "@/lib/utils";

interface SetupWizardProps {
  onComplete: (data: any) => void;
  templateName: string;
}

export function SetupWizard({ onComplete, templateName }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: templateName,
    voice: "Default",
    files: [] as File[],
    whatsappConnected: false
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="max-w-2xl mx-auto py-12">
      {/* Progress Bar */}
      <div className="flex justify-between mb-12 relative px-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 z-0" />
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500",
              step >= s ? "bg-white border-white text-black" : "bg-black border-white/20 text-white/40"
            )}
          >
            {step > s ? <CheckCircle2 size={20} /> : <span className="text-xs font-bold">{s}</span>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PremiumGlassCard className="p-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-fraunces tracking-tight text-white">Identité de l'agent</h2>
                <p className="text-white/50">Donnez un nom et une personnalité vocale à votre nouvel employé.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nom de l'agent</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Voix de l'agent</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Clarity", "Professional", "Friendly", "Formal"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setFormData({...formData, voice: v})}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                          formData.voice === v ? "bg-white border-white text-black" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        )}
                      >
                        <Mic size={16} />
                        <span className="text-sm font-medium">{v}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
              >
                Continuer
                <ArrowRight size={18} />
              </button>
            </PremiumGlassCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PremiumGlassCard className="p-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-fraunces tracking-tight text-white">Injection de savoir</h2>
                <p className="text-white/50">Téléchargez les documents (PDF, Text) qui serviront de base de connaissances à l'agent.</p>
              </div>

              <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">Cliquez ou déposez vos fichiers</p>
                  <p className="text-xs text-white/40 mt-1">PDF, DOCX ou TXT (Max 10MB)</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={prevStep}
                  className="px-6 py-4 rounded-xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Retour
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                >
                  Continuer
                  <ArrowRight size={18} />
                </button>
              </div>
            </PremiumGlassCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PremiumGlassCard className="p-10 space-y-8 relative overflow-hidden">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-fraunces tracking-tight text-white">Activation Canal</h2>
                <p className="text-white/50">Connectez l'agent à votre numéro WhatsApp pour le rendre opérationnel.</p>
              </div>

              <div className="py-8 flex flex-col items-center gap-6">
                 <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
                    <Smartphone size={80} className="text-white relative z-10" />
                 </div>

                 <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({...formData, whatsappConnected: true})}
                    className={cn(
                      "relative w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all overflow-hidden group",
                      formData.whatsappConnected
                        ? "bg-green-500 text-white"
                        : "bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    )}
                 >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {formData.whatsappConnected ? <CheckCircle2 /> : <Sparkles size={20} />}
                      {formData.whatsappConnected ? "WhatsApp Connecté" : "Connecter WhatsApp"}
                    </span>
                    {!formData.whatsappConnected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    )}
                 </motion.button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={prevStep}
                  className="px-6 py-4 rounded-xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Retour
                </button>
                <button
                  onClick={() => onComplete(formData)}
                  disabled={!formData.whatsappConnected}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  Finaliser le recrutement
                  <CheckCircle2 size={18} />
                </button>
              </div>
            </PremiumGlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
