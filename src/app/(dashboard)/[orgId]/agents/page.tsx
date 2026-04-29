import prisma from "@/lib/prisma";
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Button
} from "@tremor/react";
import { Settings, BookOpen, User } from "lucide-react";
import Link from "next/link";

export default async function AgentsPage({ params }: { params: { orgId: string } }) {
  const agents = await prisma.agent.findMany({
    where: { organizationId: params.orgId },
    include: { template: true }
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title>Mes Employés IA</Title>
          <Text>Gérez vos agents actifs et leur configuration.</Text>
        </div>
        <Link href={`/${params.orgId}/marketplace`}>
          <Button icon={User}>Recruter un nouvel agent</Button>
        </Link>
      </div>

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
            <Text>Vous n'avez pas encore d'agents. Visitez la marketplace pour en recruter un !</Text>
          </div>
        )}
      </Card>
    </div>
  );
}
