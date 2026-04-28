import {
  Users,
  MessageSquare,
  Activity,
  Upload,
  FileText,
  Plus
} from "lucide-react";

export default async function DashboardPage({ params }: { params: { orgId: string } }) {
  // En Next.js 15, params est une Promise. Pour 14, c'est un objet.
  // Ici on garde le typage standard 14 mais on prépare le terrain.
  const { orgId } = params;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Espace de travail : {orgId}</h1>
        <p className="text-gray-500 mt-2">Bienvenue sur votre tableau de bord Agentia-Kin.</p>
      </header>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Agents Actifs</span>
            <Users className="text-blue-500" size={20} />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-semibold">12</span>
            <span className="ml-2 text-sm text-green-500">+2</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Conversations (24h)</span>
            <MessageSquare className="text-blue-500" size={20} />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-semibold">1,284</span>
            <span className="ml-2 text-sm text-green-500">+12%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Temps de Réponse Moy.</span>
            <Activity className="text-blue-500" size={20} />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-semibold">1.2s</span>
            <span className="ml-2 text-sm text-green-500">-0.3s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Knowledge Base Section */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Espace Connaissances</h2>
            <button className="flex items-center space-x-1 text-sm text-blue-600 hover:underline">
              <Plus size={16} />
              <span>Ajouter</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center space-y-3">
            <Upload className="text-gray-400" size={32} />
            <div>
              <p className="font-medium text-gray-700">Glissez vos fichiers ici</p>
              <p className="text-xs text-gray-500">PDF, TXT ou CSV (max 10MB)</p>
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors">
              Parcourir les fichiers
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="text-blue-500" size={18} />
              <div className="flex-1">
                <p className="text-sm font-medium">Manuel_Interne_RH.pdf</p>
                <p className="text-xs text-gray-500">Indexé le 24/04/2024</p>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Placeholder */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Performance des Agents</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
            <div className="text-center text-gray-400">
              <BarChart3 className="mx-auto mb-2" size={48} />
              <p>Graphiques Tremor à venir...</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Mock icon for the placeholder
function BarChart3({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
