"use client";

import { useState } from "react";
import { Coins, Plus, Loader2 } from "lucide-react";

export default function RechargeButton({ orgId, currentCredits }: { orgId: string, currentCredits: number }) {
  const [loading, setLoading] = useState(false);

  const handleRecharge = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payments/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId, amount: 100 }),
      });

      if (response.ok) {
        // En prod on utiliserait une notification toast
        alert("Paiement simulé réussi ! 100 crédits ajoutés.");
        window.location.reload(); // Rechargement simple pour mettre à jour le dashboard
      }
    } catch (error) {
      console.error("Recharge error:", error);
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
