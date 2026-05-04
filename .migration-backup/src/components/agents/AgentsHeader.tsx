"use client";

import { Title, Text, Button } from "@/components/ui/TremorComponents";
import { User } from "lucide-react";
import Link from "next/link";

export function AgentsHeader({ orgId }: { orgId: string }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold font-fraunces tracking-tight text-text-primary dark:text-white">
          Mes Employés IA
        </h1>
        <p className="text-text-secondary dark:text-white/50">
          Gérez vos agents actifs et leur configuration.
        </p>
      </div>
      <Link href={`/${orgId}/marketplace`}>
        <Button icon={User}>Recruter un nouvel agent</Button>
      </Link>
    </div>
  );
}
