"use client";

import React from "react";
import { Card, Title, Text, Button, Flex, Badge } from "@tremor/react";
import { MessageCircle, Mail, Globe, Calendar, Zap, MessageSquare, Bot } from "lucide-react";

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
        <h1 className="text-3xl font-bold tracking-tight dark:text-white font-fraunces">Integrations</h1>
        <p className="text-gray-500 dark:text-white/50 mt-1">Connectez vos agents à vos outils préférés et vos canaux de vente.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((app, i) => (
          <Card key={i} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-gray-100 dark:border-white/5">
            <Flex alignItems="start">
              <div className={`p-4 bg-gray-50 dark:bg-white/5 rounded-2xl ${app.color}`}>
                <app.icon size={24} />
              </div>
              <Badge color={app.status === "Connected" ? "emerald" : "gray"}>
                {app.status === "Connected" ? "Connecté" : "Disponible"}
              </Badge>
            </Flex>
            <div className="mt-6 flex-grow">
              <Title className="dark:text-white">{app.name}</Title>
              <Text className="text-xs font-medium uppercase tracking-wider text-blue-500 mt-1">{app.category}</Text>
              <Text className="mt-4 text-sm leading-relaxed dark:text-white/60">
                {app.desc}
              </Text>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
               <Button variant={app.status === "Connected" ? "secondary" : "primary"} className="w-full">
                  {app.status === "Connected" ? "Configurer" : "Installer"}
               </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 border-none">
        <Flex>
           <div className="space-y-2">
              <Title className="text-white">Besoin d'une intégration sur mesure ?</Title>
              <Text className="text-blue-100">Nos ingénieurs peuvent développer des connecteurs spécifiques pour vos logiciels internes.</Text>
           </div>
           <Button icon={Bot}>Contacter le support</Button>
        </Flex>
      </Card>
    </div>
  );
}
