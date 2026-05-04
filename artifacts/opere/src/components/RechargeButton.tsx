import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function RechargeButton({ orgId, onSuccess }: { orgId: string; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    setLoading(true);
    try {
      await api.org.recharge(orgId, 100);
      onSuccess?.();
    } catch (err: any) {
      alert(err.message || "Erreur lors du rechargement");
    } finally {
      setLoading(false);
    }
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
