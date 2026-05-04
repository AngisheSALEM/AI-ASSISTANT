import { useState } from "react";
import { UploadCloud, Globe, MessageSquarePlus, FileText, Trash2, ExternalLink, CheckCircle2, RefreshCcw, Cloud, Plus } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState("documents");

  const tabs = [
    { id: "documents", label: "Documents", icon: FileText },
    { id: "scraping", label: "URL Scraping", icon: Globe },
    { id: "faq", label: "FAQ Builder", icon: MessageSquarePlus },
    { id: "cloud", label: "Synchro Cloud", icon: Cloud },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[--text-primary] dark:text-white font-fraunces">Base de Connaissances</h1>
        <p className="text-[--text-secondary] dark:text-white/50 mt-1">Gérez les informations que vos agents utilisent pour répondre aux clients.</p>
      </header>

      <div className="flex border-b border-gray-200 dark:border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white"
            }`}
          >
            <tab.icon size={18} />{tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === "documents" && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-6">Upload de Documents</h3>
              <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer group">
                <div className="p-4 bg-white dark:bg-white/10 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-[--text-primary] dark:text-white">Glissez vos fichiers ici</p>
                  <p className="text-xs text-[--text-secondary] dark:text-white/40 mt-1">PDF, DOCX, XLSX ou CSV (Max 25MB)</p>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <p className="font-medium text-[--text-primary] dark:text-white">Documents récents</p>
                {[
                  { name: "Catalogue_2024.pdf", size: "2.4 MB", status: "Indexé", progress: 100 },
                  { name: "Tarifs_Kinshasa.xlsx", size: "1.1 MB", status: "Indexation...", progress: 65 },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-500" />
                      <div>
                        <p className="font-medium text-[--text-primary] dark:text-white text-sm">{doc.name}</p>
                        <p className="text-xs text-[--text-secondary] dark:text-white/40">{doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-32 hidden md:block h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${doc.progress === 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${doc.progress}%` }} />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${doc.progress === 100 ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"}`}>{doc.status}</span>
                      <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          )}

          {activeTab === "scraping" && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-6">Website Scraping</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[--text-primary] dark:text-white">URL du site web</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="url" placeholder="https://votre-entreprise.com" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white" />
                    </div>
                    <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">Scanner</button>
                  </div>
                  <p className="text-xs text-[--text-secondary] dark:text-white/40">L'agent lira toutes les pages publiques et indexera le contenu.</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="text-blue-500" />
                    <div>
                      <p className="font-medium text-[--text-primary] dark:text-white text-sm">https://www.k-solutions.cd</p>
                      <p className="text-xs text-[--text-secondary] dark:text-white/40">Dernier scan: il y a 2 jours • 42 pages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg text-xs font-medium text-[--text-primary] dark:text-white hover:bg-black/10 dark:hover:bg-white/10">
                      <RefreshCcw size={14} /> Rescan
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            </PremiumGlassCard>
          )}

          {activeTab === "faq" && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-6">FAQ Builder</h3>
              <div className="space-y-6">
                <div className="p-6 border border-dashed border-black/10 dark:border-white/10 rounded-xl space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-[--text-primary] dark:text-white text-sm">Question</p>
                    <input type="text" placeholder="ex: Quels sont vos horaires d'ouverture ?" className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm focus:outline-none dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-[--text-primary] dark:text-white text-sm">Réponse</p>
                    <input type="text" placeholder="ex: Nous sommes ouverts du lundi au samedi de 8h à 18h." className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm focus:outline-none dark:text-white" />
                  </div>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                    <Plus size={16} /> Ajouter à la base
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-[--text-primary] dark:text-white">Questions enregistrées (12)</p>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex items-start justify-between">
                      <div>
                        <p className="font-bold text-[--text-primary] dark:text-white text-sm">Question {i}</p>
                        <p className="text-sm text-[--text-secondary] dark:text-white/60 mt-1">Contenu de la réponse pré-enregistrée pour l'agent.</p>
                      </div>
                      <button className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumGlassCard>
          )}

          {activeTab === "cloud" && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-xl font-bold text-[--text-primary] dark:text-white mb-6">Synchro Cloud</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Google Drive", icon: Cloud, connected: true },
                  { name: "Notion", icon: ExternalLink, connected: false },
                  { name: "OneDrive", icon: Cloud, connected: false },
                  { name: "Slack", icon: MessageSquarePlus, connected: false },
                ].map((app, i) => (
                  <div key={i} className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-white dark:bg-white/10 rounded-xl">
                        <app.icon size={24} className="text-blue-500" />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${app.connected ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40"}`}>
                        {app.connected ? "Connecté" : "Disponible"}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[--text-primary] dark:text-white">{app.name}</p>
                      <p className="text-xs text-[--text-secondary] dark:text-white/40">Synchronisez vos fichiers automatiquement.</p>
                    </div>
                    <button className={`w-full py-2 rounded-xl text-sm font-bold transition-colors ${app.connected ? "bg-black/5 dark:bg-white/10 text-[--text-primary] dark:text-white hover:bg-black/10" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                      {app.connected ? "Gérer" : "Connecter"}
                    </button>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          )}
        </div>

        <div className="space-y-8">
          <PremiumGlassCard className="bg-blue-600 border-none p-6">
            <h3 className="text-xl font-bold text-white">Gestion de la Vérité</h3>
            <p className="text-blue-100 mt-2 text-sm">Définissez les limites strictes pour vos agents.</p>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-blue-200">Champ d'Exception</label>
                <textarea
                  className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl p-3 text-white text-sm placeholder:text-blue-300/50 focus:outline-none focus:ring-1 focus:ring-white/30"
                  rows={4}
                  placeholder="Ex: Ne jamais mentionner les prix des concurrents. Ne pas promettre de remise sans accord."
                />
              </div>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-bold transition-colors">Sauvegarder</button>
            </div>
          </PremiumGlassCard>

          <PremiumGlassCard className="p-6">
            <h3 className="text-xl font-bold text-[--text-primary] dark:text-white">Statut de l'Indexation</h3>
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[--text-secondary] dark:text-white/60">Espace Utilisé</span>
                  <span className="font-bold text-[--text-primary] dark:text-white">12.4 MB / 1 GB</span>
                </div>
                <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[1.2%] bg-blue-500 rounded-full" />
                </div>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">Toutes les sources sont synchronisées et prêtes.</p>
              </div>
            </div>
          </PremiumGlassCard>
        </div>
      </div>
    </div>
  );
}
