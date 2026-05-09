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
  ArrowRight,
  Github
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
    <div className="flex flex-col min-h-screen text-foreground">
      {/* Header/Nav */}
      <header className="px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between border-b border-border backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <Link className="flex items-center gap-2 sm:gap-3 group shrink-0" href="#">
          <motion.div
            whileHover={{ rotate: 15 }}
            className="p-1.5 sm:p-2 bg-foreground/5 dark:bg-white/10 rounded-xl border border-border"
          >
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
          </motion.div>
          <span className="text-lg sm:text-xl font-bold tracking-tight">Opere</span>
        </Link>
        
        <nav className="flex items-center gap-2 sm:gap-4 lg:gap-8">
          <Link 
            className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" 
            href="#features"
          >
            Fonctionnalites
          </Link>
          <Link 
            className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" 
            href="#pricing"
          >
            Tarifs
          </Link>
          <Link 
            className="px-4 sm:px-5 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-full transition-all" 
            href="/login"
          >
            Connexion
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative z-10 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center space-y-6 sm:space-y-8 text-center"
            >
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 rounded-full border border-border bg-background/50 backdrop-blur-md">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-accent">Nouvelle Ere</span>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-balance">
                  Recrutez votre{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                    employe IA
                  </span>
                  <br className="hidden sm:block" />
                  {" "}en 5 minutes
                </h1>
                <p className="mx-auto max-w-2xl text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed px-4">
                  Transformez votre entreprise avec des agents intelligents specialises. Support client, secretariat, vente - disponible 24/7 sur WhatsApp.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link
                    href="/register"
                    className="inline-flex w-full sm:w-auto h-12 sm:h-14 items-center justify-center rounded-full bg-foreground px-6 sm:px-10 text-sm font-semibold text-background shadow-lg transition-all hover:shadow-xl"
                  >
                    Creer mon compte
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link
                    href="#catalog"
                    className="inline-flex w-full sm:w-auto h-12 sm:h-14 items-center justify-center rounded-full border border-border bg-background/50 px-6 sm:px-10 text-sm font-semibold backdrop-blur-md transition-all hover:bg-foreground/5"
                  >
                    Voir le catalogue
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalog" className="w-full py-16 sm:py-24 md:py-32">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
            <div className="mb-10 sm:mb-16 text-center space-y-3 sm:space-y-4">
              <h2 className="text-balance">Nos Metiers Disponibles</h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
                Des experts IA formes pour repondre a vos besoins specifiques.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            >
              {[
                {
                  icon: Headphones,
                  title: "Support Client",
                  desc: "Repond instantanement aux questions de vos clients et resout les problemes courants.",
                  price: "50 credits/mois",
                },
                {
                  icon: Stethoscope,
                  title: "Secretaire Medical",
                  desc: "Gere vos rendez-vous et repond aux questions administratives de vos patients.",
                  price: "70 credits/mois",
                },
                {
                  icon: Building2,
                  title: "Commercial Immobilier",
                  desc: "Qualifie vos prospects et presente votre catalogue de biens 24h/24.",
                  price: "100 credits/mois",
                }
              ].map((job, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <PremiumGlassCard className="p-6 sm:p-8 h-full flex flex-col">
                    <div className="p-2.5 sm:p-3 bg-foreground/5 dark:bg-white/10 rounded-xl sm:rounded-2xl w-fit mb-4 sm:mb-6 border border-border">
                      <job.icon className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                    </div>
                    <h4 className="mb-2 sm:mb-3">{job.title}</h4>
                    <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 flex-grow leading-relaxed">{job.desc}</p>
                    <div className="pt-4 sm:pt-6 border-t border-border flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-accent uppercase tracking-wider">{job.price}</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                  </PremiumGlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 sm:py-24 md:py-32 bg-foreground/[0.02] dark:bg-white/[0.02] border-y border-border">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="space-y-8 sm:space-y-12 order-2 lg:order-1">
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-balance">{"L'employe ideal, directement sur WhatsApp"}</h2>
                  <p className="text-muted-foreground text-base sm:text-lg">
                    {"Plus besoin d'apprendre de nouveaux outils. Gerez vos agents la ou vous etes deja."}
                  </p>
                </div>
                <ul className="space-y-6 sm:space-y-8">
                  {[
                    {
                      icon: Zap,
                      title: "Integration Native WhatsApp",
                      desc: "Connectez votre propre numero et laissez l'IA repondre a vos clients en temps reel."
                    },
                    {
                      icon: MessageSquare,
                      title: "Multimodalite & Voix",
                      desc: "Vos agents peuvent envoyer et recevoir des messages vocaux avec une fluidite humaine."
                    },
                    {
                      icon: ShieldCheck,
                      title: "Securite des Donnees",
                      desc: "Chaque organisation dispose d'une base de connaissances isolee, securisee et cryptee."
                    }
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-4 sm:gap-6">
                      <div className="mt-0.5 sm:mt-1 bg-foreground/5 dark:bg-white/10 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border shrink-0">
                        <f.icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                      </div>
                      <div>
                        <h5 className="mb-1">{f.title}</h5>
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative order-1 lg:order-2">
                <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 blur-3xl rounded-full" />
                <PremiumGlassCard className="p-6 sm:p-8">
                   <div className="space-y-4 sm:space-y-6">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="bg-foreground/5 dark:bg-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl rounded-tl-none border border-border max-w-[80%]">
                          <p className="text-xs sm:text-sm">{"Bonjour ! Comment puis-je vous aider aujourd'hui ?"}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 sm:gap-4 justify-end">
                        <div className="bg-foreground text-background p-3 sm:p-4 rounded-xl sm:rounded-2xl rounded-tr-none max-w-[80%]">
                          <p className="text-xs sm:text-sm font-medium">Quels sont vos tarifs pour un appartement 2 chambres ?</p>
                        </div>
                      </div>
                      <div className="flex gap-3 sm:gap-4">
                        <div className="bg-foreground/5 dark:bg-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl rounded-tl-none border border-border max-w-[80%]">
                          <div className="flex items-center gap-2 mb-2">
                             <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan-500 animate-pulse" />
                             <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Opere IA</span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed">{"Bien sur ! Nous avons actuellement 3 biens disponibles qui pourraient vous interesser dans le centre-ville."}</p>
                        </div>
                      </div>
                   </div>
                </PremiumGlassCard>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-16 sm:py-24 md:py-32">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl text-center">
            <h2 className="mb-10 sm:mb-16 text-balance">Tarifs simples et transparents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[
                { name: "Standard", price: "29", credits: "100", features: ["1 Agent IA inclus", "Support WhatsApp"] },
                { name: "Professionnel", price: "79", credits: "500", features: ["3 Agents IA inclus", "Base de connaissances RAG", "Support prioritaire"], popular: true },
                { name: "Entreprise", price: "199", credits: "2000", features: ["Agents illimites", "API Access", "Accompagnement dedie"] }
              ].map((plan, i) => (
                <PremiumGlassCard key={i} className={`${plan.popular ? "border-cyan-500/50 sm:scale-105 z-10" : ""}`}>
                  <div className="p-6 sm:p-8 lg:p-10 flex flex-col items-center h-full">
                    {plan.popular && (
                      <div className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 bg-foreground text-background text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full">
                        Populaire
                      </div>
                    )}
                    <h6 className="mb-2 uppercase tracking-widest text-muted-foreground">{plan.name}</h6>
                    <div className="text-4xl sm:text-5xl font-bold mb-6 sm:mb-8">
                      {plan.price}$
                      <span className="text-sm font-normal text-muted-foreground">/mois</span>
                    </div>
                    <ul className="text-muted-foreground mb-8 sm:mb-12 space-y-3 sm:space-y-4 flex-grow text-sm">
                      <li className="text-foreground font-semibold">{plan.credits} credits inclus</li>
                      {plan.features.map((f, j) => (
                        <li key={j}>{f}</li>
                      ))}
                    </ul>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                      <Link
                        href="/register"
                        className={`w-full py-3 sm:py-4 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                          plan.popular 
                            ? 'bg-foreground text-background' 
                            : 'bg-foreground/5 dark:bg-white/10 hover:bg-foreground/10 dark:hover:bg-white/20 border border-border'
                        }`}
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

      <footer className="border-t border-border bg-background/80 backdrop-blur-md">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-muted-foreground">
              <p className="text-xs sm:text-sm">2024 Opere. Technologie de classe mondiale.</p>
              <span className="hidden sm:block text-border">|</span>
              <a 
                href="https://github.com/AngisheSALEM" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm hover:text-foreground transition-colors group"
              >
                <span>Fait par</span>
                <span className="font-semibold text-foreground">Salem</span>
                <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
            <nav className="flex gap-4 sm:gap-8">
              <Link className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">
                Conditions
              </Link>
              <Link className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">
                Confidentialite
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
