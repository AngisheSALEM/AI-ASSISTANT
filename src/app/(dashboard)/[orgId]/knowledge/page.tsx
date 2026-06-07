"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  MessageSquarePlus,
  FileText,
  Trash2,
  CheckCircle2,
  Plus
} from "lucide-react";
import { Text, Button, Flex, Badge, ProgressBar, TextInput } from "@tremor/react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState("documents");
  const [faqs, setFaqs] = useState([
    { question: "Quels sont vos horaires de livraison à Kinshasa ?", answer: "Nous livrons du lundi au samedi de 8h00 à 18h00." },
    { question: "Quels modes de paiement acceptez-vous ?", answer: "Nous acceptons M-Pesa, Orange Money, Airtel Money et les espèces à la livraison." },
    { question: "Comment suivre mon colis ?", answer: "Chaque commande génère un lien de suivi automatique envoyé directement sur votre WhatsApp." }
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFaqs(prev => [...prev, { question: newQuestion, answer: newAnswer }]);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleDeleteFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces">Base de Connaissances</h1>
        <p className="text-text-secondary dark:text-white/50 mt-1">
          Gérez les informations locales que vos agents IA utilisent pour répondre précisément aux clients.
        </p>
      </header>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 dark:border-white/10 overflow-x-auto">
        {[
          { id: "documents", label: "Documents d'Entreprise", icon: FileText },
          { id: "faq", label: "Foire Aux Questions (FAQ)", icon: MessageSquarePlus },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNE GAUCHE : Onglets d'action */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Onglet 1: Upload Documents */}
          {activeTab === "documents" && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2 font-fraunces">Charger vos Fichiers</h3>
              <p className="text-xs text-zinc-400 mb-6">Importez vos grilles tarifaires, catalogues ou politiques de retour pour que l'IA y accède en temps réel.</p>
              
              <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer group">
                <div className="p-4 bg-white dark:bg-white/10 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-text-primary dark:text-white text-sm">Glissez-déposez vos fichiers ici</p>
                  <p className="text-[10px] text-text-secondary dark:text-white/40 mt-1">PDF, DOCX, XLSX ou CSV (Max 25 Mo)</p>
                </div>
              </div>

              {/* Liste des documents */}
              <div className="mt-8 space-y-4">
                <Text className="font-bold text-text-primary dark:text-white text-xs uppercase tracking-wider">Documents indexés</Text>
                {[
                  { name: "Grille_Tarifs_Kinshasa_2026.xlsx", size: "1.2 MB", status: "Synchronisé", progress: 100 },
                  { name: "Politique_Livraison_Operations.pdf", size: "2.4 MB", status: "Synchronisé", progress: 100 },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <FileText className="text-cyan-500" />
                      <div>
                        <Text className="font-semibold text-text-primary dark:text-white text-xs">{doc.name}</Text>
                        <Text className="text-[10px] text-text-secondary dark:text-white/40">{doc.size}</Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-24 hidden sm:block">
                        <ProgressBar value={doc.progress} color="emerald" />
                      </div>
                      <Badge color="emerald">{doc.status}</Badge>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          )}

          {/* Onglet 2: FAQ Builder */}
          {activeTab === "faq" && (
            <PremiumGlassCard className="p-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2 font-fraunces">Foire Aux Questions (FAQ)</h3>
              <p className="text-xs text-zinc-400 mb-6">Ajoutez des questions et réponses rapides pour guider instantanément le robot.</p>

              {/* Formulaire d'ajout FAQ */}
              <form onSubmit={handleAddFaq} className="p-5 border border-dashed border-black/10 dark:border-white/10 rounded-xl space-y-4 bg-zinc-950/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Nouvelle Question</span>
                  <TextInput 
                    required
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ex: Livrez-vous à Gombe ?" 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Réponse attendue</span>
                  <TextInput 
                    required
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Ex: Oui, livraison sous 2h à Gombe pour 5 USD." 
                  />
                </div>
                <Button type="submit" size="xs" icon={Plus} color="cyan">Ajouter à la base</Button>
              </form>

              {/* Liste des FAQs */}
              <div className="mt-8 space-y-3">
                <Text className="font-bold text-text-primary dark:text-white text-xs uppercase tracking-wider">Questions enregistrées ({faqs.length})</Text>
                {faqs.map((faq, i) => (
                  <div key={i} className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                    <Flex>
                      <Text className="font-bold text-text-primary dark:text-white text-xs">Q : {faq.question}</Text>
                      <button 
                        onClick={() => handleDeleteFaq(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Flex>
                    <Text className="text-xs text-text-secondary dark:text-white/60">R : {faq.answer}</Text>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          )}
        </div>

        {/* COLONNE DROITE : Règles de comportement & Status */}
        <div className="space-y-8">
          
          {/* Card: Consignes de Réponses */}
          <PremiumGlassCard className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none p-6 text-white">
            <h3 className="text-lg font-bold font-fraunces">Consignes de Réponses</h3>
            <p className="text-blue-100 mt-2 text-xs leading-relaxed">
              Définissez les règles métier strictes que vos agents IA doivent obligatoirement respecter.
            </p>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-blue-200 block">Instructions de comportement</label>
                <textarea
                  className="w-full bg-blue-800/40 border border-blue-400/30 rounded-xl p-3 text-xs text-white placeholder:text-blue-300/50 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none h-32"
                  placeholder="Ex: Toujours saluer poliment. Ne jamais faire de promesse de remboursement direct sans validation de la direction. Prioriser le tutoiement amical si le client parle en Lingala."
                />
              </div>
              <Button color="blue" className="w-full border-white/20 text-xs font-bold uppercase tracking-wider py-2">Sauvegarder les règles</Button>
            </div>
          </PremiumGlassCard>

          {/* Card: Statut de l'Indexation */}
          <PremiumGlassCard className="p-6">
            <h3 className="text-base font-bold text-text-primary dark:text-white font-fraunces">Statut de la base</h3>
            <div className="mt-6 space-y-6">
              <div>
                <Flex>
                  <Text className="text-text-secondary dark:text-white/60 text-xs">Espace Utilisé</Text>
                  <Text className="text-text-primary dark:text-white font-bold text-xs">3.6 MB / 1 GB</Text>
                </Flex>
                <ProgressBar value={0.36} color="blue" className="mt-2" />
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                <Text className="text-xs text-emerald-700 dark:text-emerald-400">Vos sources d'information sont indexées et prêtes.</Text>
              </div>
            </div>
          </PremiumGlassCard>
        </div>
      </div>
    </div>
  );
}
