"use client";

import React, { useState } from "react";
import {
  User,
  Zap,
  Brain,
  Play,
  ArrowRight
} from "lucide-react";
import { Title, Text, Button, Flex, Badge, Select, SelectItem } from "@tremor/react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

export default function ThinkingPage() {
  const [persona, setPersona] = useState("Expert");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces">Thinking Studio</h1>
        <p className="text-text-secondary dark:text-white/50 mt-1">
          Définissez la personnalité et la logique de raisonnement de vos agents.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Persona Identity */}
          <PremiumGlassCard className="p-6">
            <Flex className="mb-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-white">L'Identité (Persona)</h3>
              <Badge color="blue" icon={User}>Global</Badge>
            </Flex>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary dark:text-white">Style de ton (Tone of Voice)</label>
                  <Select value={persona} onValueChange={setPersona}>
                    <SelectItem value="Expert">Expert & Professionnel</SelectItem>
                    <SelectItem value="Amical">Amical & Chaleureux</SelectItem>
                    <SelectItem value="Concis">Direct & Concis</SelectItem>
                    <SelectItem value="Vendeur">Vendeur Persuasif</SelectItem>
                  </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-text-primary dark:text-white">Langue Principale</label>
                   <Select defaultValue="fr">
                      <SelectItem value="fr">Français (Congo)</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="ln">Lingala (Beta)</SelectItem>
                   </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary dark:text-white">Instructions Systèmes (Prompt Maître)</label>
                <textarea
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 text-sm text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-48 transition-all"
                  placeholder="Ex: Tu es un assistant de luxe, tu ne salues jamais par 'Salut' mais toujours par 'Bienvenue'..."
                />
                <Text className="text-xs text-text-secondary dark:text-white/40 italic">C'est ici que vous donnez les ordres fondamentaux à l'IA.</Text>
              </div>
            </div>
          </PremiumGlassCard>

          {/* Reasoning Chains */}
          <PremiumGlassCard className="p-6">
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-6">Chaînes de Raisonnement</h3>
            <div className="space-y-4">
               {[
                 { title: "Vérification de stock", desc: "Si le client demande un produit, vérifier d'abord la base de données.", active: true },
                 { title: "Prise de RDV", desc: "Si le client veut un RDV, proposer les créneaux libres via Google Calendar.", active: true },
                 { title: "Escalade Humaine", desc: "Si le client s'énerve, passer immédiatement la main à un humain.", active: false },
               ].map((chain, i) => (
                 <div key={i} className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                          <Brain size={20} className={chain.active ? "text-blue-500" : "text-gray-400"} />
                       </div>
                       <div>
                          <Text className="font-bold text-text-primary dark:text-white">{chain.title}</Text>
                          <Text className="text-xs text-text-secondary dark:text-white/40">{chain.desc}</Text>
                       </div>
                    </div>
                    <Badge color={chain.active ? "emerald" : "gray"}>{chain.active ? "Actif" : "Désactivé"}</Badge>
                 </div>
               ))}
               <Button variant="secondary" icon={Zap} className="w-full mt-4">Ajouter une logique (Flow)</Button>
            </div>
          </PremiumGlassCard>
        </div>

        <div className="space-y-8">
          {/* Cognitive Parameters */}
          <PremiumGlassCard className="p-6">
            <h3 className="text-xl font-bold text-text-primary dark:text-white mb-6">Paramètres Cognitifs</h3>
            <div className="space-y-8">
               <div className="space-y-4">
                  <Flex>
                     <Text className="text-text-primary dark:text-white font-medium">Créativité (Temperature)</Text>
                     <Badge color="blue">0.7</Badge>
                  </Flex>
                  <Text className="text-xs text-text-secondary dark:text-white/40">Le curseur de créativité est actuellement géré par le plan de l'agent.</Text>
                  <Flex>
                     <Text className="text-[10px] uppercase tracking-widest text-gray-400">Strict</Text>
                     <Text className="text-[10px] uppercase tracking-widest text-gray-400">Créatif</Text>
                  </Flex>
               </div>

               <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
                  <Text className="text-text-primary dark:text-white font-medium">Niveau d'Autonomie</Text>
                  <div className="space-y-2">
                     {[
                       { label: "Strictement Factuel", id: "fact" },
                       { label: "Semi-Autonome", id: "semi" },
                       { label: "Agent Complet", id: "full" },
                     ].map((opt) => (
                       <button
                         key={opt.id}
                         className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                           opt.id === "semi"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "border-black/5 dark:border-white/5 text-text-secondary dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5"
                         }`}
                       >
                         {opt.label}
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          </PremiumGlassCard>

          {/* Test Playground */}
          <PremiumGlassCard className="bg-zinc-900 dark:bg-zinc-900 border-none p-6">
             <Flex className="mb-4">
                <h3 className="text-xl font-bold text-white">Simulateur</h3>
                <Badge color="orange" icon={Play}>Preview</Badge>
             </Flex>
             <div className="space-y-4">
                <div className="bg-black/50 rounded-xl p-4 min-h-[150px]">
                   <Text className="text-white/40 text-xs italic">Simulez une interaction pour voir comment vos changements affectent le comportement de l'IA...</Text>
                </div>
                <div className="relative">
                   <input
                     type="text"
                     placeholder="Posez une question..."
                     className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none"
                   />
                   <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-black rounded-lg">
                      <ArrowRight size={16} />
                   </button>
                </div>
             </div>
          </PremiumGlassCard>
        </div>
      </div>
    </div>
  );
}
