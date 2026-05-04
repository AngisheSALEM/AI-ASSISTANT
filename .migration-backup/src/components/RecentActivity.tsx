import { prisma } from "@/lib/prisma"; // Notez les accolades {}
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Title,
  Badge,
} from "@tremor/react";

export default async function RecentActivity({ orgId }: { orgId: string }) {
  // Fetch last 5 conversations for this organization
  const conversations = await prisma.conversation.findMany({
    where: {
      agent: {
        organizationId: orgId,
      },
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      agent: true,
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
    },
  });

  return (
    <Card>
      <Title>Conversations Récentes</Title>
      <Table className="mt-5">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Agent</TableHeaderCell>
            <TableHeaderCell>Premier Message</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Statut</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {conversations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <Text>Aucune activité récente</Text>
              </TableCell>
            </TableRow>
          ) : (
            conversations.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Text className="font-medium">{item.agent?.name || "Assistant Copilot"}</Text>
                  <Text className="text-xs text-gray-500">{item.agent?.role || "Général"}</Text>
                </TableCell>
                <TableCell>
                  <Text className="truncate max-w-xs">
                    {item.messages[0]?.content || "Pas de message"}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text>{new Date(item.updatedAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</Text>
                </TableCell>
                <TableCell>
                  <Badge color="green">Terminé</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
