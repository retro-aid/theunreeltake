"use client";

/**
 * refactor the so that the comment card is its own component since other teammates would like to use it.
 * Test the functionality and all still works.
 */
import React from "react";
import {
  Card,
  Group,
  Text,
  Avatar,
  Button,
  Stack,
  Paper,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { CulledAdminComment } from "@/lib/dal/dto/comments";

export interface AdminCommentCardProps {
  comment: CulledAdminComment;
  onDeleteClick?: (id: string) => void;
  onReply?: (comment: CulledAdminComment) => void;
}

export function AdminCommentCard({
  comment,
  onDeleteClick,
  onReply,
}: AdminCommentCardProps) {
  const router = useRouter();

  const rawName = comment.username?.trim();
  const isAnonymous =
    !rawName ||
    rawName.toLowerCase() === "anonymous" ||
    rawName.toLowerCase() === "anonymous user";
  const displayName = isAnonymous ? "Anonymous User" : rawName;

  const initials = isAnonymous
    ? "?"
    : displayName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";

  const formattedDate = comment.createdAt
    ? dayjs(comment.createdAt).format("MMM DD, YYYY h:mm A")
    : "Recent";

  const shortId = comment.userId
    ? `${comment.userId.slice(0, 6)}...${comment.userId.slice(-5)}`
    : null;

  return (
    <Card
      withBorder
      radius="md"
      p="md"
      shadow="none"
      bg="white"
      style={{ borderColor: "var(--mantine-color-gray-3)" }}
    >
      <Stack gap="xs">
        {/* Header Row: User Info & Subtitles on the Left, Action Buttons in the Top-Right */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group
            align="flex-start"
            gap="md"
            wrap="nowrap"
            style={{ minWidth: 0, flex: 1 }}
          >
            <Avatar
              src={
                (comment as any).avatarUrl ?? (comment as any).userImage ?? null
              }
              color={isAnonymous ? "gray" : "blue"}
              radius="xl"
              size="lg"
              styles={{
                placeholder: { fontSize: "0.95rem", fontWeight: 600 },
              }}
            >
              {initials}
            </Avatar>

            <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
              <Group gap="xs" align="baseline" wrap="wrap">
                <Title order={4} fw={700} c="dark.9">
                  {displayName}
                </Title>
                <Text size="xs" c="dimmed">
                  • {formattedDate}
                </Text>
              </Group>

              <Group gap="xs" align="center" wrap="wrap">
                <Text size="xs" fw={600} c="dark.6">
                  {comment.post?.title}
                </Text>
                <Text size="xs" c="dimmed">
                  • {comment.email ?? "No email given"}
                </Text>
                {shortId && (
                  <>
                    <Text size="xs" c="dimmed">
                      •
                    </Text>
                    <Text size="xs" c="dimmed" ff="monospace">
                      User ID: {shortId}
                    </Text>
                  </>
                )}
              </Group>
            </Stack>
          </Group>

          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            <Button
              size="xs"
              color="blue"
              radius="sm"
              px="xs"
              onClick={() => router.push(`/blog/${comment.postSlug}`)}
            >
              View Post
            </Button>
            <Button
              size="xs"
              variant="default"
              radius="sm"
              px="xs"
              onClick={() => onReply?.(comment)}
            >
              Reply
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              radius="sm"
              px="xs"
              onClick={() => onDeleteClick?.(comment.id)}
              styles={{
                root: {
                  backgroundColor: "var(--mantine-color-red-0)",
                  border: "1px solid var(--mantine-color-red-2)",
                },
              }}
            >
              Delete
            </Button>
          </Group>
        </Group>

        <Paper
          p="sm"
          radius="sm"
          bg="gray.0"
          withBorder
          style={{ borderColor: "var(--mantine-color-gray-2)" }}
        >
          <Text
            size="sm"
            c="dark.8"
            style={{ wordBreak: "break-word", lineHeight: 1.55 }}
          >
            {comment.messageContent}
          </Text>
        </Paper>
      </Stack>
    </Card>
  );
}
