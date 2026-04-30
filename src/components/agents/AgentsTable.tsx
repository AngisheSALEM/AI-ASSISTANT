"use client";

import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Button
} from "@/components/ui/TremorComponents";
import { Settings, BookOpen } from "lucide-react";
import { PremiumGlassCard } from "@/components/ui/PremiumGlassCard";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
  createdAt: string | Date;
}

interface AgentsTableProps {
  agents: Agent[];
}

export function AgentsTable({ agents }: AgentsTableProps) {
  return (
    <PremiumGlassCard className="p-4">
      <Table>
        <TableHead>
          <TableRow className="border-black/5 dark:border-white/5">
            <TableHeaderCell className="text-text-primary dark:text-white/70">Nom</TableHeaderCell>
            <TableHeaderCell className="text-text-primary dark:text-white/70">Rôle / Métier</TableHeaderCell>
            <TableHeaderCell className="text-text-primary dark:text-white/70">Statut</TableHeaderCell>
            <TableHeaderCell className="text-text-primary dark:text-white/70">Date de recrutement</TableHeaderCell>
            <TableHeaderCell className="text-right text-text-primary dark:text-white/70">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id} className="border-black/5 dark:border-white/5">
              <TableCell className="font-medium text-text-primary dark:text-white">{agent.name}</TableCell>
              <TableCell className="text-text-secondary dark:text-white/60">{agent.role}</TableCell>
              <TableCell>
                <Badge color={agent.status === "ACTIVE" ? "green" : "red"}>
                  {agent.status}
                </Badge>
              </TableCell>
              <TableCell className="text-text-secondary dark:text-white/60">{new Date(agent.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="xs" variant="secondary" icon={Settings}>
                  Configurer
                </Button>
                <Button size="xs" variant="secondary" icon={BookOpen}>
                  Connaissances
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {agents.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-text-secondary dark:text-white/40">Vous n'avez pas encore d'agents. Visitez la marketplace pour en recruter un !</p>
        </div>
      )}
    </PremiumGlassCard>
  );
}
