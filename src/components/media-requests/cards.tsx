"use client";

import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Spoiler,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { Trash } from "react-bootstrap-icons";
import type { RequestDTO } from "@/lib/dal/dto/media-requests";

type RequestCardProps = {
  request: RequestDTO;
  onReplyAction: (id: string) => void;
  onDeleteAction: (id: string) => void;
};

/**
 * Card for a single media request with all its info and actions.
 *
 * @remarks
 * Replaces the old click-to-select flow. Each card has its own Create Post,
 * Reply and Delete buttons, so the separate details panel isn't needed
 * anymore. Long messages get cut to 3 lines with a show more toggle, and
 * titles stay on one line (full title shows on hover) so every card in a row
 * lines up.
 *
 * @param props - The request to show and the reply/delete callbacks.
 * @returns A media request card.
 */
export function RequestCard({
  request,
  onReplyAction,
  onDeleteAction,
}: RequestCardProps) {
  const isPending = request.status === "pending";

  return (
    <Paper withBorder radius="md" p="md" h="100%">
      <Stack gap="sm" h="100%">
        <Group justify={request.type ? "space-between" : "flex-end"} gap="xs">
          {request.type && (
            <Badge variant="light" color="gray" size="sm">
              {request.type}
            </Badge>
          )}
          <Badge
            variant="light"
            color={isPending ? "orange" : "blue"}
            size="sm"
          >
            {isPending ? "Pending" : "Replied"}
          </Badge>
        </Group>

        <Title
          order={4}
          lh={1.3}
          lineClamp={1}
          title={request.title}
          style={{ overflowWrap: "anywhere" }}
        >
          {request.title}
        </Title>

        <Stack gap={2}>
          <Text size="sm" fw={600}>
            {request.name || "Anonymous"}
          </Text>
          <Anchor href={`mailto:${request.email}`} size="sm" truncate="end">
            {request.email}
          </Anchor>
        </Stack>

        <Divider />

        {request.message ? (
          <Spoiler
            maxHeight={66}
            showLabel="Show more"
            hideLabel="Show less"
            fz="sm"
          >
            <Text size="sm" style={{ overflowWrap: "anywhere" }}>
              {request.message}
            </Text>
          </Spoiler>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            No message
          </Text>
        )}

        <Group gap="xs" mt="auto" wrap="nowrap">
          <Button
            flex={1}
            component={Link}
            href={{
              pathname: "/dashboard/posts/create",
              query: { mrid: request.id },
            }}
          >
            Create Post
          </Button>
          <Button
            flex={1}
            variant="default"
            onClick={() => onReplyAction(request.id)}
          >
            Reply
          </Button>
          <Tooltip label="Delete request">
            <ActionIcon
              variant="light"
              color="red"
              size="input-sm"
              aria-label={`Delete request for ${request.title}`}
              onClick={() => onDeleteAction(request.id)}
            >
              <Trash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
    </Paper>
  );
}
