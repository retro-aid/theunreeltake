import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { Clock } from "react-bootstrap-icons";
import type { ListBroadcastItemDTO } from "@/lib/schemas/email/broadcast-schemas";

type BroadcastStatus = ListBroadcastItemDTO["status"];

type RecentBroadcastsProps = {
  broadcasts: ListBroadcastItemDTO[] | null;
};

/** Badge label and color for each broadcast status. */
const STATUS_BADGE: Record<BroadcastStatus, { label: string; color: string }> =
  {
    sent: { label: "Sent", color: "green" },
    scheduled: { label: "Scheduled", color: "blue" },
    queued: { label: "Sending", color: "yellow" },
    draft: { label: "Draft", color: "gray" },
    canceled: { label: "Canceled", color: "red" },
  };

/**
 * Turns a date from Resend into something readable.
 *
 * @remarks
 * If the date can't be read it just shows what Resend sent instead of
 * "Invalid Date".
 *
 * @param value - The date string from Resend.
 * @returns The formatted date and time.
 */
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

/**
 * Picks which time to show for a broadcast based on its status.
 *
 * @remarks
 * Sent ones show when they went out, scheduled and sending ones show when
 * they're set to go out, and drafts and canceled ones show when they were
 * made.
 *
 * @param broadcast - The broadcast to get the time for.
 * @returns A label like "Sent Nov 3, 2026, 2:15 PM".
 */
function getTimeLabel(broadcast: ListBroadcastItemDTO) {
  if (broadcast.status === "sent" && broadcast.sent_at) {
    return `Sent ${formatDate(broadcast.sent_at)}`;
  }
  if (
    (broadcast.status === "scheduled" || broadcast.status === "queued") &&
    broadcast.scheduled_at
  ) {
    return `Scheduled for ${formatDate(broadcast.scheduled_at)}`;
  }
  return `Created ${formatDate(broadcast.created_at)}`;
}

/**
 * Shows a list of recent broadcasts with their status and time.
 *
 * @remarks
 * Takes the broadcasts as a prop so it can be used on the dashboard and the
 * email Activity tab. Pass `null` if loading them failed to show an error
 * message instead of the list.
 *
 * @param props - The broadcasts to show, or `null` if they failed to load.
 * @returns The recent broadcasts list.
 */
export function RecentBroadcasts({ broadcasts }: RecentBroadcastsProps) {
  if (broadcasts === null) {
    return <Text c="red">Couldn&apos;t load recent broadcasts.</Text>;
  }

  if (broadcasts.length === 0) {
    return <Text c="dimmed">No broadcasts yet.</Text>;
  }

  return (
    <Card withBorder radius="md" p={0}>
      <Stack gap={0}>
        {broadcasts.map((broadcast, index) => {
          const badge = STATUS_BADGE[broadcast.status];

          return (
            <Group
              key={broadcast.id}
              justify="space-between"
              wrap="nowrap"
              p="md"
              style={{
                borderTop:
                  index === 0
                    ? undefined
                    : "1px solid var(--mantine-color-default-border)",
              }}
            >
              <Stack gap={4} style={{ minWidth: 0 }}>
                <Text fw={600} size="sm" truncate="end" title={broadcast.name}>
                  {broadcast.name || "Untitled broadcast"}
                </Text>
                <Group gap={6} wrap="nowrap">
                  <Clock size={12} />
                  <Text size="xs" c="dimmed">
                    {getTimeLabel(broadcast)}
                  </Text>
                </Group>
              </Stack>

              <Badge
                variant="light"
                color={badge.color}
                style={{ flexShrink: 0 }}
              >
                {badge.label}
              </Badge>
            </Group>
          );
        })}
      </Stack>
    </Card>
  );
}
