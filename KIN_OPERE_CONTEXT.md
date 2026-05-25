# 🏗️ KIN OPERE — Contexte Projet Complet (Source de Vérité)

> Ce fichier est le **document de référence** pour tout développeur ou assistant IA travaillant sur Kin Opere.
> Il décrit la vision commerciale, l'architecture technique et les règles métier du projet.

---

## 🎯 La Vision Commerciale (B2B)

**Kin Opere** est un **SaaS B2B d'orchestration et de gestion de processus** destiné aux entreprises de Kinshasa et d'ailleurs (cabinets comptables, agences logistiques, sociétés de négoce, etc.).

Le catalogue se divise en **deux offres distinctes** :

### Offre 1 — Automatisation (Processus Fixe Déterministe)
- **Coût :** 1 crédit par exécution
- **Principe :** Un script déterministe. Si l'événement A se produit, alors l'action B s'exécute.
- **Exemples concrets :**
  - Générer un reçu PDF dès qu'un paiement est reçu
  - Envoyer une relance WhatsApp quand une facture dépasse 5 jours de retard
  - Synchroniser un inventaire Google Sheets dès qu'un scan de conteneur arrive
  - Trier automatiquement les emails entrants par catégorie et les réaffecter

### Offre 2 — Agent IA Autonome (Objectif Complexe)
- **Coût :** 20 crédits par exécution
- **Principe :** Un "employé virtuel". On lui confie un objectif complexe, il utilise ses protocoles pour réfléchir, choisir ses outils et produire un livrable.
- **Exemples concrets :**
  - Analyser un bilan comptable complexe et trouver les anomalies fiscales
  - Répondre de manière autonome aux clients WhatsApp avec escalade humaine si frustration
  - Prospecter commercialement et générer des devis personnalisés
  - Analyser les tendances du marché et rédiger un rapport stratégique

---

## 🏗️ L'Architecture Technique Globale

```
┌─────────────────────────────────────────────────┐
│               UTILISATEUR (Browser)             │
│            Dashboard Next.js (Vercel)           │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────┐
│           NEXT.JS 14+ (App Router)              │
│  • Frontend React + Tailwind CSS + Tremor       │
│  • Server Actions (déduction crédits)           │
│  • API Routes (webhook callback)                │
│  • Prisma ORM → PostgreSQL                      │
│  • NextAuth (authentification)                  │
│  • Hébergé sur Vercel                           │
└─────────────────────┬───────────────────────────┘
                      │ POST HTTP (Webhook)
                      ▼
┌─────────────────────────────────────────────────┐
│              n8n (Moteur d'exécution)            │
│  • Instance UNIQUE et DYNAMIQUE                 │
│  • Exécute les workflows d'automatisation       │
│  • Exécute les agents IA via API Gemini         │
│  • Renvoie les résultats via callback webhook   │
│  • Accessible via tunnel HTTPS (dev local)      │
│  • ou hébergée en cloud (production)            │
└─────────────────────────────────────────────────┘
```

### Principe de communication
1. **Next.js n'exécute AUCUNE IA en direct.** C'est uniquement l'interface et le cerveau administratif.
2. Quand un utilisateur clique "Lancer l'agent", Next.js fait un `fetch(POST)` vers le webhook de n8n avec les données nécessaires.
3. n8n fait le travail (via l'API Gemini) et renvoie le résultat via un callback HTTP POST vers Next.js.
4. Next.js stocke le résultat en base de données et met à jour l'UI.

### Variables d'environnement clés
```env
N8N_WEBHOOK_URL="https://instance-n8n.com/webhook/..."
N8N_CALLBACK_SECRET="clé_secrète_partagée"
NEXT_PUBLIC_APP_URL="https://kinopere.com"
```

---

## 💰 Le Modèle Économique (Crédits Prépayés)

| Action | Coût |
|--------|------|
| Automatisation (workflow fixe) | 1 crédit |
| Agent IA autonome | 20 crédits |

### Logique de déduction sécurisée
1. Avant tout appel vers n8n, vérification du solde + décrément atomique via **Prisma $transaction**
2. Si l'appel n8n échoue (réseau, timeout), les crédits sont **automatiquement recrédités**
3. Le solde est affiché en temps réel dans la sidebar et la page Billing

### Plans d'abonnement
| Plan | Crédits inclus | Prix |
|------|---------------|------|
| Standard (essai) | 100 crédits | Gratuit |
| Premium | 2000 crédits | 49$/mois |

---

## 🗂️ Structure des Pages du Dashboard

| Route | Description | Statut |
|-------|-------------|--------|
| `/{orgId}` | Overview / Dashboard principal avec stats, agents actifs, rapports | ✅ |
| `/{orgId}/agents` | Liste des agents IA déployés, bouton "Lancer" avec AgentRunner A2UI | ✅ |
| `/{orgId}/automations` | Gestion des workflows déterministes (1 crédit), toggle actif/inactif | ✅ |
| `/{orgId}/knowledge` | Base de connaissances RAG pour enrichir les agents | ✅ |
| `/{orgId}/thinking` | Configuration des personas, prompts maîtres, simulateur local | ✅ |
| `/{orgId}/analytics` | Insights et métriques de performance | ✅ |
| `/{orgId}/integrations` | Connexions WhatsApp, Email, API | ✅ |
| `/{orgId}/billing` | Abonnements, crédits, historique de recharges, moyens de paiement | ✅ |
| `/{orgId}/settings` | Paramètres de l'organisation | ✅ |
| `/{orgId}/marketplace` | Catalogue de templates d'agents à installer | ✅ |

---

## 🧩 Composants Clés

| Composant | Rôle |
|-----------|------|
| `Sidebar.tsx` | Navigation latérale avec jauge de crédits, boutons WhatsApp et Nouvel Agent |
| `AgentRunner.tsx` | Interface A2UI (Agentic-to-UI) pour lancer un agent/automatisation avec loading states premium |
| `AgentsTable.tsx` | Table des agents avec bouton "Lancer l'agent" ouvrant le runner |
| `PremiumGlassCard.tsx` | Carte glassmorphism réutilisable |
| `CreditGauge.tsx` | Jauge visuelle des crédits |
| `RechargeButton.tsx` | Bouton de recharge Stripe/Mobile Money |

---

## 🔒 Sécurité

- **Auth :** NextAuth avec sessions sécurisées
- **Webhook :** Authentification via header `x-api-key` ↔ `N8N_CALLBACK_SECRET`
- **Crédits :** Transaction atomique Prisma pour éviter les race conditions
- **Remboursement :** Auto-refund si échec réseau vers n8n

---

## 📋 Règles de Développement

1. **Pas de logique IA côté Next.js** — Tout passe par n8n
2. **Tailwind CSS** pour le styling (thème cyan/bleu premium)
3. **Framer Motion** pour les animations
4. **Tremor** pour les composants data (charts, badges, grids)
5. **Prisma** pour toutes les requêtes DB
6. **TypeScript strict** — `npm run build` doit passer sans erreur
7. **French-first UI** — L'interface est en français (marché RDC/Kinshasa)
