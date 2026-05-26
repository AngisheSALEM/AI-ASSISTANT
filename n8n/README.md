# 🚀 Architecture de Production n8n Scalable — Kin Opere

Ce répertoire contient l'implémentation de la logique d'orchestration de nos agents IA et automatisations sur **n8n**. 

Pour garantir une scalabilité absolue et éviter les timeouts de serveur, l'architecture repose sur un pattern **asynchrone événementiel à passerelle unique (Single Gateway Webhook)**.

---

## 🏗️ L'Architecture Scalable à Passerelle Unique

Plutôt que d'exposer des dizaines de webhooks n8n différents (un par agent), notre architecture utilise une **passerelle unique d'aiguillage** :

```
┌─────────────────────────────────┐
│        Next.js Action           │
└────────────────┬────────────────┘
                 │ POST (Payload avec agentId)
                 ▼
┌─────────────────────────────────┐
│     1. ROUTER WEBHOOK (n8n)     │  ◄── Enregistre les erreurs globales
└────────────────┬────────────────┘      et auto-rembourse en cas d'échec
                 │
        ┌────────┴────────┐  Aiguillage dynamique
        ▼ (isAutomation)  ▼ (IA Agent)
┌───────────────┐ ┌───────────────┐
│ 2. WORKFLOW   │ │ 3. AGENT IA   │
│ AUTOMATISATION│ │   GEMINI (RAG)│
└───────────────┘ └───────────────┘
```

### Avantages de cette approche :
1. **Maintenance centralisée** : Un seul webhook n8n est exposé vers Next.js (`process.env.N8N_WEBHOOK_URL`).
2. **Tolérance aux pannes intégrée** : Le routeur central possède un nœud de capture d'erreur global. Si un agent ou une automatisation plante, le routeur intercepte l'erreur et envoie automatiquement une requête `REFUND_CREDITS` au backend de Next.js pour recréditer le client.
3. **Évolutivité infinie** : Pour ajouter un nouvel agent, il suffit de configurer une nouvelle branche de routage dans n8n sans modifier une seule ligne de code Next.js ni changer les variables d'environnement.

---

## 🛠️ Instructions de Configuration Rapide (Localhost)

### 1. Démarrer n8n en local
Assurez-vous d'avoir Node.js installé, puis lancez n8n :
```bash
npx n8n start
```
Une fois démarré, n8n est accessible sur `http://localhost:5678`.

### 2. Configurer le Tunnel HTTPS (Requis pour les Callbacks Locaux)
Next.js tourne sur `http://localhost:3000` et n8n sur `http://localhost:5678`. Pour qu'ils puissent communiquer de façon fluide (surtout si vous déployez le frontend sur Vercel tout en gardant n8n en local), utilisez **ngrok** ou **localtunnel** :
```bash
# Crée un tunnel sécurisé pour n8n
ngrok http 5678
```
Copiez l'URL HTTPS générée par ngrok (ex: `https://abcd-123.ngrok-free.app`) et définissez-la dans le fichier `.env` de Next.js :
```env
N8N_WEBHOOK_URL="https://abcd-123.ngrok-free.app/webhook/kin-opere-router"
N8N_CALLBACK_SECRET="choisissez_une_cle_secrete_partagee"
```

---

## 🗂️ Les Fichiers Workflows (Importables en 1 clic)

Dans le dossier `workflows/`, vous trouverez les modèles JSON complets prêts à être importés dans votre n8n (**Menu n8n -> Import from File**) :

1. [`kin_opere_router.json`](file:///c:/Users/Salem/Documents/projet/AI-ASSISTANT/n8n/workflows/kin_opere_router.json) : Le routeur d'aiguillage et gestionnaire de remboursement automatique.
2. [`agent_comptable.json`](file:///c:/Users/Salem/Documents/projet/AI-ASSISTANT/n8n/workflows/agent_comptable.json) : L'agent comptable autonome expert de la RDC utilisant Google Gemini.
3. [`automation_pdf_receipt.json`](file:///c:/Users/Salem/Documents/projet/AI-ASSISTANT/n8n/workflows/automation_pdf_receipt.json) : L'automatisation déterministe de génération de reçus PDF (1 crédit).

---

## 🔑 Configuration des identifiants dans n8n

Dans n8n, créez les identifiants suivants pour faire fonctionner les agents :
- **Google Gemini API** : Obtenez une clé API gratuite sur Google AI Studio et créez une clé "Google Gemini(Chat)" dans n8n.
- **HTTP Header Auth** : Créez une authentification par clé d'en-tête nommée `KinOpereCallbackAuth` avec :
  - **Header Name** : `x-api-key`
  - **Header Value** : La valeur de votre `N8N_CALLBACK_SECRET`.
