"use client";

import React, { useState } from "react";
import {
  User,
  Zap,
  Brain,
  Play,
  ArrowRight,
  Sparkles,
  BookOpen,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Title, Text, Button, Flex, Badge, Select, SelectItem } from "@tremor/react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

// Professionally engineered B2B prompts for Kinshasa businesses
const PROMPT_PRESETS = {
  comptable: `Tu es un expert comptable virtuel certifié pour la République Démocratique du Congo (RDC). Ton rôle est d'analyser les pièces comptables (factures, reçus, bilans) soumises par le client. Tu dois vérifier la conformité fiscale (TVA, déclarations), repérer les anomalies ou omissions de calcul, et structurer un rapport clair avec les écarts trouvés et des actions de régularisation recommandées. Reste extrêmement rigoureux, factuel et professionnel.`,
  support: `Tu es l'agent d'assistance clientèle (SAV) de l'entreprise. Ton rôle est de répondre chaleureusement, rapidement et de manière concise aux interrogations des clients. Aide-les à suivre leurs expéditions ou colis logistiques, réponds aux questions de FAQ courantes, et si le client exprime une urgence complexe ou de la frustration, prépare poliment l'escalade vers un opérateur humain en résumant l'incident.`,
  vendeur: `Tu es l'agent commercial et responsable des ventes virtuelles de la société. Ton but est de maximiser la conversion des prospects en clients actifs. Présente nos solutions de transport, logistique ou abonnements avec enthousiasme. Propose des devis adaptés aux besoins, relance de manière persuasive les devis en attente, et conclus l'appel en orientant l'utilisateur vers le paiement. Sois courtois et axé sur le résultat.`,
};

export default function ThinkingPage() {
  const [persona, setPersona] = useState("Expert");
  const [promptText, setPromptText] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);
  const [simulationInput, setSimulationInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const applyPreset = (key: keyof typeof PROMPT_PRESETS) => {
    setPromptText(PROMPT_PRESETS[key]);
    setActivePreset(key);
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationInput.trim()) return;

    setIsSimulating(true);
    setSimulatedResponse(null);

    // Simulate agent behavior locally
    setTimeout(() => {
      let response = "";
      const inputLower = simulationInput.toLowerCase();

      if (activePreset === "comptable") {
        response = `[Rapport de l'Agent Comptable]\n\n### 1. Analyse Fiscale\nSuite à votre demande, j'ai vérifié le document. La taxe sur la valeur ajoutée (TVA) à Kinshasa est fixée à 16%. Il semble y avoir un écart de calcul sur la ligne 3 concernant la base imposable.\n\n### 2. Actions Recommandées\n- Recalculer le montant HT sur la facture n°042.\n- Rectifier la déclaration de TVA avant le 15 du mois prochain.`;
      } else if (activePreset === "support") {
        response = `Bonjour, je suis le support client Kin Opere. 😊\n\nJ'ai bien pris en compte votre problème concernant votre livraison. D'après nos logs de transit, le conteneur est en cours de dédouanement au port sec de Mitendi. Il devrait arriver dans votre entrepôt d'ici 24 heures.\n\nBesoin d'autre chose ?`;
      } else if (activePreset === "vendeur") {
        response = `Parfait ! Notre formule Premium est idéale pour vos volumes de transport. Elle comprend 5 000 crédits et le support prioritaire pour $49/mois.\n\nSouhaitez-vous que je génère le lien de facturation Stripe sécurisé ?`;
      } else {
        response = `[Simulateur Opere]\n\nInstructions système : "${promptText.substring(0, 40)}..."\n\nEntrée utilisateur : "${simulationInput}"\n\nRéponse : Je suis configuré et prêt à exécuter vos tâches avec le ton ${persona}.`;
      }

      setSimulatedResponse(response);
      setIsSimulating(false);
    }, 1500);
  };

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
              <h3 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-500" />
                L&apos;Identité (Persona)
              </h3>
              <Badge color="cyan" icon={User}>Global</Badge>
            </Flex>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">Style de ton (Tone of Voice)</label>
                  <Select value={persona} onValueChange={setPersona}>
                    <SelectItem value="Expert">Expert & Professionnel</SelectItem>
                    <SelectItem value="Amical">Amical & Chaleureux</SelectItem>
                    <SelectItem value="Concis">Direct & Concis</SelectItem>
                    <SelectItem value="Vendeur">Vendeur Persuasif</SelectItem>
                  </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">Langue Principale</label>
                   <Select defaultValue="fr">
                      <SelectItem value="fr">Français (Congo)</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="ln">Lingala (Beta)</SelectItem>
                   </Select>
                </div>
              </div>

              {/* Simplification: Prompt Presets Helper */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-500" />
                  Générer des Instructions Professionnelles en 1 clic
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => applyPreset("comptable")}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      activePreset === "comptable"
                        ? "border-cyan-500 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400"
                        : "border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/10 dark:hover:border-white/10"
                    }`}
                  >
                    💼 Comptable Congolais
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("support")}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      activePreset === "support"
                        ? "border-cyan-500 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400"
                        : "border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/10 dark:hover:border-white/10"
                    }`}
                  >
                    💬 Support Client SAV
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("vendeur")}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      activePreset === "vendeur"
                        ? "border-cyan-500 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400"
                        : "border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/10 dark:hover:border-white/10"
                    }`}
                  >
                    📈 Agent Commercial
                  </button>
                </div>
              </div>

              {/* Instructions Systèmes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-primary dark:text-white uppercase tracking-wider">Instructions Systèmes (Prompt Maître)</label>
                <textarea
                  value={promptText}
                  onChange={(e) => {
                    setPromptText(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm text-text-primary dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 h-44 transition-all font-sans"
                  placeholder="Choisissez un modèle ci-dessus ou rédigez vos propres ordres..."
                />
                <Text className="text-[10px] text-text-secondary dark:text-white/40 italic flex items-center gap-1">
                  <HelpCircle size={10} />
                  Le prompt maître dicte les lois de réflexion de l'agent. Les modèles ci-dessus respectent déjà les meilleures pratiques RAG.
                </Text>
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
                       <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-black/5 dark:border-white/5">
                          <Brain size={20} className={chain.active ? "text-cyan-500" : "text-gray-400"} />
                       </div>
                       <div>
                          <Text className="font-bold text-text-primary dark:text-white">{chain.title}</Text>
                          <Text className="text-xs text-text-secondary dark:text-white/40">{chain.desc}</Text>
                       </div>
                    </div>
                    <Badge color={chain.active ? "emerald" : "gray"}>{chain.active ? "Actif" : "Désactivé"}</Badge>
                 </div>
               ))}
               <Button variant="secondary" icon={Zap} className="w-full mt-4 rounded-xl">Ajouter une logique (Flow)</Button>
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
                     <Badge color="cyan">0.7</Badge>
                  </Flex>
                  <Text className="text-xs text-text-secondary dark:text-white/40">Le niveau d&apos;improvisation ou d&apos;exactitude des réponses de l&apos;IA.</Text>
                  <Flex>
                     <Text className="text-[10px] uppercase tracking-widest text-gray-400">Strict</Text>
                     <Text className="text-[10px] uppercase tracking-widest text-gray-400">Créatif</Text>
                  </Flex>
               </div>

               <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
                  <Text className="text-text-primary dark:text-white font-medium">Niveau d&apos;Autonomie</Text>
                  <div className="space-y-2">
                     {[
                       { label: "Strictement Factuel", id: "fact" },
                       { label: "Semi-Autonome", id: "semi" },
                       { label: "Agent Complet (Conseillé)", id: "full" },
                     ].map((opt) => (
                       <button
                         key={opt.id}
                         onClick={(e) => e.preventDefault()}
                         className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                           opt.id === "full"
                            ? "border-cyan-500 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400"
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
          <PremiumGlassCard className="bg-zinc-900 border-none p-6 text-white">
             <Flex className="mb-4">
                <h3 className="text-xl font-bold">Simulateur local</h3>
                <Badge color="orange" icon={Play}>Preview</Badge>
             </Flex>
             <form onSubmit={handleSimulate} className="space-y-4">
                <div className="bg-black/40 rounded-xl p-4 min-h-[170px] border border-white/5 max-h-[220px] overflow-y-auto">
                   {isSimulating ? (
                     <div className="flex flex-col items-center justify-center h-full pt-10 gap-2">
                       <Loader2 className="animate-spin text-cyan-500" size={24} />
                       <Text className="text-white/60 text-xs">Simulateur en cours d&apos;exécution...</Text>
                     </div>
                   ) : simulatedResponse ? (
                     <div className="space-y-2">
                       <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400">Réponse Simulée :</span>
                       <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap">{simulatedResponse}</p>
                     </div>
                   ) : (
                     <Text className="text-white/40 text-xs italic">
                       Saisissez un message et testez les règles de votre agent en direct avant le déploiement.
                     </Text>
                   )}
                </div>
                <div className="relative">
                   <input
                     type="text"
                     value={simulationInput}
                     onChange={(e) => setSimulationInput(e.target.value)}
                     placeholder="Ex: Analyse la facture n°042"
                     disabled={isSimulating}
                     className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 pr-12 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-white/30"
                   />
                   <button
                     type="submit"
                     disabled={isSimulating || !simulationInput.trim()}
                     className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                   >
                      <ArrowRight size={16} />
                   </button>
                </div>
             </form>
          </PremiumGlassCard>
        </div>
      </div>
    </div>
  );
}
