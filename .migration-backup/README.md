# Agentia-Kin | Écosystème SaaS pour Entreprises

Plateforme SaaS d'Agents IA professionnels conçue pour transformer la communication et l'efficacité des entreprises de Kinshasa et d'ailleurs.

## 🚀 Fonctionnalités Clés

- **Authentification & Onboarding** : Tunnel d'inscription fluide via Clerk avec design Glassmorphism et guide interactif.
- **Marketplace d'Agents** : Louez des agents spécialisés (SAV, Vente, Support) pré-configurés.
- **Salle de Contrôle Granulaire** : Configurez vos identifiants WhatsApp Cloud API par agent.
- **Formation Vocale** : Interface "Push-to-Talk" utilisant Whisper (STT) et ElevenLabs (TTS) pour entraîner vos agents de vive voix.
- **Reporting Business IA** : Résumés d'activité quotidiens générés automatiquement par IA et consultables via le dashboard ou envoyés par email.

## 🛠️ Stack Technique

- **Frontend** : Next.js 14 (App Router), Tailwind CSS, Framer Motion, Tremor (Analytics).
- **Backend** : Prisma ORM, PostgreSQL + pgvector.
- **IA** : OpenAI (GPT-4o, Whisper), ElevenLabs (Voix Multilingue), Groq (Llama 3).
- **Authentification** : Clerk.

## 📋 Configuration & Déploiement sur Vercel

### 1. Variables d'Environnement

Configurez les variables suivantes dans votre projet Vercel :

```env
# Database (Prisma Postgres recommandé)
DATABASE_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI Models API Keys
OPENAI_API_KEY="sk-..."
GROQ_API_KEY="gsk_..."

# Voice Engine (ElevenLabs)
ELEVENLABS_API_KEY="..."
ELEVENLABS_VOICE_ID="..."

# WhatsApp Webhook Security (Vercel Cron / Webhooks)
CRON_SECRET="..."
```

### 2. Initialisation de la Base de Données

Exécutez les commandes suivantes localement (ou via Vercel CLI) pour préparer la base :

```bash
npx prisma generate
npx prisma db push
node scripts/seed-templates.js
```

### 3. Automatisation des Rapports (Cron Job)

Le système de reporting quotidien est configuré pour s'exécuter via un endpoint Vercel Cron :

- **Route** : `/api/cron/generate-reports`
- **Fréquence recommandée** : Chaque soir à 20h00 (0 20 * * *).
- **Sécurité** : L'endpoint vérifie le header `Authorization: Bearer ${CRON_SECRET}`.

Pour configurer le cron sur Vercel, ajoutez un objet `crons` dans votre `vercel.json` ou utilisez l'interface Vercel Dashboard.

## 📞 Support Technique

Pour toute question relative à l'intégration WhatsApp ou à la personnalisation des prompts, contactez l'équipe technique d'Agentia-Kin.
