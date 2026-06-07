"use client";

import React, { useState, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Network, Zap, X, ShieldCheck, CheckCircle2, TrendingDown } from "lucide-react";
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
      {/* Node Inputs/Outputs handles via position class names of reactflow handles */}
      {/* Left/Right handles default placement */}
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
          Analyser ce nœud
        </button>
      )}
    </div>
  );
};

export default function BlueprintPage({ params }: { params: { orgId: string } }) {
  const { orgId } = params;
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orgPlan, setOrgPlan] = useState("STANDARD");

  // Définir les types de nœuds personnalisés
  const nodeTypes = useMemo(() => ({ blueprintNode: BlueprintNode }), []);

  // Déclencher l'ouverture du tiroir d'audit
  const triggerAuditRequest = (node: any) => {
    setSelectedNode(node);
    setDrawerOpen(true);
    setSuccess(false);
    setDescription("");
  };

  // Liste des nœuds initiaux
  const initialNodes: any[] = [
    {
      id: "whatsapp-capture",
      type: "blueprintNode",
      position: { x: 50, y: 150 },
      data: {
        label: "WhatsApp Lead Capture",
        category: "Ventes & SDR",
        description: "Capture instantanée des messages et notes vocales des clients sur WhatsApp.",
        isActive: true,
      },
    },
    {
      id: "voice-parser",
      type: "blueprintNode",
      position: { x: 390, y: 150 },
      data: {
        label: "Voice-to-Order Parser",
        category: "IA Opérationnelle",
        description: "Transcription automatique par Whisper et extraction des produits/quantités/lieux de livraison par LLM.",
        isActive: true,
      },
    },
    {
      id: "crm-sync",
      type: "blueprintNode",
      position: { x: 730, y: 150 },
      data: {
        label: "CRM Sync",
        category: "Données",
        description: "Enregistrement automatique des commandes clients et fiches prospects dans la base de données.",
        isActive: true,
      },
    },
    {
      id: "invoice-reminder",
      type: "blueprintNode",
      position: { x: 1070, y: 40 },
      data: {
        label: "Facturation & Recouvrement",
        category: "Finance",
        description: "Génération de facture PDF, envoi et relance automatique par WhatsApp à J+5. (Option A : 1 crédit)",
        isActive: false,
        onAuditClick: () => triggerAuditRequest({
          id: "invoice-reminder",
          name: "Facturation & Recouvrement",
          lossHours: "8 heures",
          lossMoney: "240 USD",
          pdaPlan: "Configuration d'un workflow de génération de factures automatique raccordé à la base comptable.",
        }),
      },
    },
    {
      id: "reconciliation",
      type: "blueprintNode",
      position: { x: 1070, y: 260 },
      data: {
        label: "Réconciliation Mobile Money",
        category: "Finance & Cash",
        description: "Rapprochement bancaire et lettrage automatique des flux de paiement (M-Pesa, Orange, Airtel). (Option A : 1 crédit)",
        isActive: false,
        onAuditClick: () => triggerAuditRequest({
          id: "reconciliation",
          name: "Réconciliation Mobile Money",
          lossHours: "15 heures",
          lossMoney: "450 USD",
          pdaPlan: "Mise en place de clés d'idempotence contre les doubles débits, script cron horaire de rapprochement bancaire et remboursements automatiques.",
        }),
      },
    },
  ];

  // Liste des liaisons (edges)
  const initialEdges = [
    {
      id: "e1-2",
      source: "whatsapp-capture",
      target: "voice-parser",
      animated: true,
      style: { stroke: "#22D3EE", strokeWidth: 2 },
    },
    {
      id: "e2-3",
      source: "voice-parser",
      target: "crm-sync",
      animated: true,
      style: { stroke: "#22D3EE", strokeWidth: 2 },
    },
    {
      id: "e3-4",
      source: "crm-sync",
      target: "invoice-reminder",
      animated: false,
      style: { stroke: "rgba(255, 255, 255, 0.15)", strokeDasharray: "5,5" },
    },
    {
      id: "e3-5",
      source: "crm-sync",
      target: "reconciliation",
      animated: false,
      style: { stroke: "rgba(255, 255, 255, 0.15)", strokeDasharray: "5,5" },
    },
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
        nodeName: selectedNode.name,
        description,
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces flex items-center gap-2">
            <Network className="h-8 w-8 text-cyan-500" />
            Blueprint de l'Organisation
          </h1>
          <p className="text-text-secondary dark:text-white/50 mt-1">
            Visualisez et gérez vos flux d'automatisation. Activez de nouveaux canaux opérationnels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary dark:text-white/40">Statut Client :</span>
          <span className={`text-xs px-3 py-1 rounded-full font-black tracking-widest uppercase border ${
            orgPlan === "PREMIUM" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
          }`}>
            {orgPlan === "PREMIUM" ? "Enterprise Active" : "Standard"}
          </span>
        </div>
      </header>

      {/* Blueprint Board */}
      <PremiumGlassCard className="h-[600px] relative overflow-hidden p-0 border border-white/5">
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

      {/* Lateral Drawer for PDA Audit */}
      {drawerOpen && selectedNode && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-zinc-950/95 border-l border-white/10 shadow-2xl flex flex-col p-6 overflow-y-auto transition-transform duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 font-fraunces">
              <Zap className="h-5 w-5 text-cyan-400 fill-cyan-400/10" />
              Audit de Flux (PDA)
            </h3>
            <button 
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {!success ? (
            <div className="space-y-6 flex-grow">
              <div>
                <span className="text-[10px] tracking-widest font-black uppercase text-cyan-400">Nœud analysé</span>
                <h4 className="text-lg font-bold text-white mt-1">{selectedNode.name}</h4>
              </div>

              {/* Losses Widget */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <TrendingDown size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Pertes d'inefficacité identifiées</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold">Temps Perdu</span>
                    <span className="text-base font-bold text-white">{selectedNode.lossHours} / semaine</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold">Coût Indirect</span>
                    <span className="text-base font-bold text-white">{selectedNode.lossMoney} / mois</span>
                  </div>
                </div>
              </div>

              {/* Plan PDA Description */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Plan d'automatisation cible</h5>
                <p className="text-xs text-zinc-400 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                  {selectedNode.pdaPlan}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitAudit} className="space-y-4 pt-4 border-t border-white/10">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Décrivez vos contraintes opérationnelles actuelles :
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Papa Kabeya passe 2h chaque soir à réconcilier les captures de paiement M-Pesa reçues sur WhatsApp avec le registre de vente."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 active:scale-98"
                >
                  {loading ? "Envoi en cours..." : "Demander mon audit PDA Gratuit"}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-bounce" />
              <h4 className="text-lg font-bold text-white">Demande enregistrée !</h4>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                Votre demande de Plan Directeur d'Automatisation (PDA) pour le nœud **{selectedNode.name}** a été soumise avec succès. 
                Un ingénieur de Kin-Opere prendra contact avec vous d'ici 24h pour finaliser l'audit technique.
              </p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
