"use client";

import React from "react";
import { Card, Title, Text, AreaChart, BarChart, DonutChart, Grid, Col, Metric, BadgeDelta, Flex, Badge } from "@tremor/react";
import { TrendingUp, Users, MessageSquare, Clock, FileText, Download } from "lucide-react";

const chartdata = [
  { date: "Jan 23", "Interactions": 2890, "Résolutions": 2338 },
  { date: "Feb 23", "Interactions": 2756, "Résolutions": 2103 },
  { date: "Mar 23", "Interactions": 3322, "Résolutions": 2194 },
  { date: "Apr 23", "Interactions": 3470, "Résolutions": 2108 },
  { date: "May 23", "Interactions": 3475, "Résolutions": 1812 },
  { date: "Jun 23", "Interactions": 3129, "Résolutions": 1726 },
];

const categories = [
  { name: "Support Client", amount: 4890 },
  { name: "Ventes", amount: 2103 },
  { name: "Prise de RDV", amount: 1405 },
  { name: "RH / Interne", amount: 1200 },
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold tracking-tight dark:text-white font-fraunces">Insights & Reports</h1>
           <p className="text-gray-500 dark:text-white/50 mt-1">Analyse détaillée de la performance de vos agents IA.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95">
           <Download size={18} />
           Export CSV
        </button>
      </header>

      <Grid numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start">
            <Text>Volume Total</Text>
            <BadgeDelta deltaType="moderateIncrease" />
          </Flex>
          <Metric>14,723</Metric>
          <Text className="mt-2 text-xs">Messages gérés ce mois</Text>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <Flex alignItems="start">
            <Text>Taux de Satisfaction</Text>
            <BadgeDelta deltaType="increase" />
          </Flex>
          <Metric>94.2%</Metric>
          <Text className="mt-2 text-xs">Basé sur les retours clients</Text>
        </Card>
        <Card decoration="top" decorationColor="orange">
          <Flex alignItems="start">
            <Text>Temps Moyen de Réponse</Text>
            <BadgeDelta deltaType="decrease" />
          </Flex>
          <Metric>1.2s</Metric>
          <Text className="mt-2 text-xs">Vs 4.5m pour un humain</Text>
        </Card>
        <Card decoration="top" decorationColor="violet">
          <Flex alignItems="start">
            <Text>Coût par Résolution</Text>
            <BadgeDelta deltaType="moderateDecrease" />
          </Flex>
          <Metric>0.08 $</Metric>
          <Text className="mt-2 text-xs">Crédits convertis en USD</Text>
        </Card>
      </Grid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <Title>Évolution des Conversations</Title>
          <AreaChart
            className="h-72 mt-4"
            data={chartdata}
            index="date"
            categories={["Interactions", "Résolutions"]}
            colors={["blue", "emerald"]}
          />
        </Card>
        <Card>
          <Title>Répartition par Catégorie</Title>
          <DonutChart
            className="h-72 mt-4"
            data={categories}
            category="amount"
            index="name"
            colors={["blue", "cyan", "indigo", "violet"]}
          />
        </Card>
      </div>

      <Card>
        <Title>Historique des Rapports Quotidiens</Title>
        <div className="mt-6 space-y-4">
           {[1, 2, 3, 4].map((i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 transition-all hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600">
                      <FileText size={20} />
                   </div>
                   <div>
                      <Text className="font-bold dark:text-white">Rapport du {15 - i} Octobre 2024</Text>
                      <Text className="text-xs dark:text-white/40">Résumé généré par IA • 128 conversations analysées</Text>
                   </div>
                </div>
                <Badge color="blue">Premium</Badge>
             </div>
           ))}
        </div>
      </Card>
    </div>
  );
}
