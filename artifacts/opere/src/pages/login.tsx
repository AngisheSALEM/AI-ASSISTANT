import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Loader2 } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    navigate(user.organizationId ? `/${user.organizationId}` : "/onboarding");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      const storedUser = JSON.parse(localStorage.getItem("opere_user") || "{}");
      navigate(storedUser.organizationId ? `/${storedUser.organizationId}` : "/onboarding");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center mb-8 group">
          <div className="p-2 bg-white/10 rounded-xl group-hover:rotate-12 transition-transform">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold font-fraunces tracking-tighter text-white">Opere</span>
        </Link>

        <PremiumGlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-fraunces text-white mb-2">Bon retour !</h1>
            <p className="text-white/50 text-sm">Connectez-vous à votre compte Opere</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{error}</div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="nom@entreprise.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-4 text-xs uppercase tracking-widest text-white/20 bg-transparent">Pas encore de compte ?</span>
          </div>

          <p className="text-center text-sm text-white/40">
            <Link href="/register" className="text-white hover:underline font-medium">Créer un compte gratuitement</Link>
          </p>
        </PremiumGlassCard>
      </motion.div>
    </div>
  );
}
