import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Settings, BookOpen, User, Headphones, Stethoscope, Building2, TrendingUp, Cpu } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { Link } from "wouter";

const ICON_MAP: Record<string, any> = { Headphones, Stethoscope, Building2, TrendingUp, User };

const mockAgents = [
  { id: "1", name: "Support Alpha", role: "Support Client", status: "ACTIVE", createdAt: new Date("2024-04-01") },
  { id: "2", name: "Commercial Beta", role: "Commercial Immobilier", status: "ACTIVE", createdAt: new Date("2024-04-15") },
];

const mockTemplates = [
  { id: "t1", name: "Support Client", description: "Agent spécialisé dans la réponse aux questions fréquentes et la résolution des problèmes clients.", category: "Support", pricePerMonth: 50, icon: "Headphones" },
  { id: "t2", name: "Secrétaire Médical", description: "Gère les rendez-vous et répond aux questions administratives des patients.", category: "Santé", pricePerMonth: 70, icon: "Stethoscope" },
  { id: "t3", name: "Commercial Immobilier", description: "Qualifie vos prospects et présente votre catalogue de biens 24h/24.", category: "Immobilier", pricePerMonth: 100, icon: "Building2" },
];

function AgentsTable({ agents }: { agents: typeof mockAgents }) {
  return (
    <PremiumGlassCard className="p-4">
      <table className="w-full">
        <thead>
          <tr className="border-b border-black/5 dark:border-white/5">
            <th className="text-left text-xs font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/40 py-3 px-4">Nom</th>
            <th className="text-left text-xs font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/40 py-3 px-4">Rôle / Métier</th>
            <th className="text-left text-xs font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/40 py-3 px-4">Statut</th>
            <th className="text-left text-xs font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/40 py-3 px-4">Date de recrutement</th>
            <th className="text-right text-xs font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/40 py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id} className="border-b border-black/5 dark:border-white/5 last:border-0">
              <td className="py-4 px-4 font-medium text-[--text-primary] dark:text-white">{agent.name}</td>
              <td className="py-4 px-4 text-[--text-secondary] dark:text-white/60">{agent.role}</td>
              <td className="py-4 px-4">
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${agent.status === "ACTIVE" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"}`}>
                  {agent.status}
                </span>
              </td>
              <td className="py-4 px-4 text-[--text-secondary] dark:text-white/60">{new Date(agent.createdAt).toLocaleDateString()}</td>
              <td className="py-4 px-4 text-right space-x-2">
                <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[--text-primary] dark:text-white rounded-lg text-xs font-medium transition-colors">
                  <Settings size={14} /> Configurer
                </button>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[--text-primary] dark:text-white rounded-lg text-xs font-medium transition-colors">
                  <BookOpen size={14} /> Connaissances
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PremiumGlassCard>
  );
}

function TemplatesGrid({ templates, orgId }: { templates: typeof mockTemplates; orgId: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = (templateId: string) => {
    setLoadingId(templateId);
    setTimeout(() => setLoadingId(null), 1500);
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {templates.map((template) => {
        const Icon = template.icon && ICON_MAP[template.icon] ? ICON_MAP[template.icon] : User;
        const isLoading = loadingId === template.id;
        return (
          <motion.div key={template.id} variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <PremiumGlassCard className="flex flex-col h-full p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-black/5 dark:border-white/10">
                  <Icon className="h-6 w-6 text-[--text-primary] dark:text-white" />
                </div>
                <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[--text-secondary] dark:text-white/40">
                  {template.category}
                </span>
              </div>
              <h3 className="text-2xl font-bold font-fraunces tracking-tight text-[--text-primary] dark:text-white mb-3">{template.name}</h3>
              <p className="text-[--text-secondary] dark:text-white/50 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">{template.description}</p>
              <div className="flex items-center gap-2 mb-8 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <Cpu size={16} className="text-blue-500 dark:text-cyan-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[--text-secondary] dark:text-white/60">
                  Cerveau: <span className="text-[--text-primary] dark:text-white">Opere-70B-Versatile</span>
                </span>
              </div>
              <div className="pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[--text-secondary] dark:text-white/30 mb-1">Coût Initial</p>
                  <p className="text-xl font-bold text-[--text-primary] dark:text-white font-fraunces">
                    {template.pricePerMonth} <span className="text-sm font-normal text-[--text-secondary] dark:text-white/40">crédits</span>
                  </p>
                </div>
                <button
                  onClick={() => handleSelect(template.id)}
                  disabled={!!loadingId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  {isLoading ? "..." : "Sélectionner"}
                </button>
              </div>
            </PremiumGlassCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function AgentsPage({ orgId }: { orgId: string }) {
  const hasAgents = mockAgents.length > 0;

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[--text-primary] dark:text-white font-fraunces">Mes Agents IA</h1>
          <p className="text-[--text-secondary] dark:text-white/50 mt-1">{mockAgents.length} agent(s) actif(s) dans votre organisation</p>
        </div>
        <Link href={`/${orgId}/marketplace`}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20"
          >
            <PlusCircle size={18} /> Recruter un Agent
          </motion.button>
        </Link>
      </div>

      {hasAgents ? (
        <div className="space-y-8">
          <AgentsTable agents={mockAgents} />
          <div>
            <h2 className="text-xl font-bold text-[--text-primary] dark:text-white font-fraunces mb-6">Ajouter un nouvel agent</h2>
            <TemplatesGrid templates={mockTemplates} orgId={orgId} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-[--text-primary] dark:text-white mb-2">Bienvenue ! 👋</h2>
            <p className="text-[--text-secondary] dark:text-white/60">Pour commencer, veuillez sélectionner un template pour votre premier agent IA.</p>
          </div>
          <TemplatesGrid templates={mockTemplates} orgId={orgId} />
        </div>
      )}
    </div>
  );
}
