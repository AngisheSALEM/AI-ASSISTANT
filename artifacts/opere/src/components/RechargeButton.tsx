import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

export default function RechargeButton({ orgId, currentCredits }: { orgId: string, currentCredits: number }) {
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    setLoading(true);
    setTimeout(() => {
      alert("Paiement simulé réussi ! 100 crédits ajoutés.");
      setLoading(false);
    }, 1500);
  };

  return (
    <button
      onClick={handleRecharge}
      disabled={loading}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <Plus size={16} />
      )}
      <span>Recharger 100 crédits</span>
    </button>
  );
}
