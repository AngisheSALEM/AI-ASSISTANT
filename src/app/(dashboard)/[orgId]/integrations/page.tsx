"use client";

import React from "react";
import { Title, Text, Button, Flex, Badge } from "@tremor/react";
import { MessageCircle, Mail, Globe, Calendar, Zap, MessageSquare, Bot } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

export default function IntegrationsPage() {
  const integrations = [
    { name: "WhatsApp Business", icon: MessageCircle, status: "Connected", category: "Social", color: "text-green-500", desc: "Connectez vos agents à votre numéro WhatsApp officiel." },
    { name: "Telegram Bot", icon: MessageSquare, status: "Available", category: "Social", color: "text-blue-400", desc: "Interagissez avec vos clients sur Telegram." },
    { name: "Gmail Automation", icon: Mail, status: "Connected", category: "Email", color: "text-red-500", desc: "L'agent peut lire et répondre à vos emails professionnels." },
    { name: "Google Calendar", icon: Calendar, status: "Connected", category: "Productivity", color: "text-blue-600", desc: "Permettez à l'agent de prendre des rendez-vous." },
    { name: "Zapier", icon: Zap, status: "Available", category: "Automation", color: "text-orange-500", desc: "Connectez Opere à +5000 applications." },
    { name: "Website Widget", icon: Globe, status: "Available", category: "Web", color: "text-gray-900 dark:text-white", desc: "Ajoutez un chat bot directement sur votre site web." },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary dark:text-white font-fraunces">Integrations</h1>
        <p className="text-text-secondary dark:text-white/50 mt-1">Connectez vos agents à vos outils préférés et vos canaux de vente.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((app, i) => (
          <PremiumGlassCard key={i} className="flex flex-col h-full p-6">
            <Flex alignItems="start">
              <div className={`p-4 bg-black/5 dark:bg-white/5 rounded-2xl ${app.color}`}>
                <app.icon size={24} />
              </div>
              <Badge color={app.status === "Connected" ? "emerald" : "gray"}>
                {app.status === "Connected" ? "Connecté" : "Disponible"}
              </Badge>
            </Flex>
            <div className="mt-6 flex-grow">
              <h3 className="text-xl font-bold text-text-primary dark:text-white">{app.name}</h3>
              <Text className="text-xs font-medium uppercase tracking-wider text-blue-500 mt-1">{app.category}</Text>
              <Text className="mt-4 text-sm leading-relaxed text-text-secondary dark:text-white/60">
                {app.desc}
              </Text>
            </div>
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
               <Button variant={app.status === "Connected" ? "secondary" : "primary"} className="w-full">
                  {app.status === "Connected" ? "Configurer" : "Installer"}
               </Button>
            </div>
          </PremiumGlassCard>
        ))}
      </div>

      <PremiumGlassCard className="bg-gradient-to-r from-blue-600 to-indigo-700 border-none p-8">
        <Flex>
           <div className="space-y-2">
              <Title className="text-white">Besoin d'une intégration sur mesure ?</Title>
              <Text className="text-blue-100">Nos ingénieurs peuvent développer des connecteurs spécifiques pour vos logiciels internes.</Text>
           </div>
           <Button icon={Bot}>Contacter le support</Button>
        </Flex>
      </PremiumGlassCard>
    </div>
  );
}
