"use client";

import { AuthContext } from "@/app/ui/admin/AuthContext";
import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  Table,
  Badge,
  Group,
} from "@mantine/core";
import { redirect } from "next/navigation";
import { useContext } from "react";
import { BroadcastButton } from "@/components/newsletter";

{
  /*Mock data */
}
const MOCK_STATS = {
  totalSubscribers: 1284,
  sentThisMonth: 3,
  avgClickRate: "42%",
};

type PastSend = {
  id: string;
  subject: string;
  sentAt: string;
  recipients: number;
  clickRate: string;
  status: "Sent" | "Draft";
};

const MOCK_PAST_SENDS: PastSend[] = [
  {
    id: "1",
    subject: "New arrivals this week",
    sentAt: "Sep 8, 2026",
    recipients: 1284,
    clickRate: "44%",
    status: "Sent",
  },
  {
    id: "2",
    subject: "Weekend picks 🎬",
    sentAt: "Sep 1, 2026",
    recipients: 1250,
    clickRate: "39%",
    status: "Sent",
  },
  {
    id: "3",
    subject: "August recap",
    sentAt: "Aug 25, 2026",
    recipients: 1201,
    clickRate: "41%",
    status: "Sent",
  },
];

/**
 * Creates the UI component for the Newsletter page. Redirects back to dashboard if the user isn't an admin
 * @returns renders the page
 */
export default function NewsletterPage() {
  const authContext = useContext(AuthContext);
  if (authContext.user.role != "admin") redirect("/dashboard");

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={2}>Newsletter</Title>
          <Text c="dimmed" mt={4}>
            Create one-time broadcasts and review recent newsletter activity.
          </Text>
        </div>
        <BroadcastButton />
      </Group>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Card withBorder padding="lg" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Total Subscribers
          </Text>
          <Text fw={700} size="xl">
            {MOCK_STATS.totalSubscribers.toLocaleString()}
          </Text>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Sent This Month
          </Text>
          <Text fw={700} size="xl">
            {MOCK_STATS.sentThisMonth}
          </Text>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Avg Click Rate
          </Text>
          <Text fw={700} size="xl">
            {MOCK_STATS.avgClickRate}
          </Text>
        </Card>
      </SimpleGrid>
      {/* Past Sends Table */}
      <Card withBorder padding="lg" radius="md">
        <Title order={4} mb="md">
          Past Sends
        </Title>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Sent</Table.Th>
              <Table.Th>Recipients</Table.Th>
              <Table.Th>Click Rate</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {MOCK_PAST_SENDS.map((send) => (
              <Table.Tr key={send.id}>
                <Table.Td>{send.subject}</Table.Td>
                <Table.Td>{send.sentAt}</Table.Td>
                <Table.Td>{send.recipients.toLocaleString()}</Table.Td>
                <Table.Td>{send.clickRate}</Table.Td>
                <Table.Td>
                  <Badge
                    color={send.status === "Sent" ? "green" : "gray"}
                    variant="light"
                  >
                    {send.status}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Container>
  );
}
