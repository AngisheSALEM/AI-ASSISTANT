"use client";

import React, { useEffect, useState } from "react";
import { Title, Text, Button, Flex, Badge, Metric, ProgressBar, Grid } from "@tremor/react";
import { CreditCard, Zap, Coins, History, ArrowUpRight, Loader2 } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import RechargeButton from "@/components/RechargeButton";

export default function BillingPage({ params }: { params: { orgId: string } }) {
  const { orgId } = params;
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await fetch(`/api/organization/${orgId}`);
        if (res.ok) {
          const data = await res.json();
          setOrgData(data);
        }
      } catch (err) {
        console.error("Failed to fetch org data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrg();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
        <Text>Chargement des informations de facturation...</Text>
      </div>
    );
  }

  const currentPlan = orgData?.plan || "FREE";
  const currentCredits = orgData?.credits ?? 0;
  const maxCredits = currentPlan === "PREMIUM" ? 2000 : 100;
  const creditUsage = Math.max(0, maxCredits - currentCredits);
  const usagePercentage = Math.min(100, Math.max(0, (creditUsage / maxCredits) * 100));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces">Abonnements & Crédits</h1>
        <p className="text-text-secondary dark:text-white/50 mt-1">Gérez votre formule d&apos;abonnement, vos crédits et l&apos;historique de vos recharges.</p>
      </header>

      <Grid numItemsLg={3} className="gap-6">
        <PremiumGlassCard className="lg:col-span-2 p-8">
           <Flex alignItems="start">
              <div className="space-y-1">
                 <Text className="text-text-secondary dark:text-white/60">Formule Active</Text>
                 <h3 className="text-2xl font-bold text-text-primary dark:text-white">
                   Plan {currentPlan === "PREMIUM" ? "Professionnel Premium" : "Standard d'essai"}
                 </h3>
              </div>
              <Badge color={currentPlan === "PREMIUM" ? "cyan" : "gray"} icon={Zap}>
                {currentPlan === "PREMIUM" ? "Premium" : "Gratuit"}
              </Badge>
           </Flex>
           <div className="mt-8 space-y-4">
              <Flex>
                 <Text className="text-text-secondary dark:text-white/60">Utilisation de votre quota de crédits</Text>
                 <Text className="text-text-primary dark:text-white font-bold">{creditUsage} / {maxCredits}</Text>
              </Flex>
              <ProgressBar value={usagePercentage} color="cyan" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                 {[
                   { label: "Agents IA", val: currentPlan === "PREMIUM" ? "Illimités" : "1 actif" },
                   { label: "Base de connaissances", val: currentPlan === "PREMIUM" ? "500 Mo" : "10 Mo" },
                   { label: "Support", val: currentPlan === "PREMIUM" ? "24/7 Prioritaire" : "Par email" },
                   { label: "Accès API n8n", val: "Inclus" },
                 ].map((stat, i) => (
                   <div key={i} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                      <Text className="text-[10px] uppercase tracking-widest text-text-secondary dark:text-white/40">{stat.label}</Text>
                      <Text className="font-bold text-text-primary dark:text-white mt-1">{stat.val}</Text>
                   </div>
                 ))}
              </div>
           </div>
           <div className="mt-10 flex gap-4">
              <Button variant="primary" color="cyan" className="rounded-xl">Mettre à niveau la formule</Button>
              {currentPlan === "PREMIUM" && (
                <Button variant="secondary" color="red" className="rounded-xl">Résilier mon abonnement</Button>
              )}
           </div>
        </PremiumGlassCard>

        {/* Dynamic Credit Card Panel */}
        <PremiumGlassCard className="p-8 border-t-4 border-t-cyan-500">
           <div className="flex flex-col h-full justify-between">
              <div className="space-y-1">
                 <Text className="text-text-secondary dark:text-white/60">Solde de Crédits Actuel</Text>
                 <Metric className="text-text-primary dark:text-white font-fraunces">{currentCredits}</Metric>
                 <Text className="text-xs text-text-secondary dark:text-white/40 mt-2">Valable sans limite de temps</Text>
              </div>
              <div className="mt-8 space-y-3">
                 <RechargeButton orgId={orgId} currentCredits={currentCredits} />
                 <Text className="text-[10px] text-center dark:text-white/30 uppercase tracking-widest block">Sécurisé par Stripe & Mobile Money</Text>
              </div>
           </div>
        </PremiumGlassCard>
      </Grid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <PremiumGlassCard className="lg:col-span-2 p-8">
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-6">Historique des Recharges</h3>
            <div className="space-y-4">
               {[
                 { id: "REC-2026-042", date: "24 Mai 2026", amount: "49.00 $", status: "Payé", method: "Visa **** 4242" },
                 { id: "REC-2026-015", date: "12 Avr 2026", amount: "10.00 $", status: "Payé", method: "Mobile Money (Orange)" },
                 { id: "REC-2026-001", date: "01 Fév 2026", amount: "49.00 $", status: "Payé", method: "Visa **** 4242" },
               ].map((inv, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                          <History size={18} className="text-gray-400" />
                       </div>
                       <div>
                          <Text className="font-bold text-text-primary dark:text-white">{inv.id}</Text>
                          <Text className="text-xs text-text-secondary dark:text-white/40">{inv.date} • {inv.method}</Text>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <Text className="font-bold text-text-primary dark:text-white">{inv.amount}</Text>
                       <Badge color="emerald">Payé</Badge>
                       <button className="p-2 text-gray-400 hover:text-cyan-500"><ArrowUpRight size={18} /></button>
                    </div>
                 </div>
               ))}
            </div>
         </PremiumGlassCard>

         <PremiumGlassCard className="p-8">
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-6">Moyens de Paiement</h3>
            <div className="space-y-6">
               <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                     <CreditCard size={64} />
                  </div>
                  <div className="relative z-10">
                     <Text className="text-white/40 text-xs uppercase tracking-widest font-black">Carte Enregistrée</Text>
                     <Text className="text-xl font-bold mt-4 tracking-widest">**** **** **** 4242</Text>
                     <Flex className="mt-8">
                        <div>
                           <Text className="text-white/40 text-[10px] uppercase">Validité</Text>
                           <Text className="font-bold text-sm">12/28</Text>
                        </div>
                        <div className="w-10 h-6 bg-white/20 rounded" />
                     </Flex>
                  </div>
               </div>
               <Button variant="secondary" className="w-full rounded-xl">Modifier le moyen de paiement</Button>
            </div>
         </PremiumGlassCard>
      </div>
    </div>
  );
}
