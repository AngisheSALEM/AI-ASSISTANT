import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { User, Moon, Sun, Monitor, Building2, Shield, Bell, LogOut, Smartphone } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState([true, true, false]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[--text-primary] dark:text-white font-fraunces">Settings</h1>
        <p className="text-[--text-secondary] dark:text-white/50 mt-1">Gérez vos préférences de compte et les paramètres de l'organisation.</p>
      </header>

      <div className="space-y-8">
        <PremiumGlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600">
              <Sun size={20} className="dark:hidden" />
              <Moon size={20} className="hidden dark:block" />
            </div>
            <h3 className="text-xl font-bold text-[--text-primary] dark:text-white">Apparence</h3>
          </div>
          <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
            <div>
              <p className="font-bold text-[--text-primary] dark:text-white">Thème de l'interface</p>
              <p className="text-xs text-[--text-secondary] dark:text-white/40">Personnalisez votre expérience visuelle.</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 p-1 rounded-xl">
              {[
                { icon: Sun, value: "light" },
                { icon: Monitor, value: "system" },
                { icon: Moon, value: "dark" },
              ].map(({ icon: Icon, value }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`p-2 rounded-lg transition-all ${theme === value ? "bg-white dark:bg-zinc-800 text-blue-500 shadow-sm" : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"}`}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </PremiumGlassCard>

        <PremiumGlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg text-violet-600"><User size={20} /></div>
            <h3 className="text-xl font-bold text-[--text-primary] dark:text-white">Profil Personnel</h3>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/40">Nom Complet</label>
                <input
                  type="text"
                  placeholder="ex: Jean Dupont"
                  defaultValue="Jean Dupont"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm focus:outline-none dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/40">Email Professionnel</label>
                <input
                  type="email"
                  placeholder="jean@k-solutions.cd"
                  defaultValue="jean@k-solutions.cd"
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5 text-sm opacity-60 dark:text-white cursor-not-allowed"
                />
              </div>
            </div>
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              Mettre à jour le profil
            </button>
          </div>
        </PremiumGlassCard>

        <PremiumGlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600"><Building2 size={20} /></div>
            <h3 className="text-xl font-bold text-[--text-primary] dark:text-white">Organisation</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/40">Nom de l'entreprise</label>
              <input type="text" defaultValue="Kinshasa Tech Solutions" className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm focus:outline-none dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/40">Identifiant WhatsApp Business</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="WABA-ID-123456789" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm focus:outline-none dark:text-white" />
              </div>
            </div>
            <button className="px-5 py-2.5 bg-black/5 dark:bg-white/10 text-[--text-primary] dark:text-white rounded-xl text-sm font-bold hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
              Sauvegarder les changements
            </button>
          </div>
        </PremiumGlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PremiumGlassCard className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[--text-primary] dark:text-white">Notifications</h3>
              <Bell size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {[
                { label: "Rapports par email", desc: "Résumé quotidien de l'IA" },
                { label: "Alertes crédits", desc: "Quand le solde est < 10%" },
                { label: "Nouveaux messages", desc: "Alertes sur les interactions critiques" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-bold text-[--text-primary] dark:text-white text-xs">{item.label}</p>
                    <p className="text-[10px] text-[--text-secondary] dark:text-white/40">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => prev.map((v, j) => j === i ? !v : v))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${notifications[i] ? "bg-blue-600" : "bg-gray-200 dark:bg-white/10"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${notifications[i] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </PremiumGlassCard>

          <PremiumGlassCard className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[--text-primary] dark:text-white">Sécurité</h3>
              <Shield size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              <button className="w-full py-2.5 px-4 bg-black/5 dark:bg-white/10 text-[--text-primary] dark:text-white rounded-xl text-xs font-bold hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-left">
                Changer le mot de passe
              </button>
              <button className="w-full py-2.5 px-4 bg-black/5 dark:bg-white/10 text-[--text-primary] dark:text-white rounded-xl text-xs font-bold hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-left">
                Activer la 2FA
              </button>
              <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                <button className="w-full py-2.5 px-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2">
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            </div>
          </PremiumGlassCard>
        </div>
      </div>
    </div>
  );
}
