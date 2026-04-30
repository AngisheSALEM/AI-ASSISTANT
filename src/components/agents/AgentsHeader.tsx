"use client";

import { Title, Text, Button } from "@/components/ui/TremorComponents";
import { User } from "lucide-react";
import Link from "next/link";

export function AgentsHeader({ orgId }: { orgId: string }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <Title>Mes Employés IA</Title>
        <Text>Gérez vos agents actifs et leur configuration.</Text>
      </div>
      <Link href={`/${orgId}/marketplace`}>
        <Button icon={User}>Recruter un nouvel agent</Button>
      </Link>
    </div>
  );
}
