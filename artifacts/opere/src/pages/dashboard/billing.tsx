import { CreditCard, Coins, TrendingUp, Download, CheckCircle, Zap } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { motion } from "framer-motion";

const plans = [
  { name: "Standard", price: "29", credits: "100", features: ["1 Agent IA inclus", "Support WhatsApp", "Base de connaissances 1GB"], current: true },
  { name: "Professionnel", price: "79", credits: "500", features: ["3 Agents IA inclus", "Base de connaissances RAG", "Support prioritaire", "Rapports avancés"], popular: true },
  { name: "Entreprise", price: "199", credits: "2000", features: ["Agents illimités", "API Access", "Accompagnement dédié", "SLA 99.9%"] },
];

const transactions = [
  { date: "03 Mai 2024", amount: "+100", type: "Recharge", status: "Complété" },
  { date: "01 Mai 2024", amount: "-50", type: "Abonnement Standard", status: "Complété" },
  { date: "28 Avr 2024", amount: "+200", type: "Recharge", status: "Complété" },
  { date: "15 Avr 2024", amount: "-50", type: "Abonnement Standard", status: "Complété" },
];

export default function BillingPage({ orgId }: { orgId: string }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[--text-primary] dark:text-white font-fraunces">Subscription & Billing</h1>
        <p className="text-[--text-secondary] dark:text-white/50 mt-1">Gérez votre abonnement et rechargez vos crédits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Crédits restants", value: "85", icon: Coins, color: "text-orange-500", sub: "Sur 100 du plan Standard" },
          { label: "Plan actuel", value: "Standard", icon: CreditCard, color: "text-blue-500", sub: "Renouvelé le 01/06/2024" },
          { label: "Utilisation ce mois", value: "15 crédits", icon: TrendingUp, color: "text-emerald-500", sub: "15% de votre quota" },
        ].map((stat, i) => (
          <PremiumGlassCard key={i} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[--text-secondary] dark:text-white/60">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-[--text-primary] dark:text-white font-fraunces">{stat.value}</p>
                <p className="text-xs text-[--text-secondary] dark:text-white/40 mt-1">{stat.sub}</p>
              </div>
              <stat.icon className={stat.color} size={24} />
            </div>
          </PremiumGlassCard>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-[--text-primary] dark:text-white font-fraunces mb-6">Changer de plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={i} whileHover={{ y: -4 }}>
              <PremiumGlassCard className={`p-8 h-full flex flex-col ${(plan as any).popular ? "border-white/30 dark:border-white/20" : ""}`}>
                {(plan as any).popular && (
                  <div className="mb-4 self-start px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Populaire</div>
                )}
                {(plan as any).current && (
                  <div className="mb-4 self-start px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> Plan actuel
                  </div>
                )}
                <h3 className="text-lg font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/60 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold font-fraunces text-[--text-primary] dark:text-white mb-6">{plan.price}$<span className="text-sm font-normal text-[--text-secondary] dark:text-white/40">/mois</span></div>
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="text-sm font-bold text-[--text-primary] dark:text-white flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" /> {plan.credits} crédits inclus
                  </li>
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-[--text-secondary] dark:text-white/60 flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500/60" /> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  (plan as any).current
                    ? "bg-black/5 dark:bg-white/10 text-[--text-secondary] dark:text-white/60 cursor-default"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}>
                  {(plan as any).current ? "Plan actuel" : "Passer à ce plan"}
                </button>
              </PremiumGlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      <PremiumGlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[--text-primary] dark:text-white font-fraunces">Historique des transactions</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-sm font-medium text-[--text-primary] dark:text-white hover:bg-black/10 dark:hover:bg-white/10">
            <Download size={16} /> Exporter
          </button>
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-4 text-[10px] font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/30 pb-2 border-b border-black/5 dark:border-white/5">
            <span>Date</span><span>Montant</span><span>Description</span><span>Statut</span>
          </div>
          {transactions.map((t, i) => (
            <div key={i} className="grid grid-cols-4 py-3 border-b border-black/5 dark:border-white/5 last:border-0 text-sm">
              <span className="text-[--text-secondary] dark:text-white/60">{t.date}</span>
              <span className={`font-bold ${t.amount.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-[--text-primary] dark:text-white"}`}>
                {t.amount} crédits
              </span>
              <span className="text-[--text-secondary] dark:text-white/60">{t.type}</span>
              <span className="text-xs px-2 py-0.5 h-fit rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">{t.status}</span>
            </div>
          ))}
        </div>
      </PremiumGlassCard>
    </div>
  );
}
