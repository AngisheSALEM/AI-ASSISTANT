"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Bot,
  Zap,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  FileText,
  Table as TableIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/TremorComponents";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { runAgent } from "@/lib/actions/run-agent";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface AgentRunnerProps {
  agent: Agent;
  orgId: string;
  onClose: () => void;
}

// Étapes animées affichées pendant l'attente du retour de n8n
const LOADING_STEPS = [
  "Vérification de la provision de crédits en base de données...",
  "Appel sécurisé du moteur d'exécution n8n...",
  "Initialisation de l'agent IA autonome...",
  "Traitement de l'objectif par l'API Gemini de Google...",
  "Exécution des outils et intégrations système...",
  "Analyse cognitive du contexte et des objectifs...",
  "Mise en forme des résultats et persistance des données...",
];

export function AgentRunner({ agent, orgId, onClose }: AgentRunnerProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [runType, setRunType] = useState<"AGENT" | "AUTOMATION">("AGENT");
  
  // États de cycle de vie de l'exécution
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [outputData, setOutputData] = useState<any>(null);

  // Faire défiler les étapes de chargement
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "running") {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 3500); // 3.5 secondes par étape pour donner un rythme naturel
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setStatus("running");
    setCurrentStepIndex(0);
    setErrorMessage("");
    setOutputData(null);

    const inputData = {
      prompt: prompt.trim(),
      timestamp: new Date().toISOString(),
      agentRole: agent.role,
      agentName: agent.name,
    };

    const isAutomation = runType === "AUTOMATION";

    try {
      const response = await runAgent({
        organizationId: orgId,
        agentId: agent.id,
        inputData,
        isAutomation,
      });

      if (response.success) {
        setOutputData(response.data);
        setStatus("success");
        // Forcer le rafraîchissement global pour mettre à jour les crédits dans le sidebar
        router.refresh();
      } else {
        setErrorMessage(response.error || "Une erreur inattendue est survenue.");
        setStatus("error");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible de contacter le serveur Next.js.");
      setStatus("error");
    }
  };

  // Simple Markdown highlighter ultra-premium
  const renderTextResult = (text: string) => {
    if (!text) return null;
    
    // Divise par paragraphe
    const lines = text.split("\n");
    return (
      <div className="space-y-3 font-sans text-sm text-text-secondary dark:text-white/80 leading-relaxed selection:bg-cyan-500/30">
        {lines.map((line, idx) => {
          let trimmed = line.trim();
          
          // Entêtes (ex: ### Titre)
          if (trimmed.startsWith("###")) {
            return (
              <h4 key={idx} className="text-base font-bold text-text-primary dark:text-white mt-4 flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-cyan-500" />
                {trimmed.replace("###", "").trim()}
              </h4>
            );
          }
          if (trimmed.startsWith("##")) {
            return (
              <h3 key={idx} className="text-lg font-bold text-text-primary dark:text-white mt-5 flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-1">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                {trimmed.replace("##", "").trim()}
              </h3>
            );
          }
          
          // Listes à puces (ex: * Element ou - Element)
          if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
            return (
              <ul key={idx} className="list-disc pl-6 space-y-1 my-1">
                <li className="marker:text-cyan-500">
                  {trimmed.substring(1).trim().replace(/\*\*(.*?)\*\*/g, "$1")}
                </li>
              </ul>
            );
          }

          // Remplacement du gras simple **texte** par du JSX
          const parts = line.split(/\*\*(.*?)\*\*/g);
          if (parts.length > 1) {
            return (
              <p key={idx}>
                {parts.map((part, i) => 
                  i % 2 === 1 ? <strong key={i} className="font-bold text-text-primary dark:text-white">{part}</strong> : part
                )}
              </p>
            );
          }

          return <p key={idx} className={trimmed ? "my-2" : "h-2"}>{line}</p>;
        })}
      </div>
    );
  };

  // Rendu intelligent de données JSON complexes sous forme de cartes/tableaux premium
  const renderJsonResult = (data: any) => {
    if (!data) return null;

    // Si c'est un tableau d'objets, on en fait un magnifique tableau
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
      const keys = Object.keys(data[0]);
      return (
        <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10 my-4 shadow-sm bg-black/[0.01] dark:bg-white/[0.01]">
          <table className="min-w-full divide-y divide-black/5 dark:divide-white/10 text-left text-xs">
            <thead className="bg-black/5 dark:bg-white/5 font-bold uppercase tracking-wider text-text-secondary dark:text-white/60">
              <tr>
                {keys.map((k) => (
                  <th key={k} className="px-4 py-3">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10 text-text-primary dark:text-white/80">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  {keys.map((k) => (
                    <td key={k} className="px-4 py-3 truncate max-w-xs">
                      {typeof row[k] === "object" ? JSON.stringify(row[k]) : String(row[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Si c'est un objet clé-valeur standard, on fait un grille de cartes
    if (typeof data === "object" && data !== null) {
      const entries = Object.entries(data);
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          {entries.map(([key, val]: any) => (
            <div
              key={key}
              className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary dark:text-white/40">
                {key}
              </span>
              <p className="font-semibold text-sm text-text-primary dark:text-white mt-1">
                {typeof val === "object" ? JSON.stringify(val) : String(val)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return <pre className="p-4 rounded-xl bg-black/5 dark:bg-white/5 text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* En-tête de l'Agent Runner */}
      <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-xl border border-cyan-500/20">
            <Bot size={22} className="text-cyan-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-fraunces text-text-primary dark:text-white">
              Studio d&apos;Exécution de {agent.name}
            </h3>
            <p className="text-xs text-text-secondary dark:text-white/50 mt-0.5">
              Rôle / Mission : <span className="font-semibold text-text-primary dark:text-white">{agent.role}</span>
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleLaunch}
            className="space-y-6"
          >
            {/* Choisir le type d'exécution */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary dark:text-white/40">
                Mode d&apos;exécution & Coût
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRunType("AGENT")}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group flex items-start gap-3 ${
                    runType === "AGENT"
                      ? "border-cyan-500 bg-cyan-500/[0.03] shadow-md dark:shadow-cyan-500/5"
                      : "border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 bg-black/[0.01] dark:bg-white/[0.01]"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${runType === "AGENT" ? "bg-cyan-500/10" : "bg-black/5 dark:bg-white/5"}`}>
                    <Bot size={18} className={runType === "AGENT" ? "text-cyan-500" : "text-text-secondary dark:text-white/60"} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-text-primary dark:text-white">Agent Autonome Expert</h5>
                    <p className="text-[10px] text-text-secondary dark:text-white/40 mt-0.5">Gemini analyse, prend des décisions & agit.</p>
                    <span className="inline-block text-[10px] font-black tracking-wider uppercase text-cyan-600 dark:text-cyan-400 mt-2">
                      20 crédits
                    </span>
                  </div>
                  {runType === "AGENT" && (
                    <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-cyan-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRunType("AUTOMATION")}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group flex items-start gap-3 ${
                    runType === "AUTOMATION"
                      ? "border-blue-500 bg-blue-500/[0.03] shadow-md dark:shadow-blue-500/5"
                      : "border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 bg-black/[0.01] dark:bg-white/[0.01]"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${runType === "AUTOMATION" ? "bg-blue-500/10" : "bg-black/5 dark:bg-white/5"}`}>
                    <Zap size={18} className={runType === "AUTOMATION" ? "text-blue-500" : "text-text-secondary dark:text-white/60"} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-text-primary dark:text-white">Automatisation Simple</h5>
                    <p className="text-[10px] text-text-secondary dark:text-white/40 mt-0.5">Exécute un workflow déterministe fixe.</p>
                    <span className="inline-block text-[10px] font-black tracking-wider uppercase text-blue-600 dark:text-blue-400 mt-2">
                      1 crédit
                    </span>
                  </div>
                  {runType === "AUTOMATION" && (
                    <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Input Objective Textarea */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary dark:text-white/40">
                Définissez l&apos;objectif ou les données d&apos;entrée
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Analyse la facture suivante et sors un rapport des anomalies..."
                  rows={5}
                  required
                  className="w-full bg-foreground/[0.03] border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm placeholder:text-text-muted dark:placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans resize-none"
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-1 text-[10px] font-bold text-text-muted dark:text-white/30">
                  <Sparkles size={12} className="text-cyan-500" />
                  <span>Moteur Gemini Actif</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
              <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl">
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!prompt.trim()}
                icon={Play}
                color={runType === "AGENT" ? "cyan" : "blue"}
                className="rounded-xl shadow-lg shadow-cyan-500/10"
              >
                Lancer l&apos;exécution
              </Button>
            </div>
          </motion.form>
        )}

        {status === "running" && (
          <motion.div
            key="running"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-12 flex flex-col items-center justify-center text-center space-y-6"
          >
            {/* Super dynamic loading spinner */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Bot className="text-cyan-500" size={32} />
                </motion.div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md">
              <h4 className="text-base font-bold text-text-primary dark:text-white">
                Exécution de l&apos;agent en cours...
              </h4>
              
              {/* Log/Progression list item */}
              <div className="h-10 flex items-center justify-center overflow-hidden relative">
                <AnimatePresence mode="popLayout">
                  <motion.p
                    key={currentStepIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider"
                  >
                    {LOADING_STEPS[currentStepIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              <p className="text-xs text-text-secondary dark:text-white/40">
                Les appels LLM autonomes complexes ou les automatisations réseau peuvent nécessiter quelques secondes. Merci de patienter.
              </p>
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-text-primary dark:text-white">
                  Exécution terminée avec succès !
                </h4>
                <p className="text-xs text-text-secondary dark:text-white/60 mt-0.5">
                  L&apos;agent n8n a traité votre objectif et enregistré les résultats dans la base de données.
                </p>
              </div>
            </div>

            {/* Panneau d'affichage des résultats */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-text-secondary dark:text-white/40 border-b border-black/5 dark:border-white/10 pb-2">
                <FileText size={12} className="text-cyan-500" />
                <span>Résultats du traitement</span>
              </div>

              {/* Rendu dynamique du texte ou JSON */}
              {outputData && typeof outputData.text === "string" && (
                <div className="p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 shadow-inner">
                  {renderTextResult(outputData.text)}
                </div>
              )}

              {outputData && outputData.data && (
                <div className="p-1 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TableIcon size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary dark:text-white/50">Données Structurées retournées</span>
                  </div>
                  {renderJsonResult(outputData.data)}
                </div>
              )}

              {outputData && !outputData.text && !outputData.data && (
                <div className="p-5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 shadow-inner">
                  {renderJsonResult(outputData)}
                </div>
              )}
            </div>

            {/* Boutons d'action finaux */}
            <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
              <Button
                variant="secondary"
                onClick={() => setStatus("idle")}
                className="rounded-xl"
              >
                Nouvelle exécution
              </Button>
              <Button
                onClick={onClose}
                className="rounded-xl shadow-lg shadow-cyan-500/10"
              >
                Fermer
              </Button>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-6 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
              <XCircle size={48} />
            </div>

            <div className="space-y-2 max-w-md">
              <h4 className="text-base font-bold text-text-primary dark:text-white">
                Échec de l&apos;exécution
              </h4>
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 p-4 rounded-2xl border border-rose-500/15 font-mono text-left leading-relaxed">
                {errorMessage}
              </p>
              <p className="text-xs text-text-secondary dark:text-white/40">
                Si des crédits ont été débités, ils ont été entièrement remboursés de manière automatique.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4 w-full border-t border-black/5 dark:border-white/10">
              <Button
                variant="secondary"
                onClick={() => setStatus("idle")}
                className="rounded-xl"
              >
                Réessayer
              </Button>
              <Button
                onClick={onClose}
                className="rounded-xl"
              >
                Fermer
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
