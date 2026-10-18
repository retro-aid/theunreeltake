"use client";
/**
 * removed the previous URT-388 changes and now include the new changes for the comments redesign
 */

import React, { useState } from "react";
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
import { useDisclosure } from "@mantine/hooks";

import { CulledAdminComment } from "@/lib/dal/dto/comments";
import { deleteCommentAction } from "@/lib/actions/comment-actions";
import { DeleteActionModal } from "@/components/generic/modals";
import { ActionMenuOption } from "@/components/generic/ActionButtons";
import { ScrollableGrid } from "@/components/generic/ScrollableGrid";

/**
 * URT419: condense the sort option to make it more relevant options
 */
const sortOptions: ActionMenuOption[] = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "User Name (A-Z)", value: "username-asc" },
  { label: "User Name (Z-A)", value: "username-desc" },
  { label: "Email (A-Z)", value: "email-asc" },
  { label: "Email (Z-A)", value: "email-desc" },
];

function sortComments(comments: CulledAdminComment[], sort: string) {
  if (!sort) return comments;

  const [key, direction] = sort.split("-") as [
    "username" | "userId" | "email" | "createdAt",
    "asc" | "desc",
  ];
  const order = direction === "asc" ? 1 : -1;

  return [...comments].sort((a, b) => {
    const result =
      key === "createdAt"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : (a[key] ?? "").localeCompare(b[key] ?? "");

    return result * order;
  });
}

interface AdminCommentGridProps {
  comments: CulledAdminComment[];
  headerLeft?: React.ReactNode;
  onReply?: (comment: CulledAdminComment) => void;
  onRefresh?: () => void;
}

/**
 * URT-419: some of the redesign occurs here but the comments functionality stays the same
 * The change include the card layout with its user info and action button functions staying the same
 * The buttons is redesign to make it more modern
 * Added the content box to display the comment message
 * made the buttons go top right in the comment card
 * made the avatar logo the initials of the username, maybe down the line could include like profile picture
 * in some parts, the name of color uses var to get that specific color scheme
 */
export function AdminCommentGrid({
  comments,
  headerLeft,
  onReply,
  onRefresh,
}: AdminCommentGridProps) {
  const router = useRouter();
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );

  const handleDeleteClick = (commentId: string) => {
    setSelectedCommentId(commentId);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (selectedCommentId) {
      await deleteCommentAction(selectedCommentId);
      closeDeleteModal();
      setSelectedCommentId(null);
    }
  };

  const renderCommentCard = (comment: CulledAdminComment) => {
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
                  (comment as any).avatarUrl ??
                  (comment as any).userImage ??
                  null
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
                    {comment.post.title}
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
                onClick={() => handleDeleteClick(comment.id)}
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
              "{comment.messageContent}"
            </Text>
          </Paper>
        </Stack>
      </Card>
    );
  };

  return (
    <>
      <DeleteActionModal
        title={"Delete Comment?"}
        description={"This action cannot be undone!"}
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />

      <ScrollableGrid<CulledAdminComment>
        data={comments}
        layout="stack"
        pageSize={5}
        height={700}
        keyExtractor={(item) => item.id}
        renderItem={renderCommentCard}
        sortOptions={sortOptions}
        onSort={sortComments}
        onRefresh={onRefresh}
        headerLeft={headerLeft}
      />
    </>
  );
}
