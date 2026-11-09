"use client";

import { useMemo, useRef, useState } from "react";
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
import { ErrorNotification } from "@/components/email/ErrorNotification";
import { SiteTextEditor } from "@/components/posts/SiteTextEditor";
import { create as createBroadcast } from "@/lib/actions/email/broadcast-actions";
import { get as getTemplate } from "@/lib/actions/email/templates-actions";
import classes from "@/components/newsletter/BroadcastComposer.module.css";

export type BroadcastTemplate = {
  value: string;
  label: string;
  status?: string;
};

export type BroadcastSegment = {
  value: string;
  label: string;
  recipientCount?: number;
};

type BroadcastComposerProps = {
  templates: BroadcastTemplate[];
  segments: BroadcastSegment[];
  loadError?: string;
};

type TemplateContent = {
  subject: string;
  html: string;
};

type Feedback = {
  color: "red" | "teal";
  title: string;
  message: string;
};

function hasVisibleContent(html: string) {
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length > 0
  );
}

/**
 * Creates and sends a one-time broadcast from live Resend templates and
 * mailing lists.
 */
export function BroadcastComposer({
  templates,
  segments,
  loadError,
}: BroadcastComposerProps) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [segmentId, setSegmentId] = useState<string | null>(null);
  const [templateContent, setTemplateContent] =
    useState<TemplateContent | null>(null);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const templateRequest = useRef(0);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.value === templateId),
    [templateId, templates],
  );
  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.value === segmentId),
    [segmentId, segments],
  );

  const activeContent = customMode ? { subject, html } : templateContent;
  const canSend = Boolean(
    segmentId &&
    activeContent?.subject.trim() &&
    hasVisibleContent(activeContent.html),
  );

  const handleTemplateChange = async (value: string | null) => {
    const request = ++templateRequest.current;
    setTemplateId(value);
    setTemplateContent(null);
    setSubject("");
    setHtml("");
    setFeedback(null);

    if (!value) {
      setIsLoadingTemplate(false);
      return;
    }

    setIsLoadingTemplate(true);
    const result = await getTemplate(value);

    if (request !== templateRequest.current) return;
    setIsLoadingTemplate(false);

    if (result.error) {
      setFeedback({
        color: "red",
        title: "Could not load template",
        message: result.error.message,
      });
      ErrorNotification({
        title: "Could not load template",
        message: result.error.message,
        httpCode: result.error.status,
      });
      return;
    }

    const content = {
      subject: result.data.subject ?? "",
      html: result.data.html,
    };
    setTemplateContent(content);
    setSubject(content.subject);
    setHtml(content.html);
  };

  const submitBroadcast = async (schedule?: string) => {
    if (!segmentId || !canSend || isSubmitting) return;

    const content = customMode ? { subject, html } : templateContent;
    if (!content) return;

    let scheduledAtIso: string | undefined;
    if (schedule) {
      const date = new Date(schedule);
      if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
        setFeedback({
          color: "red",
          title: "Choose a future time",
          message: "The scheduled send time must be in the future.",
        });
        return;
      }
      scheduledAtIso = date.toISOString();
    }

    setIsSubmitting(true);
    setFeedback(null);
    const result = await createBroadcast({
      segmentId,
      subject: content.subject.trim(),
      html: content.html,
      ...(scheduledAtIso ? { scheduledAt: scheduledAtIso } : {}),
    });
    setIsSubmitting(false);

    if (result.error) {
      setFeedback({
        color: "red",
        title: "Broadcast was not sent",
        message: result.error.message,
      });
      ErrorNotification({
        title: "Broadcast was not sent",
        message: result.error.message,
        httpCode: result.error.status,
      });
      return;
    }

    setScheduleOpen(false);
    setFeedback({
      color: "teal",
      title: scheduledAtIso ? "Broadcast scheduled" : "Broadcast sent",
      message: scheduledAtIso
        ? `Broadcast ${result.data.id} is scheduled for ${new Date(scheduledAtIso).toLocaleString()}.`
        : `Broadcast ${result.data.id} was queued for immediate delivery.`,
    });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <BackLinkButton />

        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="xs" mb={4}>
              <Title order={2}>Send broadcast</Title>
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

        {loadError && (
          <Alert color="red" title="Some options could not be loaded">
            {loadError}
          </Alert>
        )}

        {feedback && (
          <Alert
            color={feedback.color}
            title={feedback.title}
            withCloseButton
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
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
                disabled={templates.length === 0}
                rightSection={isLoadingTemplate ? "Loading…" : undefined}
                rightSectionWidth={isLoadingTemplate ? 80 : undefined}
                searchable
                clearable={customMode}
              />
              <Select
                label="Mailing list"
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
                  setFeedback(null);
                }}
                disabled={segments.length === 0}
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
                      {templateContent
                        ? "Subject and HTML loaded from Resend."
                        : "Loading subject and HTML…"}
                    </Text>
                  </div>
                  <Badge
                    variant="outline"
                    color={templateContent ? "teal" : "gray"}
                  >
                    {templateContent ? "Ready" : "Loading"}
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
                        setFeedback(null);
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
                            setFeedback(null);
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
                      setFeedback(null);
                    }}
                  />
                  <Button
                    color="teal"
                    variant="light"
                    disabled={!canSend || !scheduledAt || isSubmitting}
                    loading={isSubmitting}
                    onClick={() => submitBroadcast(scheduledAt)}
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
                  : selectedSegment
                    ? `Sending to ${selectedSegment.label}`
                    : "Select a mailing list"}
              </Text>
              <Group>
                <Button
                  variant="subtle"
                  color="gray"
                  leftSection={<PencilSquare size={17} />}
                  onClick={() => {
                    setCustomMode((value) => {
                      const nextValue = !value;
                      if (!nextValue && templateContent) {
                        setSubject(templateContent.subject);
                        setHtml(templateContent.html);
                      }
                      return nextValue;
                    });
                    setFeedback(null);
                  }}
                >
                  {customMode ? "Use template only" : "Send custom"}
                </Button>
                <Button
                  variant="default"
                  leftSection={<Clock size={17} />}
                  onClick={() => {
                    setScheduleOpen((value) => !value);
                    setFeedback(null);
                  }}
                >
                  {scheduleOpen ? "Hide schedule" : "Schedule"}
                </Button>
                <Button
                  color="teal"
                  leftSection={<Send size={17} />}
                  disabled={!canSend || isSubmitting}
                  loading={isSubmitting}
                  onClick={() => submitBroadcast()}
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
