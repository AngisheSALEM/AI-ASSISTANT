# Agentia-Kin

Plateforme SaaS d'Agents IA professionnels pour les entreprises de Kinshasa.

## Stack Technique
- **Frontend** : Next.js 14, Tailwind CSS, Lucide React
- **Backend** : Prisma ORM, PostgreSQL + pgvector
- **Validation** : Zod

## Configuration Database (pgvector)

Pour activer le support des vecteurs dans votre base PostgreSQL :

1. Connectez-vous à votre base de données PostgreSQL.
2. Exécutez la commande SQL suivante :
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Assurez-vous que votre `DATABASE_URL` est correcte dans votre fichier `.env`.

## Installation

```bash
npm install
npx prisma generate
npm run db:setup
npm run dev
```

### Initialisation de la Base de Données
Si vous rencontrez des erreurs indiquant que des tables (comme `Organization`) n'existent pas, exécutez la commande suivante pour synchroniser le schéma Prisma avec votre base de données et charger les données initiales :
```bash
npm run db:setup
```

## Structure du Projet
- `src/app/(dashboard)/[orgId]` : Dashboard multi-tenant.
- `src/app/api/ingest` : Point d'entrée pour l'ingestion de documents (RAG).
- `prisma/schema.prisma` : Schéma de données complet.
