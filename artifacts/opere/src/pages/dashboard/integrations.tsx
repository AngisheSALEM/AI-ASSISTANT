import { MessageCircle, Mail, Globe, Plug, CheckCircle, Clock, Zap, ExternalLink } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";
import { motion } from "framer-motion";

const integrations = [
  { name: "WhatsApp Business", desc: "Connectez votre numéro WhatsApp Business pour répondre aux clients.", icon: MessageCircle, connected: true, color: "green" },
  { name: "Email Automation", desc: "Recevez et envoyez des emails automatiquement via vos agents.", icon: Mail, connected: true, color: "blue" },
  { name: "Website Widget", desc: "Intégrez un widget de chat sur votre site internet.", icon: Globe, connected: false, color: "gray" },
  { name: "Zapier", desc: "Connectez vos agents à plus de 3000 applications via Zapier.", icon: Zap, connected: false, color: "orange" },
  { name: "API Access", desc: "Accédez à votre agent IA directement via notre API REST.", icon: ExternalLink, connected: false, color: "purple" },
  { name: "Custom Integration", desc: "Besoin d'une intégration sur mesure ? Contactez notre équipe.", icon: Plug, connected: false, color: "gray" },
];

export default function IntegrationsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[--text-primary] dark:text-white font-fraunces">Intégrations</h1>
        <p className="text-[--text-secondary] dark:text-white/50 mt-1">Connectez vos agents IA à vos outils existants.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <PremiumGlassCard className="p-6 h-full">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${integration.connected ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "bg-black/5 dark:bg-white/10 text-[--text-secondary] dark:text-white/50"}`}>
                  <integration.icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[--text-primary] dark:text-white">{integration.name}</h3>
                    {integration.connected ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold">
                        <CheckCircle size={14} /> Connecté
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-[--text-secondary] dark:text-white/40 font-bold">
                        <Clock size={14} /> Disponible
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[--text-secondary] dark:text-white/60 mb-4">{integration.desc}</p>
                  <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    integration.connected
                      ? "bg-black/5 dark:bg-white/10 text-[--text-primary] dark:text-white hover:bg-black/10 dark:hover:bg-white/20"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}>
                    {integration.connected ? "Configurer" : "Connecter"}
                  </button>
                </div>
              </div>
            </PremiumGlassCard>
          </motion.div>
        ))}
      </div>

      <PremiumGlassCard className="p-8 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-2xl">
            <Plug size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[--text-primary] dark:text-white font-fraunces">Besoin d'une intégration personnalisée ?</h3>
            <p className="text-[--text-secondary] dark:text-white/60 mt-1">Notre équipe peut développer une connexion sur mesure avec vos systèmes internes (CRM, ERP, etc.)</p>
          </div>
          <button className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
            Nous contacter
          </button>
        </div>
      </PremiumGlassCard>
    </div>
  );
}
