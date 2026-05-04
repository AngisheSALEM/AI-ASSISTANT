import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Building2, Loader2, Rocket } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { FloatingChatbot } from "@/components/FloatingChatbot";

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      navigate("/copilot");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <PremiumGlassCard className="p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Rocket className="h-32 w-32 text-white" />
          </div>

          <div className="relative z-10">
            <div className="mb-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6">
                <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Dernière étape</span>
              </div>
              <h1 className="text-4xl font-bold font-fraunces text-white mb-4 leading-tight">
                Parlez-nous de <br /> votre entreprise
              </h1>
              <p className="text-white/50 text-lg">
                Nous avons besoin de ces informations pour configurer votre espace de travail et vos futurs agents IA.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{error}</div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Nom de l'entreprise / organisation</label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                    placeholder="ex: Kinshasa Tech Solutions"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !orgName}
                className="w-full py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-cyan-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>Accéder à Opere Copilot <Rocket className="h-5 w-5" /></>
                )}
              </button>
            </form>
          </div>
        </PremiumGlassCard>
      </motion.div>

      <FloatingChatbot />
    </div>
  );
}
