import Link from "next/link";
import {
  Users,
  MessageSquare,
  Zap,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  Headphones,
  Stethoscope,
  Building2
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header/Nav */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <Zap className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-xl font-bold">Agentia-Kin</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Fonctionnalités
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Tarifs
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Connexion
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Recrutez votre premier employé IA en 5 minutes
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Transformez votre entreprise avec des agents intelligents spécialisés. Support client, secrétariat, vente - disponible 24/7 sur WhatsApp.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-8 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Créer mon compte
                </Link>
                <Link
                  href="#catalog"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Voir le catalogue
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section "Nos Métiers" */}
        <section id="catalog" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Métiers Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Headphones className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold">Support Client</h3>
                </div>
                <p className="text-gray-500 mb-4">Répond instantanément aux questions de vos clients et résout les problèmes courants.</p>
                <div className="text-sm font-semibold text-blue-600">À partir de 50 crédits/mois</div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Stethoscope className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold">Secrétaire Médical</h3>
                </div>
                <p className="text-gray-500 mb-4">Gère vos rendez-vous et répond aux questions administratives de vos patients.</p>
                <div className="text-sm font-semibold text-green-600">À partir de 70 crédits/mois</div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold">Commercial Immobilier</h3>
                </div>
                <p className="text-gray-500 mb-4">Qualifie vos prospects et présente votre catalogue de biens 24h/24.</p>
                <div className="text-sm font-semibold text-purple-600">À partir de 100 crédits/mois</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">L'employé idéal, directement sur WhatsApp</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-600 rounded-full p-1">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">Intégration Native WhatsApp</p>
                      <p className="text-gray-500">Connectez votre propre numéro et laissez l'IA répondre à vos clients.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-600 rounded-full p-1">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">Multimodalité & Voix</p>
                      <p className="text-gray-500">Vos agents peuvent envoyer et recevoir des messages vocaux fluides.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-600 rounded-full p-1">
                      <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">Sécurité des Données</p>
                      <p className="text-gray-500">Chaque organisation dispose d'une base de connaissances isolée et sécurisée.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl border">
                 <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">Bonjour ! Comment puis-je vous aider aujourd'hui ?</div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none">Quels sont vos tarifs pour un appartement 2 chambres ?</div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">Bien sûr ! Nous avons actuellement 3 biens disponibles qui pourraient vous intéresser...</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Tarifs simples et transparents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border rounded-lg p-8 flex flex-col items-center">
                <h3 className="text-xl font-bold mb-4">Standard</h3>
                <div className="text-4xl font-bold mb-4">29$<span className="text-sm font-normal text-gray-500">/mois</span></div>
                <ul className="text-gray-500 mb-8 space-y-2">
                  <li>1 Agent IA inclus</li>
                  <li>100 Crédits / mois</li>
                  <li>Support WhatsApp</li>
                </ul>
                <Link href="/register" className="w-full py-2 bg-blue-600 text-white rounded-md font-medium">Commencer</Link>
              </div>
              <div className="border-2 border-blue-600 rounded-lg p-8 flex flex-col items-center relative">
                <div className="absolute top-0 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Populaire</div>
                <h3 className="text-xl font-bold mb-4">Professionnel</h3>
                <div className="text-4xl font-bold mb-4">79$<span className="text-sm font-normal text-gray-500">/mois</span></div>
                <ul className="text-gray-500 mb-8 space-y-2">
                  <li>3 Agents IA inclus</li>
                  <li>500 Crédits / mois</li>
                  <li>Base de connaissances RAG</li>
                </ul>
                <Link href="/register" className="w-full py-2 bg-blue-600 text-white rounded-md font-medium">Commencer</Link>
              </div>
              <div className="border rounded-lg p-8 flex flex-col items-center">
                <h3 className="text-xl font-bold mb-4">Entreprise</h3>
                <div className="text-4xl font-bold mb-4">199$<span className="text-sm font-normal text-gray-500">/mois</span></div>
                <ul className="text-gray-500 mb-8 space-y-2">
                  <li>Agents illimités</li>
                  <li>2000 Crédits / mois</li>
                  <li>Support Prioritaire</li>
                </ul>
                <Link href="/register" className="w-full py-2 bg-blue-600 text-white rounded-md font-medium">Nous contacter</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 Agentia-Kin. Tous droits réservés.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Conditions d'utilisation
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Confidentialité
          </Link>
        </nav>
      </footer>
    </div>
  );
}
