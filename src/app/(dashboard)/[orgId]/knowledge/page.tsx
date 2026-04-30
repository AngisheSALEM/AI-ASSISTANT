"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  Globe,
  MessageSquarePlus,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  RefreshCcw,
  Cloud,
  Plus
} from "lucide-react";
import { Card, Title, Text, Button, Flex, Badge, ProgressBar, TextInput } from "@tremor/react";

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState("documents");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white font-fraunces">Base de Connaissances</h1>
        <p className="text-gray-500 dark:text-white/50 mt-1">
          Gérez les informations que vos agents utilisent pour répondre aux clients.
        </p>
      </header>

      <div className="flex border-b border-gray-200 dark:border-white/10 overflow-x-auto">
        {[
          { id: "documents", label: "Documents", icon: FileText },
          { id: "scraping", label: "URL Scraping", icon: Globe },
          { id: "faq", label: "FAQ Builder", icon: MessageSquarePlus },
          { id: "cloud", label: "Synchro Cloud", icon: Cloud },
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
        <div className="lg:col-span-2 space-y-8">
          {activeTab === "documents" && (
            <Card>
              <Title className="dark:text-white mb-6">Upload de Documents</Title>
              <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer group">
                <div className="p-4 bg-white dark:bg-white/10 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold dark:text-white">Glissez vos fichiers ici</p>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-1">PDF, DOCX, XLSX ou CSV (Max 25MB)</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <Text className="font-medium dark:text-white">Documents récents</Text>
                {[
                  { name: "Catalogue_2024.pdf", size: "2.4 MB", status: "Indexé", progress: 100 },
                  { name: "Tarifs_Kinshasa.xlsx", size: "1.1 MB", status: "Indexation...", progress: 65 },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-500" />
                      <div>
                        <Text className="font-medium dark:text-white">{doc.name}</Text>
                        <Text className="text-xs dark:text-white/40">{doc.size}</Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-32 hidden md:block">
                        <ProgressBar value={doc.progress} color={doc.progress === 100 ? "emerald" : "blue"} />
                      </div>
                      <Badge color={doc.progress === 100 ? "emerald" : "blue"}>{doc.status}</Badge>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "scraping" && (
            <Card>
              <Title className="dark:text-white mb-6">Website Scraping</Title>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-white">URL du site web</label>
                  <div className="flex gap-2">
                    <TextInput icon={Globe} placeholder="https://votre-entreprise.com" className="flex-1" />
                    <Button>Scanner</Button>
                  </div>
                  <Text className="text-xs dark:text-white/40">L'agent lira toutes les pages publiques et indexera le contenu.</Text>
                </div>

                <div className="mt-8 space-y-4">
                  <Text className="font-medium dark:text-white">Sites indexés</Text>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="text-blue-500" />
                      <div>
                        <Text className="font-medium dark:text-white">https://www.k-solutions.cd</Text>
                        <Text className="text-xs dark:text-white/40">Dernier scan: il y a 2 jours • 42 pages</Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="xs" variant="secondary" icon={RefreshCcw}>Rescan</Button>
                      <button className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "faq" && (
            <Card>
              <Title className="dark:text-white mb-6">FAQ Builder</Title>
              <div className="space-y-6">
                <div className="p-6 border border-dashed border-gray-200 dark:border-white/10 rounded-xl space-y-4">
                  <div className="space-y-2">
                    <Text className="font-medium dark:text-white">Question</Text>
                    <TextInput placeholder="ex: Quels sont vos horaires d'ouverture ?" />
                  </div>
                  <div className="space-y-2">
                    <Text className="font-medium dark:text-white">Réponse</Text>
                    <TextInput placeholder="ex: Nous sommes ouverts du lundi au samedi de 8h à 18h." />
                  </div>
                  <Button icon={Plus}>Ajouter à la base</Button>
                </div>

                <div className="mt-8 space-y-2">
                  <Text className="font-medium dark:text-white">Questions enregistrées (12)</Text>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                      <Flex>
                        <Text className="font-bold dark:text-white">Question {i}</Text>
                        <button className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </Flex>
                      <Text className="mt-1 text-sm dark:text-white/60">Contenu de la réponse pré-enregistrée pour l'agent.</Text>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === "cloud" && (
            <Card>
              <Title className="dark:text-white mb-6">Synchro Cloud</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { name: "Google Drive", icon: Cloud, color: "text-blue-500", connected: true },
                   { name: "Notion", icon: ExternalLink, color: "text-black dark:text-white", connected: false },
                   { name: "OneDrive", icon: Cloud, color: "text-blue-600", connected: false },
                   { name: "Slack", icon: MessageSquarePlus, color: "text-purple-500", connected: false },
                 ].map((app, i) => (
                   <div key={i} className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col gap-4">
                      <Flex>
                         <div className={`p-3 bg-white dark:bg-white/10 rounded-xl ${app.color}`}>
                            <app.icon size={24} />
                         </div>
                         {app.connected ? <Badge color="emerald">Connecté</Badge> : <Badge color="gray">Disponible</Badge>}
                      </Flex>
                      <div>
                         <Text className="font-bold dark:text-white">{app.name}</Text>
                         <Text className="text-xs dark:text-white/40">Synchronisez vos fichiers automatiquement.</Text>
                      </div>
                      <Button variant={app.connected ? "secondary" : "primary"} className="w-full">
                         {app.connected ? "Gérer" : "Connecter"}
                      </Button>
                   </div>
                 ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-8">
           <Card className="bg-blue-600 border-none">
              <Title className="text-white">Gestion de la Vérité</Title>
              <Text className="text-blue-100 mt-2">
                Définissez les limites strictes pour vos agents.
              </Text>
              <div className="mt-6 space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-blue-200">Champ d'Exception</label>
                    <textarea
                      className="w-full bg-blue-700/50 border border-blue-400/30 rounded-xl p-3 text-white text-sm placeholder:text-blue-300/50 focus:outline-none focus:ring-1 focus:ring-white/30"
                      rows={4}
                      placeholder="Ex: Ne jamais mentionner les prix des concurrents. Ne pas promettre de remise sans accord."
                    />
                 </div>
                 <Button color="blue" className="w-full">Sauvegarder</Button>
              </div>
           </Card>

           <Card>
              <Title className="dark:text-white">Statut de l'Indexation</Title>
              <div className="mt-6 space-y-6">
                 <div>
                    <Flex>
                       <Text className="dark:text-white/60">Espace Utilisé</Text>
                       <Text className="dark:text-white font-bold">12.4 MB / 1 GB</Text>
                    </Flex>
                    <ProgressBar value={1.2} color="blue" className="mt-2" />
                 </div>
                 <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" />
                    <Text className="text-xs text-emerald-700 dark:text-emerald-400">Toutes les sources sont synchronisées et prêtes.</Text>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
