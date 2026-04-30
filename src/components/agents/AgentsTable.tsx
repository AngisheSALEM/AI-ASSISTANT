"use client";

import {
  Card,
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
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nom</TableHeaderCell>
            <TableHeaderCell>Rôle / Métier</TableHeaderCell>
            <TableHeaderCell>Statut</TableHeaderCell>
            <TableHeaderCell>Date de recrutement</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell className="font-medium text-slate-900">{agent.name}</TableCell>
              <TableCell>{agent.role}</TableCell>
              <TableCell>
                <Badge color={agent.status === "ACTIVE" ? "green" : "red"}>
                  {agent.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(agent.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="xs" variant="secondary" icon={Settings}>
                  Configurer
                </Button>
                <Button size="xs" variant="secondary" icon={BookOpen} color="slate">
                  Connaissances
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {agents.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-gray-500">Vous n'avez pas encore d'agents. Visitez la marketplace pour en recruter un !</p>
        </div>
      )}
    </Card>
  );
}
