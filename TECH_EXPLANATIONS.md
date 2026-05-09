# Justification Technique de l'Architecture Opere

## 1. Schéma de Base de Données (Prisma)
- **Multi-tenant** : Utilisation d'un `organizationId` sur toutes les entités clés (Agent, Skill, Memory, KnowledgeBase). L'ajout de `clerkId` permet une intégration fluide avec Clerk pour l'authentification et la gestion des organisations.
- **Mémoire Vectorielle** : Utilisation de l'extension `pgvector` de PostgreSQL pour stocker les embeddings (`Memory` et `KnowledgeBase`). Cela permet une recherche sémantique performante directement via SQL.
- **Skills (Compétences)** : Modèle dédié pour stocker les capacités apprises dynamiquement par l'IA. Le champ `schema` (JSON) permet de définir les paramètres requis pour chaque compétence de manière flexible.

## 2. Webhook WhatsApp & Inngest
- **Délégation Asynchrone** : Le webhook WhatsApp (`/api/webhooks/whatsapp`) ne fait que valider la signature et envoyer un événement à Inngest. Cela garantit que la réponse HTTP est envoyée en moins de 1 seconde, évitant les timeouts de Vercel ou les retries automatiques de Meta.
- **Fiabilité** : Inngest gère les retries automatiques en cas d'échec d'une étape (ex: API LLM indisponible ou timeout de l'API WhatsApp).

## 3. Workflow de l'Agent (Hermes)
- **RAG Hybride** : Le workflow utilise `similaritySearch` pour récupérer le contexte métier pertinent avant de solliciter le LLM.
- **Boucle d'Apprentissage (Skill Generation)** : Après chaque action réussie, un prompt spécifique (`SKILL_GENERATION_PROMPT`) analyse l'interaction pour extraire une compétence structurée au format JSON, qui est ensuite persistée en base de données.

## 4. Sécurité et Isolation
- L'isolation des données est garantie au niveau de la couche service en filtrant systématiquement par `organizationId`.
