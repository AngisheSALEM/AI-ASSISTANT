# Spécifications UI/UX - Opere IA

Ce document détaille l'identité visuelle, les principes d'expérience utilisateur (UX) et les standards d'interface (UI) appliqués à la plateforme Opere.

## 1. Identité Visuelle & Style Général

L'application adopte une esthétique **"Premium Modern"** mélangeant le **Glassmorphism** et un thème **"Deep Space"**. L'objectif est de projeter une image de technologie de pointe, de fluidité et de professionnalisme.

### Palette de Couleurs

L'application supporte nativement le mode clair et sombre avec des variables CSS dynamiques.

#### Mode Sombre (Par défaut/Principal)
- **Arrière-plan :** `#050505` (Noir profond)
- **Texte Primaire :** `#FAFAFA` (Blanc cassé)
- **Bordures :** `rgba(255, 255, 255, 0.08)` (Subtiles)
- **Accents :** Cyan (`#22D3EE`), Bleu (`#60A5FA`), Émeraude (`#34D399`)

#### Mode Clair
- **Arrière-plan :** `#FAFAFA`
- **Texte Primaire :** `#0A0A0A`
- **Bordures :** `#E5E5E5`

### Effets Signature
- **Glassmorphism :** Utilisation intensive de `backdrop-blur-xl` et de fonds semi-transparents (`white/0.03` en sombre, `white/70` en clair).
- **Deep Space Background :** Un arrière-plan animé composé d'orbes lumineux (Cyan, Bleu, Émeraude) flottants avec un flou important (100px) et une superposition de bruit (`noise-overlay`) à 1.5% d'opacité.
- **Gradients :** Textes et boutons utilisant des dégradés de Cyan vers Bleu pour les actions technologiques, et Émeraude pour les actions liées à la communication (WhatsApp).

---

## 2. Typographie

- **Police :** Inter (Sans-serif)
- **Style :**
    - Titres (H1-H3) : `tracking-tight`, `font-bold`, interlignage serré (`leading-[1.1]`).
    - Étiquettes (Labels) : Majuscules, `tracking-widest`, petite taille (`text-[10px]`), souvent en `font-black`.
    - Corps de texte : `leading-relaxed` pour une meilleure lisibilité.

---

## 3. Composants UI Clés

### Premium Glass Card
- **Structure :** Bordure fine, flou de mouvement en arrière-plan, ombre portée très légère en mode clair et marquée en mode sombre.
- **Interaction :** Survol (`hover`) augmentant légèrement l'échelle (`scale-105`) et l'intensité de la bordure.

### Sidebar (Navigation)
- **Comportement :** Rétractable avec transition fluide (`framer-motion`).
- **Indicateur Actif :** Une barre verticale lumineuse (`cyan-400`) à gauche de l'élément sélectionné.
- **Tooltips :** Affichage du nom du menu au survol lorsque la barre est réduite.

### Boutons d'Action (CTAs)
- **Primaire (WhatsApp) :** Dégradé Émeraude/Vert, ombre portée colorée (`shadow-emerald-500/25`).
- **Secondaire (Création) :** Dégradé Cyan/Bleu.
- **Micro-interactions :** Réduction de taille au clic (`scale-0.98`).

---

## 4. Principes UX

### Accessibilité & Clarté
- **Hiérarchie Visuelle :** Utilisation de contrastes élevés pour les éléments importants. Les sections sont délimitées par des bordures subtiles (`border-border`) plutôt que par des changements de couleur de fond massifs.
- **États de Chargement :** Utilisation de Skeletons et d'animations de scintillement (`shimmer`) pour éviter les sauts de contenu.

### Réactivité (Responsiveness)
- Approche **Mobile-First**.
- Grilles adaptatives (1 colonne sur mobile, 2 ou 3 sur desktop).
- Sidebar se transformant ou se réduisant selon la taille de l'écran.

### Feedback Interactif
- **Animations :** Transitions douces pour toutes les entrées de page et les changements d'état.
- **Indicateurs de Statut :** Points lumineux pulsants pour indiquer l'activité des agents ou des services (ex: `status-active` avec halo lumineux).

---

## 5. Stack Technique UI

- **Framework :** Next.js 14+ (App Router)
- **Styling :** Tailwind CSS
- **Animations :** Framer Motion
- **Icônes :** Lucide React
- **Composants de Base :** Radix UI / Shadcn UI
- **Graphiques :** Tremor (pour les dashboards et insights)
