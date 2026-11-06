"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Container,
  Divider,
  Grid,
  Group,
  Input,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Clock, Envelope, PencilSquare, Send } from "react-bootstrap-icons";
import BackLinkButton from "@/components/generic/BackLinkButton";
import { SiteTextEditor } from "@/components/posts/SiteTextEditor";
import classes from "@/components/newsletter/BroadcastComposer.module.css";

export type BroadcastTemplate = {
  value: string;
  label: string;
  subject: string;
  html: string;
  description?: string;
};

export type BroadcastSegment = {
  value: string;
  label: string;
  recipientCount?: number;
};

type BroadcastComposerProps = {
  templates?: BroadcastTemplate[];
  segments?: BroadcastSegment[];
};

const MOCK_TEMPLATES: BroadcastTemplate[] = [
  {
    value: "weekly-reel",
    label: "Weekly Reel",
    subject: "This week at The Unreel Take",
    description: "A weekly roundup of new reviews and recommendations.",
    html: `
      <h2>This week at The Unreel Take</h2>
      <p>Here are the stories, reviews, and recommendations you may have missed.</p>
      <p><strong>Featured review:</strong> Add this week's featured story here.</p>
      <p>Thanks for reading!</p>
    `,
  },
  {
    value: "new-review",
    label: "New Review",
    subject: "A new review just landed",
    description: "Highlights one newly published movie or television review.",
    html: `
      <h2>A new review just landed</h2>
      <p>We watched it, took notes, and have thoughts.</p>
      <p>Add a short review teaser and link here.</p>
    `,
  },
  {
    value: "monthly-recap",
    label: "Monthly Recap",
    subject: "The month in movies",
    description: "A recap of the month's most popular posts.",
    html: `
      <h2>The month in movies</h2>
      <p>Catch up on the conversations our readers enjoyed most this month.</p>
      <ul><li>Top story</li><li>Most discussed review</li><li>Editor's pick</li></ul>
    `,
  },
];

const MOCK_SEGMENTS: BroadcastSegment[] = [
  { value: "all-subscribers", label: "All subscribers", recipientCount: 1284 },
  { value: "active-readers", label: "Active readers", recipientCount: 842 },
  { value: "new-subscribers", label: "New subscribers", recipientCount: 196 },
];

function hasVisibleContent(html: string) {
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length > 0
  );
}

/**
 * UI-only draft of the one-time broadcast workflow.
 *
 * Templates and segments are optional props so a server page can provide live
 * data later without changing the composer interface.
 */
export function BroadcastComposer({
  templates = MOCK_TEMPLATES,
  segments = MOCK_SEGMENTS,
}: BroadcastComposerProps) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [segmentId, setSegmentId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.value === templateId),
    [templateId, templates],
  );
  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.value === segmentId),
    [segmentId, segments],
  );

  const canSend = Boolean(
    segmentId &&
    (customMode ? subject.trim() && hasVisibleContent(html) : selectedTemplate),
  );

  const handleTemplateChange = (value: string | null) => {
    setTemplateId(value);
    setNotice(null);

    const template = templates.find((item) => item.value === value);
    if (!template) return;

    setSubject(template.subject);
    setHtml(template.html);
  };

  const showDraftNotice = (action: "send" | "schedule") => {
    if (!canSend) return;

    setNotice(
      action === "send"
        ? "Send-now is ready for backend wiring. No broadcast was sent."
        : "Scheduling is ready for backend wiring. No broadcast was scheduled.",
    );
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <BackLinkButton />

        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="xs" mb={4}>
              <Title order={2}>One-time broadcast</Title>
            </Group>
            <Text c="dimmed">
              Choose an audience and template, then send immediately, schedule
              it, or customize the message.
            </Text>
          </div>
          <ThemeIcon size="xl" radius="md" variant="light" color="teal">
            <Envelope size={22} />
          </ThemeIcon>
        </Group>

        {notice && (
          <Alert
            color="teal"
            title="UI preview"
            withCloseButton
            onClose={() => setNotice(null)}
          >
            {notice}
          </Alert>
        )}

        <Paper withBorder radius="md" p="lg">
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Select
                label="Email template"
                description={
                  customMode
                    ? "Choose a starting point or switch templates while editing."
                    : "Select the content to send."
                }
                placeholder={
                  customMode
                    ? "Choose a template (optional)"
                    : "Choose a template"
                }
                data={templates.map(({ value, label }) => ({ value, label }))}
                value={templateId}
                onChange={handleTemplateChange}
                searchable
                clearable={customMode}
              />
              <Select
                label="Subscriber segment"
                description="Select who should receive this broadcast."
                placeholder="Choose a segment"
                data={segments.map((segment) => ({
                  value: segment.value,
                  label:
                    segment.recipientCount === undefined
                      ? segment.label
                      : `${segment.label} (${segment.recipientCount.toLocaleString()})`,
                }))}
                value={segmentId}
                onChange={(value) => {
                  setSegmentId(value);
                  setNotice(null);
                }}
                searchable
              />
            </SimpleGrid>

            {selectedTemplate && !customMode && (
              <Card withBorder radius="md" bg="gray.0">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Selected template
                    </Text>
                    <Text fw={700} mt={4}>
                      {selectedTemplate.label}
                    </Text>
                    <Text size="sm" c="dimmed" mt={4}>
                      {selectedTemplate.description}
                    </Text>
                  </div>
                  <Badge variant="outline" color="teal">
                    Ready
                  </Badge>
                </Group>
              </Card>
            )}

            {customMode && (
              <Grid gap="lg">
                <Grid.Col span={{ base: 12, lg: 8 }}>
                  <Stack gap="md">
                    <TextInput
                      label="Subject"
                      description="The subject line recipients will see."
                      placeholder="Enter a subject line"
                      value={subject}
                      onChange={(event) => {
                        setSubject(event.currentTarget.value);
                        setNotice(null);
                      }}
                    />
                    <Input.Wrapper
                      label="Email content"
                      description="Selecting a template loads its HTML into this editor."
                    >
                      <Box className={classes.editor} mt="xs">
                        <SiteTextEditor
                          value={html}
                          onChange={(value) => {
                            setHtml(value);
                            setNotice(null);
                          }}
                        />
                      </Box>
                    </Input.Wrapper>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 4 }}>
                  <Card withBorder radius="md" h="100%">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Preview
                    </Text>
                    <Text fw={700} mt="sm">
                      {subject || "Your subject line"}
                    </Text>
                    <Divider my="sm" />
                    {hasVisibleContent(html) ? (
                      <Box
                        className={classes.previewBody}
                        fz="sm"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    ) : (
                      <Text size="sm" c="dimmed">
                        Choose a template or start writing to preview the email.
                      </Text>
                    )}
                  </Card>
                </Grid.Col>
              </Grid>
            )}

            <Collapse expanded={scheduleOpen}>
              <Card withBorder radius="md" bg="gray.0">
                <Group align="flex-end" grow>
                  <TextInput
                    type="datetime-local"
                    label="Schedule date and time"
                    description="Choose when this broadcast should be sent."
                    value={scheduledAt}
                    onChange={(event) => {
                      setScheduledAt(event.currentTarget.value);
                      setNotice(null);
                    }}
                  />
                  <Button
                    color="teal"
                    variant="light"
                    disabled={!canSend || !scheduledAt}
                    onClick={() => showDraftNotice("schedule")}
                  >
                    Confirm schedule
                  </Button>
                </Group>
              </Card>
            </Collapse>

            <Divider />

            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                {selectedSegment?.recipientCount !== undefined
                  ? `${selectedSegment.recipientCount.toLocaleString()} recipients selected`
                  : "Select a segment to see the audience size"}
              </Text>
              <Group>
                <Button
                  variant="subtle"
                  color="gray"
                  leftSection={<PencilSquare size={17} />}
                  onClick={() => {
                    setCustomMode((value) => !value);
                    setNotice(null);
                  }}
                >
                  {customMode ? "Use template only" : "Send custom"}
                </Button>
                <Button
                  variant="default"
                  leftSection={<Clock size={17} />}
                  onClick={() => {
                    setScheduleOpen((value) => !value);
                    setNotice(null);
                  }}
                >
                  {scheduleOpen ? "Hide schedule" : "Schedule"}
                </Button>
                <Button
                  color="teal"
                  leftSection={<Send size={17} />}
                  disabled={!canSend}
                  onClick={() => showDraftNotice("send")}
                >
                  Send now
                </Button>
              </Group>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
