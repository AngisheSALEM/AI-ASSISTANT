# 🎯 Kin Opere — Contexte, Architecture & Vision Commerciale

Ce document sert de **source unique de vérité** et de mémoire de contexte pour le développement de la plateforme SaaS B2B **Kin Opere**. Il décrit la vision, l'architecture globale, le fonctionnement détaillé des flux et l'état actuel de l'implémentation.

---

## 🎯 1. La Vision Commerciale de Kin Opere (B2B)

**Kin Opere** est un SaaS d'orchestration et de gestion de processus pour les entreprises (cabinets comptables, agences logistiques, etc.) opérant à Kinshasa et à l'international. La plateforme propose deux grandes familles de services monétisables :

1. **L'Automatisation (Processus Fixe) :** 
   - Un workflow entièrement déterministe. 
   - Règle simple : *"Si l'événement A se produit, alors l'action B s'exécute"* (ex : Générer un reçu PDF dès qu'un paiement est validé).
   - Consomme **1 crédit**.

2. **L'Agent IA (Objectif Autonome) :** 
   - Un "employé virtuel" intelligent à qui l'on confie un objectif complexe.
   - Il utilise ses protocoles d'outils, réfléchit de manière autonome et produit un livrable final structuré (ex : *"Analyse ce bilan comptable complexe et sors la liste des anomalies"*).
   - Consomme **20 crédits** (ou 5 crédits pour la version Flash).

---

## 🏗️ 2. L'Architecture Technique Globale (Développement & Local)

Next.js (Vercel) sert d'interface utilisateur et de cerveau administratif, tandis que **n8n** sert de moteur d'exécution dynamique distant pour déporter l'exécution de l'IA et économiser les ressources serverless.

```
   ┌────────────────────────────────────────────────────────┐
   │                  Vercel (Cloud)                        │
   │  - Frontend Next.js (Interface Premium)                 │
   │  - API de Gestion (Prisma ORM + PostgreSQL)             │
   │  - Sécurité & Contrôle des Crédits (Transactions)      │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              │ Appel Webhook (POST HTTP JSON)
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │             Tunnel Sécurisé (Ngrok / PC Local)         │
   │  - Passerelle HTTPS temporaire & gratuite vers n8n      │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │                  n8n (PC Local ➔ VPS)                  │
   │  - Instance dynamique unique                           │
   │  - Base de données PostgreSQL (via Docker)             │
   │  - Reçoit les ordres de Next.js                        │
   └──────────────────────────┬─────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│  Gardien (Gemini Flash) │               │   Agents Spécialisés    │
│  - Analyse la tâche     │               │   - Gemini Pro (Payant) │
│  - Route vers le bon    │               │   - Protocole Multi-Agent  │
│    workflow (Gratuit)   │               │   - Exécution des outils    │
└─────────────────────────┘               └────────┬────────────────┘
                                                   │
                                                   ▼
                                 ┌──────────────────────────────────┐
                                 │       Canaux de Sortie           │
                                 │  - JSON structuré pour Next.js   │
                                 │  - WhatsApp API / Telegram API   │
                                 └──────────────────────────────────┘
```

---

## 📝 3. Fonctionnement Détaillé, Étape par Étape

### Étape 1 : Commande et Contrôle (Next.js + Prisma)
- Le client se connecte sur Kin Opere. L'interface charge les données de son organisation (`organizationId`) et l'agent sélectionné (`agentId`).
- L'utilisateur saisit son objectif/invite et clique sur **"Lancer l'agent"**.
- **Le garde-fou financier :** Le backend Next.js interroge la DB via Prisma dans une transaction isolée pour vérifier le solde de crédits :
  - **Crédits insuffisants :** L'action est bloquée et une alerte UI s'affiche.
  - **Crédits suffisants :** Le solde est décrémenté en DB et le traitement continue.

### Étape 2 : Le Pont Transitoire (Ngrok / LocalTunnel)
- Next.js fait une requête POST HTTPS vers l'adresse publique du tunnel (`process.env.N8N_WEBHOOK_URL`).
- Le payload contient :
  ```json
  {
    "agencyId": "organizationId",
    "agentId": "agentId",
    "inputData": { "prompt": "Objectif utilisateur...", "timestamp": "..." },
    "callbackUrl": "APP_URL/api/webhook/n8n-callback"
  }
  ```
- Le tunnel redirige instantanément le flux vers le port local `5678` où tourne n8n.

### Étape 3 : Le Routage Intelligent & Économe (n8n + Gemini)
- **Le Gardien (Gemini Flash) :** Premier nœud n8n. Il évalue gratuitement la complexité de l'objectif.
- **Le Routage (Switch) :** 
  - Si la tâche est simple ➔ traitée directement par Gemini Flash (Gratuit).
  - Si la tâche requiert une haute expertise ➔ réveille l'Agent Spécialisé (Gemini Pro, payant).
- **Protocole Agent-to-Agent (A2A) :** Si l'objectif est complexe, l'agent n8n principal délègue à des sous-workflows spécialisés (ex : logistique, facturation), rassemble les données et applique une limite stricte de 3 à 4 itérations pour éviter les boucles infinies de facturation de jetons.

### Étape 4 : Restitution au Client (A2UI & Messageries)
- **Rendu Web (A2UI) :** n8n renvoie un JSON structuré. Next.js l'intercepte et l'affiche dynamiquement dans l'UI (Markdown mis en valeur, tableaux interactifs pour les listes, grilles de cartes pour les objets complexes).
- **Distribution Mobile :** En parallèle, n8n peut pousser des notifications ou rapports par WhatsApp/Telegram directement au client.

---

## 💵 4. Modèle Économique (Abonnements & Crédits B2B)

Pour stabiliser les marges et éliminer les risques de surconsommation d'API, les clients achètent un abonnement mensuel leur allouant un solde de crédits (ex : 49 $/mois pour 500 crédits).

- **1 exécution d'automatisation simple** = 1 crédit (Coût d'API pour Kin Opere = ~0 $).
- **1 exécution par Agent IA Flash** = 5 crédits (Coût d'API pour Kin Opere = ~0 $).
- **1 exécution par Agent IA Pro** = 20 crédits (Coût d'API pour Kin Opere = ~0,05 $).

---

## 🛠️ 5. État Actuel de l'Intégration Next.js (Ce qui est codé)

L'ensemble de l'infrastructure de liaison avec n8n a été implémentée dans Next.js :

1. **Le Déclencheur (`src/lib/actions/run-agent.ts`) :**
   - Server Action qui gère la déduction transactionnelle Prisma des crédits (20 crédits par défaut pour les agents, 1 pour les automatisations).
   - Appel POST vers `N8N_WEBHOOK_URL` et gestion des réponses.
   - **Remboursement Automatique :** En cas d'erreur réseau ou de retour d'erreur de n8n, l'organisation est automatiquement recréditée en base de données.

2. **Le Récepteur de Callback (`src/app/api/webhook/n8n-callback/route.ts`) :**
   - Endpoint API sécurisé par en-tête `x-api-key` contre `N8N_CALLBACK_SECRET`.
   - Actions supportées : `SAVE_MESSAGE` (ajout de message à la conversation), `CREATE_DAILY_REPORT` (rapport de synthèse d'agent), `REFUND_CREDITS` (remboursement explicite), `CREATE_SKILL` (apprentissage automatique de nouvelles compétences).

3. **L'Interface A2UI (`src/components/agents/AgentRunner.tsx`) :**
   - Composant d'exécution interactif premium avec sélecteur de mode (Agent 20cr vs Automatisation 1cr).
   - Progression de chargement animée (micro-animations avec Framer Motion) faisant défiler les logs d'étape pour enrichir l'expérience utilisateur pendant les traitements LLM longs.
   - Formatteur intelligent : Markdown stylisé en CSS Tailwind, conversion dynamique des tableaux JSON en tables interactives, et des objets JSON complexes en grilles de cartes.

4. **L'Intégration d'Entrée (`src/components/agents/AgentsTable.tsx`) :**
   - Bouton **"Lancer l'agent"** intégré avec icône `Play` sur chaque ligne de la table des employés actifs, ouvrant le modal `AgentRunner`.
