"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  User,
  Moon,
  Sun,
  Monitor,
  Building2,
  Shield,
  Bell,
  LogOut,
  Smartphone
} from "lucide-react";
import { Title, Text, Button, Flex, Switch, TextInput } from "@tremor/react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces">Settings</h1>
        <p className="text-text-secondary dark:text-white/50 mt-1">Gérez vos préférences de compte et les paramètres de l'organisation.</p>
      </header>

      <div className="space-y-8">
        {/* Appearance Section */}
        <PremiumGlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600">
                <Sun size={20} className="dark:hidden" />
                <Moon size={20} className="hidden dark:block" />
             </div>
             <h3 className="text-xl font-bold text-text-primary dark:text-white">Apparence</h3>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                <div>
                   <Text className="font-bold text-text-primary dark:text-white">Thème de l'interface</Text>
                   <Text className="text-xs text-text-secondary dark:text-white/40">Personnalisez votre expérience visuelle.</Text>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 p-1 rounded-xl">
                   <button
                     onClick={() => setTheme("light")}
                     className={`p-2 rounded-lg transition-all ${theme === "light" ? "bg-white text-blue-500 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                   >
                      <Sun size={18} />
                   </button>
                   <button
                     onClick={() => setTheme("system")}
                     className={`p-2 rounded-lg transition-all ${theme === "system" ? "bg-white dark:bg-zinc-800 text-blue-500 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                   >
                      <Monitor size={18} />
                   </button>
                   <button
                     onClick={() => setTheme("dark")}
                     className={`p-2 rounded-lg transition-all ${theme === "dark" ? "bg-zinc-800 text-cyan-400 shadow-sm" : "text-gray-500 dark:text-white/40 hover:text-white"}`}
                   >
                      <Moon size={18} />
                   </button>
                </div>
             </div>
          </div>
        </PremiumGlassCard>

        {/* Profile Section */}
        <PremiumGlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg text-violet-600">
                <User size={20} />
             </div>
             <h3 className="text-xl font-bold text-text-primary dark:text-white">Profil Personnel</h3>
          </div>

          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Text className="text-sm font-medium text-text-primary dark:text-white text-xs uppercase tracking-widest font-bold">Nom Complet</Text>
                   <TextInput placeholder="ex: Jean Dupont" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                   <Text className="text-sm font-medium text-text-primary dark:text-white text-xs uppercase tracking-widest font-bold">Email Professionnel</Text>
                   <TextInput placeholder="jean@k-solutions.cd" disabled className="bg-white/5 border-white/10" />
                </div>
             </div>
             <Button className="rounded-xl">Mettre à jour le profil</Button>
          </div>
        </PremiumGlassCard>

        {/* Organization Section */}
        <PremiumGlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600">
                <Building2 size={20} />
             </div>
             <h3 className="text-xl font-bold text-text-primary dark:text-white">Organisation</h3>
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <Text className="text-sm font-medium text-text-primary dark:text-white text-xs uppercase tracking-widest font-bold">Nom de l'entreprise</Text>
                <TextInput placeholder="K-Solutions SARL" className="bg-white/5 border-white/10" />
             </div>
             <div className="space-y-2">
                <Text className="text-sm font-medium text-text-primary dark:text-white text-xs uppercase tracking-widest font-bold">Identifiant WhatsApp Business</Text>
                <TextInput icon={Smartphone} placeholder="WABA-ID-123456789" className="bg-white/5 border-white/10" />
             </div>
             <Button variant="secondary" className="rounded-xl">Sauvegarder les changements</Button>
          </div>
        </PremiumGlassCard>

        {/* Notifications & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <PremiumGlassCard className="p-8">
              <Flex className="mb-4">
                 <h3 className="text-xl font-bold text-text-primary dark:text-white">Notifications</h3>
                 <Bell size={20} className="text-gray-400" />
              </Flex>
              <div className="space-y-4">
                 {[
                   { label: "Rapports par email", desc: "Résumé quotidien de l'IA" },
                   { label: "Alertes crédits", desc: "Quand le solde est < 10%" },
                   { label: "Nouveaux messages", desc: "Alertes sur les interactions critiques" },
                 ].map((item, i) => (
                   <Flex key={i} className="py-2">
                      <div>
                         <Text className="font-bold text-text-primary dark:text-white text-xs">{item.label}</Text>
                         <Text className="text-[10px] text-text-secondary dark:text-white/40">{item.desc}</Text>
                      </div>
                      <Switch defaultChecked />
                   </Flex>
                 ))}
              </div>
           </PremiumGlassCard>

           <PremiumGlassCard className="p-8">
              <Flex className="mb-4">
                 <h3 className="text-xl font-bold text-text-primary dark:text-white">Sécurité</h3>
                 <Shield size={20} className="text-gray-400" />
              </Flex>
              <div className="space-y-6">
                 <Button variant="secondary" className="w-full text-xs rounded-xl">Changer le mot de passe</Button>
                 <Button variant="secondary" className="w-full text-xs rounded-xl">Activer la 2FA</Button>
                 <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <Button variant="secondary" color="red" icon={LogOut} className="w-full rounded-xl">Déconnexion</Button>
                 </div>
              </div>
           </PremiumGlassCard>
        </div>
      </div>
    </div>
  );
}
