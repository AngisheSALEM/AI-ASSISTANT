"use client";

import React, { useState } from "react";
import { Title, Text, Button, Flex, Badge, Grid } from "@tremor/react";
import { Zap, Play, Search, AlertCircle, Sparkles, Check, Settings } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { Modal } from "@/components/ui/Modal";
import { AgentRunner } from "@/components/agents/AgentRunner";

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  executions: number;
}

export default function AutomationsPage({ params }: { params: { orgId: string } }) {
  const { orgId } = params;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  // Liste des automatisations déterministes prédéfinies
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: "pdf-generator",
      name: "Générateur de Reçus PDF",
      description: "Génère automatiquement un reçu PDF officiel et l'archive dans votre base de données dès qu'un paiement est validé.",
      trigger: "Webhook Paiement Reçu",
      action: "Génération PDF & Notification WhatsApp",
      isActive: true,
      executions: 142,
    },
    {
      id: "whatsapp-invoice-reminder",
      name: "Relance Facture Automatique",
      description: "Envoie un rappel de paiement poli et personnalisé par WhatsApp Business aux clients ayant des factures en retard de plus de 5 jours.",
      trigger: "Planification Quotidienne (09:00)",
      action: "Vérification Prisma & Envoi WhatsApp",
      isActive: true,
      executions: 84,
    },
    {
      id: "sheet-inventory-sync",
      name: "Synchronisation de Stock",
      description: "Met à jour en temps réel l'inventaire logistique dans Google Sheets dès qu'un nouveau conteneur est scanné à l'arrivée.",
      trigger: "Scanner Mobile API",
      action: "Mise à jour Google Sheets & Logs",
      isActive: false,
      executions: 0,
    },
    {
      id: "email-support-routing",
      name: "Routage Automatique de Support",
      description: "Analyse et trie les emails entrants par catégorie (Facturation, Technique, Livraison) et les réaffecte instantanément aux bons collaborateurs.",
      trigger: "Réception Email Gmail",
      action: "Classification & Transfert de Ticket",
      isActive: true,
      executions: 312,
    },
  ]);

  const handleToggle = (id: string) => {
    setAutomations((prev) =>
      prev.map((aut) => (aut.id === id ? { ...aut, isActive: !aut.isActive } : aut))
    );
  };

  const filteredAutomations = automations.filter(
    (aut) =>
      aut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aut.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header de la page */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces flex items-center gap-2">
            <Zap className="h-8 w-8 text-cyan-500 fill-cyan-500/10" />
            Automatisations
          </h1>
          <p className="text-text-secondary dark:text-white/50 mt-1">
            Gérez vos workflows déterministes fixes. Chaque exécution consomme **1 crédit**.
          </p>
        </div>

        {/* Barre de recherche premium */}
        <div className="relative w-full md:w-80 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un workflow..."
            className="w-full bg-foreground/5 border border-black/5 dark:border-white/10 rounded-xl py-2 px-4 pr-10 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted dark:text-white/30" />
        </div>
      </header>

      {/* Alerte explicative de l'offre */}
      <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-start gap-3">
        <AlertCircle size={20} className="text-cyan-500 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">
            Offre 1 : Processus Fixes Déterministes (1 Crédit)
          </h5>
          <p className="text-xs text-text-secondary dark:text-white/60 mt-1">
            À la différence des agents IA autonomes qui explorent et réfléchissent, les automatisations exécutent des scripts fixes et logiques. Elles sont idéales pour les tâches administratives répétitives ne nécessitant aucune créativité.
          </p>
        </div>
      </div>

      {/* Grille des Automatisations */}
      <Grid numItemsMd={2} className="gap-6">
        {filteredAutomations.map((aut) => (
          <PremiumGlassCard key={aut.id} className="flex flex-col h-full p-6">
            {/* Haut de la carte */}
            <Flex alignItems="start" className="mb-6">
              <div className={`p-3 bg-black/5 dark:bg-white/10 rounded-2xl border border-black/5 dark:border-white/10 text-cyan-500`}>
                <Zap size={22} className={aut.isActive ? "fill-cyan-500/20" : "text-gray-400"} />
              </div>
              <div className="flex items-center gap-3">
                <Badge color={aut.isActive ? "emerald" : "gray"}>
                  {aut.isActive ? "Actif" : "Désactivé"}
                </Badge>
                
                {/* Switch bouton */}
                <button
                  onClick={() => handleToggle(aut.id)}
                  className={`w-10 h-6 rounded-full transition-all duration-300 relative ${
                    aut.isActive ? "bg-cyan-500" : "bg-black/10 dark:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${
                      aut.isActive ? "left-5" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </Flex>

            {/* Corps de la carte */}
            <div className="flex-grow space-y-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary dark:text-white font-fraunces">
                  {aut.name}
                </h3>
                <p className="text-xs text-text-secondary dark:text-white/40 mt-1 uppercase tracking-widest font-semibold">
                  {aut.executions} exécutions réussies
                </p>
              </div>
              
              <p className="text-sm text-text-secondary dark:text-white/60 leading-relaxed">
                {aut.description}
              </p>

              {/* Raccords Techniques de l'automatisation */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary dark:text-white/40">
                <div className="p-2.5 bg-black/[0.02] dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="text-[8px] text-text-muted dark:text-white/30 block mb-0.5">Déclencheur</span>
                  <span className="truncate block text-text-primary dark:text-white">{aut.trigger}</span>
                </div>
                <div className="p-2.5 bg-black/[0.02] dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="text-[8px] text-text-muted dark:text-white/30 block mb-0.5">Action finale</span>
                  <span className="truncate block text-text-primary dark:text-white">{aut.action}</span>
                </div>
              </div>
            </div>

            {/* Bas de la carte */}
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex gap-3">
              <Button
                variant="primary"
                color="cyan"
                icon={Play}
                disabled={!aut.isActive}
                onClick={() => setSelectedAutomation(aut)}
                className="flex-1 rounded-xl shadow-md shadow-cyan-500/5"
              >
                Tester maintenant
              </Button>
              <Button
                variant="secondary"
                icon={Settings}
                className="rounded-xl shrink-0"
              />
            </div>
          </PremiumGlassCard>
        ))}

        {filteredAutomations.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-black/5 dark:border-white/10 rounded-3xl">
            <p className="text-text-secondary dark:text-white/40 font-medium">Aucun workflow ne correspond à votre recherche.</p>
          </div>
        )}
      </Grid>

      {/* Modal contenant l'A2UI configuré en mode Automatisation (1 crédit) */}
      <Modal isOpen={selectedAutomation !== null} onClose={() => setSelectedAutomation(null)}>
        {selectedAutomation && (
          <AgentRunner
            agent={{
              id: selectedAutomation.id,
              name: selectedAutomation.name,
              role: "Automatisation Déterministe",
              status: "ACTIVE",
            }}
            orgId={orgId}
            onClose={() => setSelectedAutomation(null)}
          />
        )}
      </Modal>
    </div>
  );
}
