"use client";

import React from "react";
import { Title, Text, Button, Flex, Badge, Metric, ProgressBar, Grid } from "@tremor/react";
import { CreditCard, Zap, Coins, History, ArrowUpRight } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

export default function BillingPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces">Subscription & Billing</h1>
        <p className="text-text-secondary dark:text-white/50 mt-1">Gérez votre plan, vos crédits et vos factures.</p>
      </header>

      <Grid numItemsLg={3} className="gap-6">
        <PremiumGlassCard className="lg:col-span-2 p-8">
           <Flex alignItems="start">
              <div className="space-y-1">
                 <Text className="text-text-secondary dark:text-white/60">Plan Actuel</Text>
                 <h3 className="text-2xl font-bold text-text-primary dark:text-white">Professional Plan</h3>
              </div>
              <Badge color="blue" icon={Zap}>Mensuel</Badge>
           </Flex>
           <div className="mt-8 space-y-4">
              <Flex>
                 <Text className="text-text-secondary dark:text-white/60">Utilisation des crédits (ce mois)</Text>
                 <Text className="text-text-primary dark:text-white font-bold">1,240 / 5,000</Text>
              </Flex>
              <ProgressBar value={24.8} color="blue" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                 {[
                   { label: "Agents IA", val: "5/10" },
                   { label: "Knowledge Base", val: "250MB/1GB" },
                   { label: "Support", val: "24/7 Priority" },
                   { label: "API Access", val: "Illimité" },
                 ].map((stat, i) => (
                   <div key={i} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                      <Text className="text-[10px] uppercase tracking-widest text-text-secondary dark:text-white/40">{stat.label}</Text>
                      <Text className="font-bold text-text-primary dark:text-white mt-1">{stat.val}</Text>
                   </div>
                 ))}
              </div>
           </div>
           <div className="mt-10 flex gap-4">
              <Button variant="primary" className="rounded-xl">Changer de plan</Button>
              <Button variant="secondary" color="red" className="rounded-xl">Résilier l'abonnement</Button>
           </div>
        </PremiumGlassCard>

        <PremiumGlassCard className="p-8 border-t-4 border-t-orange-500">
           <div className="flex flex-col h-full justify-between">
              <div className="space-y-1">
                 <Text className="text-text-secondary dark:text-white/60">Crédits Restants</Text>
                 <Metric className="text-text-primary dark:text-white">3,760</Metric>
                 <Text className="text-xs text-text-secondary dark:text-white/40 mt-2">Valable jusqu'au 01/11/2024</Text>
              </div>
              <div className="mt-8 space-y-3">
                 <Button icon={Coins} color="orange" className="w-full rounded-xl">Acheter des crédits</Button>
                 <Text className="text-[10px] text-center dark:text-white/30 uppercase tracking-widest">Paiement sécurisé via Stripe</Text>
              </div>
           </div>
        </PremiumGlassCard>
      </Grid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <PremiumGlassCard className="lg:col-span-2 p-8">
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-6">Historique des Transactions</h3>
            <div className="space-y-4">
               {[
                 { id: "INV-2024-001", date: "01 Oct 2024", amount: "49.00 $", status: "Payé", method: "Visa **** 4242" },
                 { id: "INV-2024-002", date: "15 Sep 2024", amount: "10.00 $", status: "Payé", method: "Mobile Money" },
                 { id: "INV-2024-003", date: "01 Sep 2024", amount: "49.00 $", status: "Payé", method: "Visa **** 4242" },
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
                       <button className="p-2 text-gray-400 hover:text-blue-500"><ArrowUpRight size={18} /></button>
                    </div>
                 </div>
               ))}
            </div>
         </PremiumGlassCard>

         <PremiumGlassCard className="p-8">
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-6">Méthode de Paiement</h3>
            <div className="space-y-6">
               <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                     <CreditCard size={64} />
                  </div>
                  <div className="relative z-10">
                     <Text className="text-white/40 text-xs uppercase tracking-widest font-black">Carte Principale</Text>
                     <Text className="text-xl font-bold mt-4 tracking-widest">**** **** **** 4242</Text>
                     <Flex className="mt-8">
                        <div>
                           <Text className="text-white/40 text-[10px] uppercase">Expire le</Text>
                           <Text className="font-bold text-sm">12/26</Text>
                        </div>
                        <div className="w-10 h-6 bg-white/20 rounded" />
                     </Flex>
                  </div>
               </div>
               <Button variant="secondary" className="w-full rounded-xl">Modifier le mode de paiement</Button>
            </div>
         </PremiumGlassCard>
      </div>
    </div>
  );
}
