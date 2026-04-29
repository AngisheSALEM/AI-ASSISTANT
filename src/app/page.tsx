"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  MessageSquare,
  ShieldCheck,
  Headphones,
  Stethoscope,
  Building2,
  ArrowRight
} from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-transparent">
      {/* Header/Nav */}
      <header className="px-6 h-20 flex items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center group" href="#">
          <motion.div
            whileHover={{ rotate: 15 }}
            className="p-2 bg-white/10 rounded-xl"
          >
            <Zap className="h-6 w-6 text-white" />
          </motion.div>
          <span className="ml-3 text-xl font-bold font-fraunces tracking-tighter">Agentia-Kin</span>
        </Link>
        <nav className="ml-auto flex gap-8">
          <Link className="text-sm font-medium text-white/60 hover:text-white transition-colors" href="#features">
            Fonctionnalités
          </Link>
          <Link className="text-sm font-medium text-white/60 hover:text-white transition-colors" href="#pricing">
            Tarifs
          </Link>
          <Link className="px-5 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/10" href="/login">
            Connexion
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 lg:py-48 overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center space-y-8 text-center"
            >
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Nouvelle Ère</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-8xl font-fraunces leading-tight">
                  Recrutez votre <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                    employé IA
                  </span>
                   en 5 minutes
                </h1>
                <p className="mx-auto max-w-[800px] text-white/50 md:text-xl leading-relaxed">
                  Transformez votre entreprise avec des agents intelligents spécialisés. Support client, secrétariat, vente - disponible 24/7 sur WhatsApp.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/register"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-colors hover:bg-gray-200"
                  >
                    Créer mon compte
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="#catalog"
                    className="inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-white/5 px-10 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
                  >
                    Voir le catalogue
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalog" className="w-full py-24 md:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mb-16 text-center space-y-4">
              <h2 className="text-3xl font-bold font-fraunces tracking-tighter sm:text-5xl">Nos Métiers Disponibles</h2>
              <p className="text-white/50">Des experts IA formés pour répondre à vos besoins spécifiques.</p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: Headphones,
                  title: "Support Client",
                  desc: "Répond instantanément aux questions de vos clients et résout les problèmes courants.",
                  price: "50 crédits/mois",
                  color: "blue"
                },
                {
                  icon: Stethoscope,
                  title: "Secrétaire Médical",
                  desc: "Gère vos rendez-vous et répond aux questions administratives de vos patients.",
                  price: "70 crédits/mois",
                  color: "cyan"
                },
                {
                  icon: Building2,
                  title: "Commercial Immobilier",
                  desc: "Qualifie vos prospects et présente votre catalogue de biens 24h/24.",
                  price: "100 crédits/mois",
                  color: "white"
                }
              ].map((job, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <PremiumGlassCard className="p-8 h-full flex flex-col">
                    <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                      <job.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 font-fraunces tracking-tight">{job.title}</h3>
                    <p className="text-white/50 mb-8 flex-grow leading-relaxed">{job.desc}</p>
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">{job.price}</span>
                      <ArrowRight className="h-5 w-5 text-white/30" />
                    </div>
                  </PremiumGlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 md:py-32 bg-white/5 backdrop-blur-sm border-y border-white/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold font-fraunces tracking-tighter sm:text-5xl">L'employé idéal, directement sur WhatsApp</h2>
                  <p className="text-white/50 text-lg">Plus besoin d'apprendre de nouveaux outils. Gérez vos agents là où vous êtes déjà.</p>
                </div>
                <ul className="space-y-8">
                  {[
                    {
                      icon: Zap,
                      title: "Intégration Native WhatsApp",
                      desc: "Connectez votre propre numéro et laissez l'IA répondre à vos clients en temps réel."
                    },
                    {
                      icon: MessageSquare,
                      title: "Multimodalité & Voix",
                      desc: "Vos agents peuvent envoyer et recevoir des messages vocaux avec une fluidité humaine."
                    },
                    {
                      icon: ShieldCheck,
                      title: "Sécurité des Données",
                      desc: "Chaque organisation dispose d'une base de connaissances isolée, sécurisée et cryptée."
                    }
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-6">
                      <div className="mt-1 bg-white/10 p-3 rounded-xl border border-white/10 text-white">
                        <f.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-xl mb-1">{f.title}</p>
                        <p className="text-white/50 leading-relaxed">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 blur-3xl rounded-full" />
                <PremiumGlassCard className="p-8 border-white/20">
                   <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/10 max-w-[80%]">
                          <p className="text-sm">Bonjour ! Comment puis-je vous aider aujourd'hui ?</p>
                        </div>
                      </div>
                      <div className="flex gap-4 justify-end">
                        <div className="bg-white text-black p-4 rounded-2xl rounded-tr-none max-w-[80%]">
                          <p className="text-sm font-medium">Quels sont vos tarifs pour un appartement 2 chambres ?</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/10 max-w-[80%]">
                          <div className="flex items-center gap-2 mb-2">
                             <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Agentia IA</span>
                          </div>
                          <p className="text-sm leading-relaxed">Bien sûr ! Nous avons actuellement 3 biens disponibles qui pourraient vous intéresser dans le centre-ville.</p>
                        </div>
                      </div>
                   </div>
                </PremiumGlassCard>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 md:py-32">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-bold font-fraunces tracking-tighter sm:text-5xl mb-16">Tarifs simples et transparents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Standard", price: "29", credits: "100", features: ["1 Agent IA inclus", "Support WhatsApp"] },
                { name: "Professionnel", price: "79", credits: "500", features: ["3 Agents IA inclus", "Base de connaissances RAG", "Support prioritaire"], popular: true },
                { name: "Entreprise", price: "199", credits: "2000", features: ["Agents illimités", "API Access", "Accompagnement dédié"] }
              ].map((plan, i) => (
                <PremiumGlassCard key={i} className={plan.popular ? "border-white/30 scale-105 z-10" : "border-white/10"}>
                  <div className="p-10 flex flex-col items-center h-full">
                    {plan.popular && (
                      <div className="mb-6 px-4 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                        Populaire
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2 uppercase tracking-widest text-white/60">{plan.name}</h3>
                    <div className="text-5xl font-bold mb-8 font-fraunces">{plan.price}$<span className="text-sm font-normal text-white/40">/mois</span></div>
                    <ul className="text-white/50 mb-12 space-y-4 flex-grow text-sm">
                      <li className="text-white font-bold">{plan.credits} crédits inclus</li>
                      {plan.features.map((f, j) => (
                        <li key={j}>{f}</li>
                      ))}
                    </ul>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                      <Link
                        href="/register"
                        className={`w-full py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${plan.popular ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
                      >
                        Commencer
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  </div>
                </PremiumGlassCard>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-6 sm:flex-row py-12 w-full shrink-0 items-center px-10 border-t border-white/5 text-white/40">
        <p className="text-xs">© 2024 Agentia-Kin. Technologie de classe mondiale.</p>
        <nav className="sm:ml-auto flex gap-8">
          <Link className="text-xs hover:text-white transition-colors" href="#">
            Conditions
          </Link>
          <Link className="text-xs hover:text-white transition-colors" href="#">
            Confidentialité
          </Link>
        </nav>
      </footer>
    </div>
  );
}
