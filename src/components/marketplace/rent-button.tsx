"use client";

import { useState } from "react";
import { Button } from "@tremor/react";
import { rentAgent } from "@/lib/actions/rent-agent";
import { useRouter } from "next/navigation";

export function RentButton({
  orgId,
  templateId,
  price
}: {
  orgId: string,
  templateId: string,
  price: number
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRent = async () => {
    if (!confirm(`Voulez-vous louer cet agent pour ${price} crédits ?`)) return;

    setLoading(true);
    try {
      const result = await rentAgent(orgId, templateId);
      if (result.success) {
        alert("Agent loué avec succès !");
        router.push(`/${orgId}/agents`);
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (err) {
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleRent}
      loading={loading}
      loadingText="Location..."
    >
      Louer cet agent
    </Button>
  );
}
