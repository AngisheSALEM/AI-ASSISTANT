"use client";

import React, { useState, useEffect } from "react";
import { Title, Text, Button, Flex, Badge } from "@tremor/react";
import { MessageCircle, Mail, Globe, Calendar, Zap, MessageSquare, Bot, RefreshCw, Smartphone } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { Modal } from "@/components/ui/Modal";
import { getWhatsAppQrCode, saveWhatsAppSession } from "@/lib/actions/whatsapp-connect";
import { useSearchParams } from "next/navigation";

export default function IntegrationsPage({ params }: { params: { orgId: string } }) {
  const { orgId } = params;
  const searchParams = useSearchParams();
  const setupMode = searchParams.get("setup");

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savingSession, setSavingSession] = useState(false);
  const [waConnected, setWaConnected] = useState(false);
  const [waPhone, setWaPhone] = useState("");

  // Integrations data
  const [integrations, setIntegrations] = useState([
    { id: "whatsapp", name: "WhatsApp Business", icon: MessageCircle, status: "Available", category: "Social", color: "text-green-500", desc: "Connectez vos agents à votre numéro WhatsApp standard ou business." },
    { id: "telegram", name: "Telegram Bot", icon: MessageSquare, status: "Available", category: "Social", color: "text-blue-400", desc: "Interagissez avec vos clients sur Telegram." },
    { id: "gmail", name: "Gmail Automation", icon: Mail, status: "Connected", category: "Email", color: "text-red-500", desc: "L'agent peut lire et répondre à vos emails professionnels." },
    { id: "calendar", name: "Google Calendar", icon: Calendar, status: "Connected", category: "Productivity", color: "text-blue-600", desc: "Permettez à l'agent de prendre des rendez-vous." },
    { id: "zapier", name: "Zapier", icon: Zap, status: "Available", category: "Automation", color: "text-orange-500", desc: "Connectez Opere à +5000 applications." },
    { id: "widget", name: "Website Widget", icon: Globe, status: "Available", category: "Web", color: "text-gray-900 dark:text-white", desc: "Ajoutez un chat bot directement sur votre site web." },
  ]);

  // Load current WhatsApp connection status
  useEffect(() => {
    async function checkWaStatus() {
      try {
        const res = await fetch(`/api/organization/${orgId}`);
        if (res.ok) {
          const org = await res.json();
          // We can check integrations relation instead
          const integrationsRes = await fetch(`/api/organization/${orgId}`); // placeholder or check db integrations list
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkWaStatus();

    // Check query params to open WhatsApp setup modal
    if (setupMode === "whatsapp") {
      handleWhatsAppSetup();
    }
  }, [orgId, setupMode]);

  const handleWhatsAppSetup = async () => {
    setIsQrModalOpen(true);
    setLoadingQr(true);
    setQrCode(null);
    try {
      const res = await getWhatsAppQrCode(orgId);
      if (res.success && res.qrCode) {
        setQrCode(res.qrCode);
        setIsMock(!!res.isMock);
      } else {
        alert("Impossible de générer le QR Code.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleConfirmMockConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setSavingSession(true);
    try {
      const res = await saveWhatsAppSession(orgId, phoneNumber);
      if (res.success) {
        setWaConnected(true);
        setWaPhone(phoneNumber);
        // Update local status of integrations list
        setIntegrations((prev) =>
          prev.map((item) => (item.id === "whatsapp" ? { ...item, status: "Connected" } : item))
        );
        setIsQrModalOpen(false);
      } else {
        alert(res.error || "Erreur de sauvegarde de la session.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSession(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces">Intégrations</h1>
        <p className="text-text-secondary dark:text-white/50 mt-1">Connectez vos agents à vos outils préférés et vos canaux de vente.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((app, i) => (
          <PremiumGlassCard key={i} className="flex flex-col h-full p-6">
            <Flex alignItems="start">
              <div className={`p-4 bg-black/5 dark:bg-white/5 rounded-2xl ${app.color}`}>
                <app.icon size={24} />
              </div>
              <Badge color={app.status === "Connected" || (app.id === "whatsapp" && waConnected) ? "emerald" : "gray"}>
                {app.status === "Connected" || (app.id === "whatsapp" && waConnected) ? "Connecté" : "Disponible"}
              </Badge>
            </Flex>
            <div className="mt-6 flex-grow">
              <h3 className="text-xl font-bold text-text-primary dark:text-white">{app.name}</h3>
              <Text className="text-xs font-medium uppercase tracking-wider text-blue-500 mt-1">{app.category}</Text>
              <Text className="mt-4 text-sm leading-relaxed text-text-secondary dark:text-white/60">
                {app.id === "whatsapp" && waConnected 
                  ? `Connecté au numéro : ${waPhone}` 
                  : app.desc}
              </Text>
            </div>
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
               <Button 
                  variant={app.status === "Connected" || (app.id === "whatsapp" && waConnected) ? "secondary" : "primary"} 
                  className="w-full rounded-xl"
                  onClick={app.id === "whatsapp" ? handleWhatsAppSetup : undefined}
               >
                  {app.status === "Connected" || (app.id === "whatsapp" && waConnected) ? "Configurer" : "Installer"}
               </Button>
            </div>
          </PremiumGlassCard>
        ))}
      </div>

      <PremiumGlassCard className="bg-gradient-to-r from-blue-600 to-indigo-700 border-none p-8">
        <Flex className="flex-col md:flex-row gap-6" alignItems="start">
           <div className="space-y-2">
              <Title className="text-white font-fraunces">Besoin d'une intégration sur mesure ?</Title>
              <Text className="text-blue-100">Nos ingénieurs peuvent développer des connecteurs spécifiques pour vos logiciels internes.</Text>
           </div>
           <Button icon={Bot} color="zinc" className="rounded-xl shrink-0">Contacter le support</Button>
        </Flex>
      </PremiumGlassCard>

      {/* WhatsApp QR Connection Modal */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}>
        <div className="space-y-6 p-4">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white font-fraunces flex items-center justify-center gap-2">
              <MessageCircle className="text-emerald-400" />
              Connexion WhatsApp
            </h3>
            <p className="text-xs text-zinc-400">
              Scannez le QR Code depuis l'application WhatsApp de votre téléphone (Appareils connectés).
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/5 rounded-2xl min-h-[280px]">
            {loadingQr ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={28} className="text-cyan-500 animate-spin" />
                <span className="text-xs text-zinc-400">Génération du QR Code en cours...</span>
              </div>
            ) : qrCode ? (
              <div className="space-y-4 text-center">
                <img 
                  src={qrCode} 
                  alt="WhatsApp QR Code" 
                  className="w-48 h-48 border border-white/10 p-2 bg-white rounded-xl mx-auto shadow-2xl" 
                />
                
                {isMock && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-3 max-w-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">Simulation Locale</span>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      L'instance n8n locale est hors-ligne. Saisissez votre numéro de boutique ci-dessous pour simuler un scan de Papa Kabeya.
                    </p>
                    <form onSubmit={handleConfirmMockConnection} className="space-y-2">
                      <input 
                        type="text"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ex: +243812345678"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white text-center focus:outline-none focus:border-cyan-500"
                      />
                      <button 
                        type="submit"
                        disabled={savingSession}
                        className="w-full py-1.5 bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                      >
                        {savingSession ? "..." : "Confirmer le scan QR"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-rose-400">Échec du chargement du QR Code.</p>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 text-[10px] text-zinc-400 leading-relaxed">
            <Smartphone size={24} className="text-cyan-400 shrink-0" />
            <p>
              Pour connecter votre compte : ouvrez WhatsApp ➔ Menu (trois points ou réglages) ➔ Appareils connectés ➔ Connecter un appareil, puis pointez votre caméra vers l'écran.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
