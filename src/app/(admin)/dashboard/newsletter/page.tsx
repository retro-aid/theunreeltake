"use client";

import { AuthContext } from "@/app/ui/admin/AuthContext";
import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  Grid,
  TextInput,
  Textarea,
  Button,
  Table,
  Badge,
  Group,
  Stack,
  Divider,
  Tabs,
  TabsList,
  TabsTab,
  TabsPanel,
} from "@mantine/core";
import { redirect } from "next/navigation";
import { useContext, useState } from "react";

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

type subscriber = {
  id: string,
  firstName: string,
  lastName: string,
  createdAt: string,
  curSub: boolean,
}

type mailingList = {
  name: String,
  subs: subscriber[]
}

const MOCK_MAILING_LISTS: mailingList[] = [
  {
    name: "default",
    subs: [
      {
        id: "0",
        firstName: "Jim",
        lastName: "Jones",
        createdAt: "Some time",
        curSub: true
      },
      {
        id: "1",
        firstName: "Stacy",
        lastName: "Second",
        createdAt: "Never",
        curSub: true
      }
    ]
  },
  {
    name: "unique",
    subs: [
      {
        id: "2",
        firstName: "The",
        lastName: "Third",
        createdAt: "Always",
        curSub: false
      }
    ]
  }
]

/**
 * Creates the UI component for the Newsletter page. Redirects back to dashboard if the user isn't an admin
 * @returns renders the page
 */
export default function NewsletterPage() {
  const authContext = useContext(AuthContext);
  if (authContext.user.role != "admin") redirect("/dashboard");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sends, setSends] = useState<PastSend[]>(MOCK_PAST_SENDS);

  /**
   * URT 386 changed:
   * Added input description for the newsletter body
   *
   * @remarks
   * the description from <Text Input> is part of "@mantine/core"
   *
   * @returns
   * returns the same layout but with now the input description added for the body of the newsletter
   */

  const tables = (
    <Card withBorder padding="lg" radius="md">
      {MOCK_MAILING_LISTS.map((item) => (
        <>
          <Title order={4} mb="md">
            {item.name}
          </Title>

          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>First Name</Table.Th>
                <Table.Th>Last Name</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Currently Subscribed</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {item.subs.map((sub) => (
                <Table.Tr key={sub.id}>
                  <Table.Td>{sub.firstName}</Table.Td>
                  <Table.Td>{sub.lastName}</Table.Td>
                  <Table.Td>{sub.createdAt}</Table.Td>
                  <Table.Td>{sub.curSub}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      ))}
    </Card>
  )

  return (
    <>
    <Tabs color="gray" variant="outline" defaultValue="Newsletter">
      <TabsList>
        <TabsTab value="Newsletter">
          Newsletter
        </TabsTab>
        <TabsTab value="Mailing List Table">
          Mailing List Table
        </TabsTab>
      </TabsList>

    <TabsPanel value="Newsletter">
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">
        Newsletter
      </Title>

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
      {/* Compose */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Title order={4} mb="md">
              Compose
            </Title>
            <Stack>
              <TextInput
                label="Subject"
                placeholder="What's this newsletter about?"
                value={subject}
                onChange={(e) => setSubject(e.currentTarget.value)}
              />
              <Textarea
                label="Body"
                description="The content of the newsletter that the subscribers will see"
                placeholder="Write your newsletter..."
                value={body}
                onChange={(e) => setBody(e.currentTarget.value)}
                minRows={8}
                autosize
              />
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Will send to {MOCK_STATS.totalSubscribers.toLocaleString()}{" "}
                  subscribers
                </Text>
                <Button
                  loading={sending}
                  disabled={!subject.trim() || !body.trim()}
                >
                  Send Newsletter
                </Button>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
        {/* Preview */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Title order={4} mb="md">
              Preview
            </Title>
            <Card withBorder radius="sm" bg="gray.0" padding="md">
              <Text fw={700} mb="xs">
                {subject || (
                  <Text span c="dimmed" fw={400}>
                    Subject line…
                  </Text>
                )}
              </Text>
              <Divider mb="sm" />
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {body || (
                  <Text span c="dimmed">
                    Your message will appear here as you type.
                  </Text>
                )}
              </Text>
            </Card>
          </Card>
        </Grid.Col>
      </Grid>
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
            {sends.map((send) => (
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
    </TabsPanel>

    <TabsPanel value="Mailing List Table">
      {tables}
    </TabsPanel>
  </Tabs>
  </>
  );
}
