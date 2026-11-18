"use client";

/**
 * URT-413 changes:
 *  This is where the components of a post card has been moved to here such as the icons, card layout, etc
 *  Also added a new icon button to symbolize change author (if admin)
 */
import React, { useState } from "react";
import {
  Text,
  Card,
  Image,
  Box,
  Group,
  ActionIcon,
  Badge,
  Tooltip,
  Button,
  Stack,
  BackgroundImage,
  Flex,
} from "@mantine/core";
import Link from "next/link";
import { DeletePostModal } from "@/components/posts/DeletePostModal";
import { ChangeAuthorModal } from "@/components/posts/ChangeAuthorModal";
import {
  deletePostAction,
  togglePublishedAction,
  updatePostAuthorAction,
  getAllUsersAction,
} from "@/lib/actions/post-actions";
import type { PostDTO } from "@/lib/dal/dto/posts";
import dayjs from "dayjs";
import { InfoCircle } from "react-bootstrap-icons";

export type Icons = {
  Edit: React.ElementType;
  Chat: React.ElementType;
  Stats: React.ElementType;
  Delete: React.ElementType;
  User?: React.ElementType;
};

export interface PostCardProps {
  post: PostDTO;
  icons: Icons;
  isAdmin?: boolean;
  onPostUpdatedAction: () => void;
}

/**
 * Card component for individual post display and actions.
 */
export function PostCard({
  post,
  icons,
  isAdmin = false,
  onPostUpdatedAction,
}: PostCardProps) {
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [authorModalOpened, setAuthorModalOpened] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const onConfirmDelete = async () => {
    await deletePostAction(post.id);
    setDeleteOpened(false);
    onPostUpdatedAction();
  };

  const onConfirmAuthorChange = async (newAuthorId: string) => {
    const res = await updatePostAuthorAction(post.id, newAuthorId);
    if (res?.success) {
      onPostUpdatedAction();
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const result = await togglePublishedAction(post.id);
    if (!result.success) {
      console.error(result.error);
      setIsPublishing(false);
      return;
    }
    onPostUpdatedAction();
    setIsPublishing(false);
  };

  const UserIcon = icons.User;

  return (
    <>
      <Card shadow="sm" p={"md"} w="249" h="267" bdrs={"sm"} withBorder>
        <Text fz={18} fw={700} truncate="end">
          {post.title}
        </Text>

        <BackgroundImage
          bdrs={"sm"}
          h={121}
          w={216}
          src={post.posterUrl || "https://placehold.co/600x400?text=No+Poster"}
        >
          <Flex justify={"end"}>
            <Badge
              size={"sm"}
              bdrs={"sm"}
              color={post.published ? "green" : "red"}
              m={4}
            >
              {post.published ? "PUBLISHED" : "DRAFT"}
            </Badge>
          </Flex>
        </BackgroundImage>

        <Stack mt={"xs"} gap={"xs"}>
          <Group gap={0}>
            <Group gap={"xs"}>
              <Tooltip
                label={
                  <Stack gap={4}>
                    <Text size="sm">Author: {post.authorName}</Text>
                    <Text size="sm">Views: {post.views}</Text>
                    <Text size="sm">
                      Created: {dayjs(post.createdAt).format("MMM D, YYYY")}
                    </Text>
                    <Text size="sm">
                      Updated: {dayjs(post.updatedAt).format("MMM D, YYYY")}
                    </Text>
                    <Text size="sm">Tags: {post.tagCount}</Text>
                  </Stack>
                }
                multiline
                w={260}
                withArrow
              >
                <ActionIcon
                  size="md"
                  bdrs="sm"
                  color={"gray.9"}
                  aria-label="Post information"
                >
                  <InfoCircle size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Edit Post" withArrow>
                <ActionIcon
                  component={Link}
                  href={`/dashboard/posts/edit/${post.id}`}
                  bdrs="sm"
                  color={"gray.9"}
                >
                  <icons.Edit size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Comments" withArrow>
                <ActionIcon
                  component={Link}
                  href={`/dashboard/posts/comments/${post.id}`}
                  bdrs="sm"
                  color={"gray.9"}
                >
                  <icons.Chat size={16} />
                </ActionIcon>
              </Tooltip>

              {/* URT-413 change: Admin-only Change Author Action Icon */}
              {isAdmin && UserIcon && (
                <Tooltip label="Change Author" withArrow>
                  <ActionIcon
                    bdrs="sm"
                    color={"gray.9"}
                    onClick={() => setAuthorModalOpened(true)}
                  >
                    <UserIcon size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
            <Group flex={1} justify={"end"}>
              <Tooltip label="Delete Post" withArrow>
                <ActionIcon
                  bdrs="sm"
                  color="red"
                  onClick={() => setDeleteOpened(true)}
                >
                  <icons.Delete size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          <Button
            fullWidth
            bdrs="sm"
            onClick={handlePublish}
            loading={isPublishing}
            color={post.published ? "red" : "green"}
          >
            {post.published ? "Unpublish" : "Publish"}
          </Button>
        </Stack>
      </Card>

      <DeletePostModal
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
        onConfirm={onConfirmDelete}
      />

      {isAdmin && (
        <ChangeAuthorModal
          opened={authorModalOpened}
          onClose={() => setAuthorModalOpened(false)}
          onConfirm={onConfirmAuthorChange}
          currentAuthorId={post.authorId ?? ""}
          fetchUsersAction={getAllUsersAction}
        />
      )}
    </>
  );
}
