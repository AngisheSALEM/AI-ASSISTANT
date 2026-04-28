# Variables d'Environnement pour Vercel

Pour que le projet Agentia-Kin fonctionne correctement sur Vercel, les variables suivantes doivent être configurées dans le dashboard Vercel :

## Base de données
- `DATABASE_URL`: URL de connexion PostgreSQL (ex: de Supabase ou Neon). Doit inclure l'extension pgvector.
- `DIRECT_URL`: URL de connexion directe (optionnel, utilisé pour les migrations Prisma).

## OpenAI (RAG & Transcription)
- `OPENAI_API_KEY`: Votre clé API OpenAI.

## ElevenLabs (Voix)
- `ELEVENLABS_API_KEY`: Votre clé API ElevenLabs.
- `ELEVENLABS_VOICE_ID`: (Optionnel) ID de la voix par défaut.

## WhatsApp (Meta Business Suite)
- `WHATSAPP_VERIFY_TOKEN`: Token de vérification configuré dans le dashboard Meta.
- `WHATSAPP_ACCESS_TOKEN`: Token d'accès permanent WhatsApp.
- `WHATSAPP_PHONE_NUMBER_ID`: ID du numéro de téléphone WhatsApp.
- `WHATSAPP_APP_SECRET`: Secret de l'application Meta (utilisé pour la vérification de signature x-hub-signature-256).

## LangChain (Optionnel, pour le tracing)
- `LANGCHAIN_TRACING_V2`: "true" ou "false".
- `LANGCHAIN_API_KEY`: Votre clé API LangSmith.
