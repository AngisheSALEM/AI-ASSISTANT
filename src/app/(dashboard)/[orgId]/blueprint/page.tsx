"use client";

import React, { useState, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { 
  Network, Zap, X, ShieldCheck, CheckCircle2, TrendingDown, HelpCircle, 
  BookOpen, ArrowLeft, AlertTriangle, Settings, Phone, MessageSquare, 
  Send, ExternalLink, ShieldAlert, Cpu
} from "lucide-react";
import { createPdaRequest } from "@/lib/actions/pda-request";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

// Composant Custom Node pour React Flow
const BlueprintNode = ({ data }: any) => {
  return (
    <div className={`p-5 rounded-2xl backdrop-blur-xl bg-black/40 border transition-all duration-300 w-72 select-none ${
      data.isActive 
        ? "border-cyan-500/30 hover:border-cyan-500/60 shadow-lg shadow-cyan-500/5" 
        : "border-white/5 hover:border-white/20 bg-zinc-950/40"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] tracking-widest font-black uppercase ${data.isActive ? "text-cyan-400" : "text-zinc-500"}`}>
          {data.category}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {data.isActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${data.isActive ? "bg-emerald-500" : "bg-zinc-500"}`}></span>
          </span>
          <span className={`text-[9px] font-bold ${data.isActive ? "text-emerald-500" : "text-zinc-500"}`}>
            {data.isActive ? "ACTIF" : "INACTIF"}
          </span>
        </div>
      </div>
      
      <h4 className="text-sm font-bold text-white mb-1">{data.label}</h4>
      <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">{data.description}</p>
      
      {data.isActive ? (
        <div className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 py-1 px-2.5 rounded-lg border border-emerald-500/20 w-fit">
          Orchestré par n8n
        </div>
      ) : (
        <button 
          onClick={data.onAuditClick}
          className="text-[9px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 py-1.5 px-3 rounded-lg transition-all active:scale-95 block w-fit"
        >
          Lancer le diagnostic PDA
        </button>
      )}
    </div>
  );
};

export default function BlueprintPage({ params }: { params: { orgId: string } }) {
  const { orgId } = params;
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "diagram">("list");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orgPlan, setOrgPlan] = useState("STANDARD");
  const [showGuide, setShowGuide] = useState(true);

  // Configuration interactive simulée pour le plan d'automatisation (toggles configurables)
  const [targetConfigs, setTargetConfigs] = useState({
    apiConnection: false,
    manualCsvUpload: true,
    notificationInterval: 5, // J+5 par défaut
    realtimeWebhooks: false,
  });

  // Charger la préférence de guide depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kin_opere_blueprint_guide");
    if (saved !== null) {
      setShowGuide(saved === "true");
    }
  }, []);

  const toggleGuide = () => {
    const next = !showGuide;
    setShowGuide(next);
    localStorage.setItem("kin_opere_blueprint_guide", String(next));
  };

  // Définir les types de nœuds personnalisés pour le diagramme
  const nodeTypes = useMemo(() => ({ blueprintNode: BlueprintNode }), []);

  // Déclencher l'affichage du diagnostic complet PDA
  const triggerAuditRequest = (node: any) => {
    setSelectedNode(node);
    setSuccess(false);
    setDescription("");
    // Initialiser les configs cibles selon le nœud
    if (node.id === "invoice-reminder") {
      setTargetConfigs({
        apiConnection: false,
        manualCsvUpload: true,
        notificationInterval: 5,
        realtimeWebhooks: false,
      });
    } else if (node.id === "reconciliation") {
      setTargetConfigs({
        apiConnection: false,
        manualCsvUpload: false,
        notificationInterval: 1, // En continu
        realtimeWebhooks: true,
      });
    }
  };

  // Liste des nœuds
  const nodesData = [
    {
      id: "whatsapp-capture",
      label: "WhatsApp Lead Capture",
      category: "Ventes & SDR",
      description: "Capture instantanée des messages et notes vocales des clients sur WhatsApp.",
      isActive: true,
      lossHours: "0h",
      lossMoney: "0 USD",
      pdaPlan: "",
    },
    {
      id: "voice-parser",
      label: "Voice-to-Order Parser",
      category: "IA Opérationnelle",
      description: "Transcription automatique par Whisper et extraction des produits/quantités/lieux de livraison par LLM.",
      isActive: true,
      lossHours: "0h",
      lossMoney: "0 USD",
      pdaPlan: "",
    },
    {
      id: "crm-sync",
      label: "CRM Sync",
      category: "Données",
      description: "Enregistrement automatique des commandes clients et fiches prospects dans la base de données.",
      isActive: true,
      lossHours: "0h",
      lossMoney: "0 USD",
      pdaPlan: "",
    },
    {
      id: "invoice-reminder",
      label: "Facturation & Recouvrement",
      category: "Finance",
      description: "Génération de facture PDF, envoi et relance automatique par WhatsApp à J+5. (Option A : 1 crédit)",
      isActive: false,
      lossHours: "8 heures",
      lossMoney: "240 USD",
      pdaPlan: "Configuration d'un workflow de génération de factures automatique raccordé à la base comptable.",
      // Détails supplémentaires pour le Diagnostic PDA
      manualProcess: [
        "Réception manuelle du bon de commande sur WhatsApp ou Email",
        "Saisie manuelle des coordonnées et montants sur Excel ou outil local",
        "Génération manuelle du PDF de la facture",
        "Envoi manuel du fichier PDF au client sur WhatsApp",
        "Suivi manuel des dates d'échéance et relance téléphonique au client en cas de retard",
      ],
      aiMissingInfo: [
        "L'IA n'a pas accès à vos factures en attente (Odoo, Quickbooks ou Google Sheets non connectés).",
        "L'IA ne sait pas si un client a réglé sa facture pour arrêter les relances automatiques.",
        "Le canal d'envoi WhatsApp Business API n'est pas encore raccordé au module financier.",
      ],
      pdaOptimizationSteps: [
        "Raccorder votre fichier de facturation (ou API comptable) pour alimenter le robot.",
        "Mettre en place des messages de relance personnalisés et polis envoyés à J+3, J+5 et J+10.",
        "Générer dynamiquement le PDF de reçu/facture à partir de gabarits premium."
      ]
    },
    {
      id: "reconciliation",
      label: "Réconciliation Mobile Money",
      category: "Finance & Cash",
      description: "Rapprochement bancaire et lettrage automatique des flux de paiement (M-Pesa, Orange, Airtel). (Option A : 1 crédit)",
      isActive: false,
      lossHours: "15 heures",
      lossMoney: "450 USD",
      pdaPlan: "Mise en place de clés d'idempotence contre les doubles débits, script cron horaire de rapprochement bancaire et remboursements automatiques.",
      // Détails supplémentaires pour le Diagnostic PDA
      manualProcess: [
        "Réception des SMS de confirmation Mobile Money (M-Pesa, Orange Money, Airtel Money) sur des téléphones dédiés",
        "Copie manuelle de chaque transaction dans un registre de vente physique ou Excel",
        "Vérification des montants et des identifiants de transactions reçues",
        "Lettrage manuel avec les commandes en attente",
        "Gestion manuelle des litiges de double-débit ou erreurs de réseaux",
      ],
      aiMissingInfo: [
        "L'IA n'a pas accès aux relevés consolidés des comptes Mobile Money de l'entreprise.",
        "Absence de jetons d'authentification API opérateur (Vodacom M-Pesa, Orange Money, Airtel Money) sécurisés.",
        "Absence de système de détection des doubles-débits opérateur (idempotence SQL).",
      ],
      pdaOptimizationSteps: [
        "Raccorder les webhooks ou API de notification de paiement en temps réel.",
        "Implémenter une table d'idempotence SQL contre les transactions dupliquées (pertes sèches).",
        "Exécuter une réconciliation planifiée en arrière-plan toutes les heures avec notifications sur Slack/WhatsApp."
      ]
    },
  ];

  // Adapter les nœuds initiaux pour React Flow
  const initialNodes = nodesData.map((node, idx) => ({
    id: node.id,
    type: "blueprintNode",
    position: {
      x: node.id === "invoice-reminder" ? 1070 : node.id === "reconciliation" ? 1070 : idx * 340 + 50,
      y: node.id === "invoice-reminder" ? 40 : node.id === "reconciliation" ? 260 : 150,
    },
    data: {
      ...node,
      onAuditClick: () => triggerAuditRequest(node),
    },
  }));

  // Liaisons (edges)
  const initialEdges = [
    { id: "e1-2", source: "whatsapp-capture", target: "voice-parser", animated: true, style: { stroke: "#22D3EE", strokeWidth: 2 } },
    { id: "e2-3", source: "voice-parser", target: "crm-sync", animated: true, style: { stroke: "#22D3EE", strokeWidth: 2 } },
    { id: "e3-4", source: "crm-sync", target: "invoice-reminder", animated: false, style: { stroke: "rgba(255, 255, 255, 0.15)", strokeDasharray: "5,5" } },
    { id: "e3-5", source: "crm-sync", target: "reconciliation", animated: false, style: { stroke: "rgba(255, 255, 255, 0.15)", strokeDasharray: "5,5" } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Charger le statut de l'organisation
  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await fetch(`/api/organization/${orgId}`);
        if (res.ok) {
          const data = await res.json();
          setOrgPlan(data.plan);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchOrg();
  }, [orgId]);

  // Gérer la soumission du formulaire d'audit
  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    setLoading(true);
    try {
      const res = await createPdaRequest({
        organizationId: orgId,
        nodeId: selectedNode.id,
        nodeName: selectedNode.label,
        description: `Configuration cible souhaitée:
- Liaison API Directe: ${targetConfigs.apiConnection ? "OUI" : "NON"}
- Import CSV Hebdomadaire: ${targetConfigs.manualCsvUpload ? "OUI" : "NON"}
- Intervalle Relance: Relance à J+${targetConfigs.notificationInterval}
- Webhook Temps Réel: ${targetConfigs.realtimeWebhooks ? "OUI" : "NON"}
--------------------------------------------------
Détails utilisateur: ${description}`,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        alert(res.error || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // Formater le message pré-rempli pour WhatsApp
  const getWhatsAppLink = (node: any) => {
    if (!node) return "#";
    const text = `Bonjour l'équipe Kin-Opere ! Je viens de lancer l'audit PDA pour le flux "${node.label}" (ID: ${node.id}) de mon organisation. 
Je souhaite être recontacté pour connecter mes API et automatiser ce nœud opérationnel.
Voici mes paramètres cibles:
- Connexion API Directe: ${targetConfigs.apiConnection ? "Oui" : "Non"}
- Import Manuel Excel: ${targetConfigs.manualCsvUpload ? "Oui" : "Non"}
- Relance/Synchro souhaitée: J+${targetConfigs.notificationInterval}`;
    return `https://wa.me/243825828458?text=${encodeURIComponent(text)}`; // Numéro de support fictif Kin-Opere
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Header principal de la page (non affiché si on est en diagnostic) */}
      {!selectedNode && (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces flex items-center gap-2">
              <Network className="h-8 w-8 text-cyan-500" />
              Blueprint de l'Organisation
            </h1>
            <p className="text-text-secondary dark:text-white/50 mt-1">
              Visualisez, diagnostiquez et automatisez vos flux opérationnels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle de vue */}
            <div className="flex bg-zinc-900 border border-white/5 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "list" 
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/10" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Vue Simple
              </button>
              <button
                onClick={() => setViewMode("diagram")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "diagram" 
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/10" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Vue Diagramme
              </button>
            </div>

            <button
              onClick={toggleGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
            >
              <HelpCircle size={14} className="text-cyan-400" />
              {showGuide ? "Masquer le guide" : "Afficher le guide"}
            </button>
          </div>
        </header>
      )}

      {/* 2. Guide d'utilisation (non affiché si on est en diagnostic) */}
      {!selectedNode && showGuide && (
        <PremiumGlassCard className="relative overflow-hidden border border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 p-6 rounded-2xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <BookOpen className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-fraunces">✨ Comprendre le Blueprint en 1 minute</h3>
                <p className="text-xs text-zinc-400">Pourquoi et comment optimiser vos flux opérationnels ?</p>
              </div>
            </div>
            <button 
              onClick={toggleGuide}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs text-zinc-300">
            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/40 border border-white/5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                1. Flux Actifs (Verts)
              </div>
              <p className="leading-relaxed text-zinc-400">
                Ce sont vos processus opérationnels déjà automatisés. L'IA et nos scripts (via n8n) gèrent ces flux de manière transparente (ex: capture automatique des clients).
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/40 border border-white/5">
              <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
                2. Flux Non Optimisés (Gris)
              </div>
              <p className="leading-relaxed text-zinc-400">
                Ce sont des tâches manuelles répétitives effectuées par vos employés. Elles causent des pertes de temps (heures gâchées) et d'argent à votre entreprise.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-zinc-950/40 border border-cyan-500/10 bg-cyan-950/5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                <Zap size={12} className="fill-cyan-500/10" />
                3. Lancer un Audit PDA
              </div>
              <p className="leading-relaxed text-zinc-400">
                Cliquez sur **"Lancer le diagnostic PDA"** pour ouvrir l'interface d'audit. Vous y verrez ce qui bloque l'IA, les configurations à changer et comment nous contacter pour le raccorder.
              </p>
            </div>
          </div>
        </PremiumGlassCard>
      )}

      {/* 3. VUE PRINCIPALE : LISTE SIMPLE (Par défaut, simple et clair) */}
      {!selectedNode && viewMode === "list" && (
        <div className="grid grid-cols-1 gap-6">
          {nodesData.map((node) => (
            <PremiumGlassCard 
              key={node.id} 
              className={`p-6 border transition-all duration-300 ${
                node.isActive 
                  ? "border-emerald-500/10 hover:border-emerald-500/20 bg-zinc-950/20" 
                  : "border-cyan-500/10 hover:border-cyan-500/20 bg-zinc-950/30"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-black/10 dark:bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      {node.category}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${node.isActive ? "bg-emerald-500" : "bg-zinc-500 animate-pulse"}`} />
                      <span className={`text-[9px] font-bold ${node.isActive ? "text-emerald-500" : "text-zinc-500"}`}>
                        {node.isActive ? "ACTIF (N8N)" : "INACTIF (MANUEL)"}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-fraunces">{node.label}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{node.description}</p>
                </div>

                {/* Statut financier / Bouton d'action */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0">
                  {!node.isActive && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] mb-1">
                        <TrendingDown size={14} />
                        Pertes identifiées
                      </div>
                      <div className="font-semibold text-white">
                        {node.lossHours} perdues / sem
                      </div>
                    </div>
                  )}

                  <div>
                    {node.isActive ? (
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20">
                        Entièrement Optimisé
                      </div>
                    ) : (
                      <button
                        onClick={() => triggerAuditRequest(node)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider hover:from-cyan-600 hover:to-blue-700 transition-all active:scale-95"
                      >
                        Lancer le diagnostic PDA
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </PremiumGlassCard>
          ))}
        </div>
      )}

      {/* 4. VUE PRINCIPALE : DIAGRAMME REACT FLOW (Optionnel, masqué par défaut) */}
      {!selectedNode && viewMode === "diagram" && (
        <PremiumGlassCard className="h-[550px] relative overflow-hidden p-0 border border-white/5">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            className="bg-black/50"
          >
            <Background color="rgba(34, 211, 238, 0.05)" gap={16} size={1} />
            <Controls className="bg-zinc-900 border border-white/10 rounded-lg text-white" />
          </ReactFlow>
        </PremiumGlassCard>
      )}

      {/* 5. VUE DIAGNOSTIC PDA : INTERFACE COMPLÈTE & ACTIONS */}
      {selectedNode && (
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedNode(null)}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 w-fit"
          >
            <ArrowLeft size={14} />
            Retour aux flux
          </button>

          {/* Diagnostic Header */}
          <div className="border-b border-white/10 pb-6">
            <span className="text-[10px] tracking-widest font-black uppercase text-cyan-400">Diagnostic de Flux (Audit PDA)</span>
            <h2 className="text-3xl font-bold text-white font-fraunces mt-1 flex items-center gap-2">
              <Zap className="h-7 w-7 text-cyan-400 fill-cyan-400/10" />
              {selectedNode.label}
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
              Découvrez la configuration manuelle actuelle, pourquoi l'IA est bloquée, comment adapter votre environnement et comment nous contacter pour le déploiement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* COLONNE GAUCHE (8/12) : Diagnostic, blocages & architecture cible */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Card 1: Configuration Manuelle Actuelle & Pertes */}
              <PremiumGlassCard className="p-6 border-rose-500/10 bg-rose-950/5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <h3 className="text-base font-bold text-white font-fraunces flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-400" />
                    1. Configuration Manuelle Actuelle (Ce qui ne va pas)
                  </h3>
                  <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold uppercase">
                    Non optimisé
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5">
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold">Temps gâché par semaine</span>
                    <span className="text-2xl font-black text-rose-400">{selectedNode.lossHours}</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">Passé à recopier ou gérer manuellement</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5">
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold">Pertes financières indirectes</span>
                    <span className="text-2xl font-black text-rose-400">{selectedNode.lossMoney} / mois</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">Coûts de traitement ou erreurs de saisie</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Processus actuel de votre équipe :</h4>
                  <ul className="space-y-2">
                    {selectedNode.manualProcess?.map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                        <span className="h-5 w-5 shrink-0 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-[10px] font-bold text-rose-400">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </PremiumGlassCard>

              {/* Card 2: Ce qui bloque l'IA (Why it fails) */}
              <PremiumGlassCard className="p-6 border-amber-500/10 bg-amber-950/5">
                <h3 className="text-base font-bold text-white font-fraunces flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  2. Ce que l'IA n'obtient pas (Goulets techniques)
                </h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Actuellement, l'intelligence artificielle est aveugle sur ce flux car elle ne dispose pas des connexions nécessaires pour synchroniser ses actions.
                </p>
                <div className="space-y-3">
                  {selectedNode.aiMissingInfo?.map((missing: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-zinc-950/30 border border-white/5 flex items-start gap-3">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <p className="text-xs text-zinc-300 leading-relaxed">{missing}</p>
                    </div>
                  ))}
                </div>
              </PremiumGlassCard>

              {/* Card 3: Target Target Optimization Config */}
              <PremiumGlassCard className="p-6 border-cyan-500/10">
                <h3 className="text-base font-bold text-white font-fraunces flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                  <Cpu className="h-5 w-5 text-cyan-400" />
                  3. Configuration Cible (Paramètres à modifier)
                </h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Voici le plan d'automatisation recommandé par Kin-Opere. Ajustez les paramètres ci-dessous en fonction de vos préférences pour configurer le robot cible :
                </p>

                {/* Formulaire de simulation de configuration */}
                <div className="space-y-4">
                  {selectedNode.id === "invoice-reminder" && (
                    <>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/50 border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-white block">Connexion API Directe (Recommandé)</span>
                          <span className="text-[10px] text-zinc-500 block">Lier l'IA directement à Odoo/Quickbooks/Excel</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTargetConfigs(prev => ({ ...prev, apiConnection: !prev.apiConnection }))}
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${targetConfigs.apiConnection ? "bg-cyan-500" : "bg-white/10"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${targetConfigs.apiConnection ? "left-7" : "left-1"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/50 border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-white block">Import par Fichier Excel/CSV hebdomadaire</span>
                          <span className="text-[10px] text-zinc-500 block">Si vous préférez téléverser manuellement un tableur</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTargetConfigs(prev => ({ ...prev, manualCsvUpload: !prev.manualCsvUpload }))}
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${targetConfigs.manualCsvUpload ? "bg-cyan-500" : "bg-white/10"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${targetConfigs.manualCsvUpload ? "left-7" : "left-1"}`} />
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/5 space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Délai avant relance automatique</span>
                            <span className="text-[10px] text-zinc-500 block">Nombre de jours après l'échéance de facture</span>
                          </div>
                          <span className="text-xs font-bold text-cyan-400">J+{targetConfigs.notificationInterval} jours</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={targetConfigs.notificationInterval}
                          onChange={(e) => setTargetConfigs(prev => ({ ...prev, notificationInterval: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    </>
                  )}

                  {selectedNode.id === "reconciliation" && (
                    <>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/50 border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-white block">Webhooks de Notification Temps Réel</span>
                          <span className="text-[10px] text-zinc-500 block">Recevoir et enregistrer les paiements à la seconde près</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTargetConfigs(prev => ({ ...prev, realtimeWebhooks: !prev.realtimeWebhooks }))}
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${targetConfigs.realtimeWebhooks ? "bg-cyan-500" : "bg-white/10"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${targetConfigs.realtimeWebhooks ? "left-7" : "left-1"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/50 border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-white block">Intégration d'Idempotence SQL</span>
                          <span className="text-[10px] text-zinc-500 block">Bloquer automatiquement les doubles débits opérateurs</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTargetConfigs(prev => ({ ...prev, apiConnection: !prev.apiConnection }))}
                          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${targetConfigs.apiConnection ? "bg-cyan-500" : "bg-white/10"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${targetConfigs.apiConnection ? "left-7" : "left-1"}`} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Plan d'automatisation cible :</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedNode.pdaPlan}
                  </p>
                </div>
              </PremiumGlassCard>
            </div>

            {/* COLONNE DROITE (4/12) : Comment nous contacter (WhatsApp, Formulaire) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Box 1: WhatsApp Direct Link (Quick Contact) */}
              <PremiumGlassCard className="p-6 border-emerald-500/20 bg-emerald-950/5 flex flex-col justify-between h-fit space-y-4">
                <div className="space-y-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 w-fit text-emerald-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-fraunces">Contact direct WhatsApp</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Communiquez en direct avec nos ingénieurs système pour activer vos intégrations techniques et vos API.
                  </p>
                </div>

                <a
                  href={getWhatsAppLink(selectedNode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageSquare size={16} className="fill-white/10" />
                  Discuter sur WhatsApp
                  <ExternalLink size={12} />
                </a>
              </PremiumGlassCard>

              {/* Box 2: Callback / Ticket Form */}
              <PremiumGlassCard className="p-6 border-white/5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-fraunces">Demander l'intégration</h3>
                  <p className="text-[11px] text-zinc-400">
                    Envoyez vos spécifications. Un ingénieur de Kin-Opere vous contactera d'ici 24h.
                  </p>
                </div>

                {!success ? (
                  <form onSubmit={handleSubmitAudit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Spécifiez vos contraintes ou vos outils actuels :
                      </label>
                      <textarea
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Nous facturons actuellement sur un fichier Excel partagé sur OneDrive et devons envoyer le SMS de paiement par M-Pesa."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        "Enregistrement..."
                      ) : (
                        <>
                          <Send size={12} />
                          Enregistrer la Demande
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-6 space-y-3 bg-zinc-950/40 rounded-xl border border-emerald-500/20 p-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
                    <h4 className="text-sm font-bold text-white">Demande enregistrée !</h4>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Votre audit technique pour le nœud **{selectedNode.label}** a été transmis. Notre équipe prend contact avec vous sous 24h.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold"
                    >
                      Faire une autre demande
                    </button>
                  </div>
                )}
              </PremiumGlassCard>

              {/* Call-to-action assistance */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-950/50 border border-white/5">
                <Phone className="h-5 w-5 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[8px] text-zinc-500 block uppercase font-bold">Assistance Kinshasa</span>
                  <span className="text-xs font-bold text-white">+243 825 828 458</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
