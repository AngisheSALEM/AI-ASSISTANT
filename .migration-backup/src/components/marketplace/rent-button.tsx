"use client";

import { useState } from "react";
import { Button } from "@tremor/react";
import { rentAgent } from "@/lib/actions/rent-agent";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { SetupWizard } from "@/components/agents/SetupWizard";

export function RentButton({
  orgId,
  templateId,
  templateName,
  price
}: {
  orgId: string,
  templateId: string,
  templateName: string,
  price: number
}) {
  const [loading, setLoading] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const router = useRouter();

  const handleSetupComplete = async (data: any) => {
    setLoading(true);
    setIsWizardOpen(false);
    try {
      const result = await rentAgent(orgId, templateId);
      if (result.success) {
        // En réalité, on passerait data.name et data.files à rentAgent
        // Mais ici on garde la logique existante pour la démo
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
    <>
      <Button
        size="sm"
        onClick={() => setIsWizardOpen(true)}
        loading={loading}
        loadingText="Location..."
      >
        Louer cet agent
      </Button>

      <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)}>
        <SetupWizard
          templateName={templateName}
          onComplete={handleSetupComplete}
        />
      </Modal>
    </>
  );
}
