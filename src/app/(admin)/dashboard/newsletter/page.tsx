'use client';

import { Container, Title, Text, Card, SimpleGrid, Grid, TextInput, Textarea, Button, Table, Badge, Group, Stack, Divider, } from '@mantine/core';
import { useState } from 'react';

// Mock data 
const MOCK_STATS = {
    totalSubscribers: 1284,
    sentThisMonth: 3,
    avgClickRate: '42%',
};

type PastSend = {
    id: string;
    subject: string;
    sentAt: string;
    recipients: number;
    clickRate: string;
    status: 'Sent' | 'Draft';
};

const MOCK_PAST_SENDS: PastSend[] = [
    { id: '1', subject: 'New arrivals this week', sentAt: 'Sep 8, 2026', recipients: 1284, clickRate: '44%', status: 'Sent' },
    { id: '2', subject: 'Weekend picks 🎬', sentAt: 'Sep 1, 2026', recipients: 1250, clickRate: '39%', status: 'Sent' },
    { id: '3', subject: 'August recap', sentAt: 'Aug 25, 2026', recipients: 1201, clickRate: '41%', status: 'Sent' },
];

export default function NewsletterPage() {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [sends, setSends] = useState<PastSend[]>(MOCK_PAST_SENDS);

    return (
        <Container size="lg" py="xl">
            <Title order={2} mb="lg">Newsletter</Title>

    {/* Stats Cards */}
<SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
<Card withBorder padding="lg" radius="md">
  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Subscribers</Text>
  <Text fw={700} size="xl">{MOCK_STATS.totalSubscribers.toLocaleString()}</Text>
</Card>
<Card withBorder padding="lg" radius="md">
  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Sent This Month</Text>
  <Text fw={700} size="xl">{MOCK_STATS.sentThisMonth}</Text>
</Card>
<Card withBorder padding="lg" radius="md">
  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Avg Click Rate</Text>
  <Text fw={700} size="xl">{MOCK_STATS.avgClickRate}</Text>
</Card>
</SimpleGrid>
    {/* Compose */}
<Grid mb="xl">
<Grid.Col span={{ base: 12, md: 6 }}>
  <Card withBorder padding="lg" radius="md" h="100%">
    <Title order={4} mb="md">Compose</Title>
    <Stack>
      <TextInput
        label="Subject"
        placeholder="What's this newsletter about?"
        value={subject}
        onChange={(e) => setSubject(e.currentTarget.value)}
      />
      <Textarea
        label="Body"
        placeholder="Write your newsletter..."
        value={body}
        onChange={(e) => setBody(e.currentTarget.value)}
        minRows={8}
        autosize
      />
      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          Will send to {MOCK_STATS.totalSubscribers.toLocaleString()} subscribers
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
    <Title order={4} mb="md">Preview</Title>
    <Card withBorder radius="sm" bg="gray.0" padding="md">
      <Text fw={700} mb="xs">
        {subject || <Text span c="dimmed" fw={400}>Subject line…</Text>}
      </Text>
      <Divider mb="sm" />
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {body || <Text span c="dimmed">Your message will appear here as you type.</Text>}
      </Text>
    </Card>
  </Card>
</Grid.Col>
</Grid>
        {/* Past Sends Table */}
<Card withBorder padding="lg" radius="md">
<Title order={4} mb="md">Past Sends</Title>
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
          <Badge color={send.status === 'Sent' ? 'green' : 'gray'} variant="light">
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