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
      <Card shadow="sm" padding="lg" w="249" h="267" withBorder>
        <Card.Section>
          <Box p="xs" pos="relative">
            <Text fz="18" fw="700" mt="5" ml="10" truncate="end">
              {post.title}
            </Text>
            <Badge
              color={post.published ? "green" : "red"}
              pos="absolute"
              mt={10}
              right={20}
              variant="filled"
            >
              {post.published ? "PUBLISHED" : "DRAFT"}
            </Badge>
            <Image
              alt="Post Card"
              bdrs="xs"
              h="122"
              w="217"
              mt="5"
              mx="5"
              src={
                post.posterUrl || "https://placehold.co/600x400?text=No+Poster"
              }
            />

            {/* Left Action Icons: Edit, Comments, Analytics, Change Author */}
            <Group
              style={{
                position: "absolute",
                bottom: 59,
                left: 15,
              }}
              gap={10}
            >
              <Tooltip label="Edit Post">
                <ActionIcon
                  component={Link}
                  href={`/dashboard/posts/edit/${post.id}`}
                  variant="filled"
                  size="md"
                  bdrs="xs"
                  color="black"
                >
                  <icons.Edit size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Comments">
                <ActionIcon variant="light" size="md" bdrs="xs" color="black">
                  <icons.Chat size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Analytics">
                <ActionIcon variant="light" size="md" bdrs="xs" color="black">
                  <icons.Stats size={16} />
                </ActionIcon>
              </Tooltip>

              {/* URT-413 change: Admin-only Change Author Action Icon */}
              {isAdmin && UserIcon && (
                <Tooltip label="Change Author">
                  <ActionIcon
                    variant="light"
                    size="md"
                    bdrs="xs"
                    color="black"
                    onClick={() => setAuthorModalOpened(true)}
                  >
                    <UserIcon size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>

            {/* Delete Icon */}
            <Tooltip label="Delete Post">
              <ActionIcon
                variant="filled"
                size="md"
                bdrs="xs"
                color="red"
                mx="195"
                mt="8"
                onClick={() => setDeleteOpened(true)}
              >
                <icons.Delete size={16} />
              </ActionIcon>
            </Tooltip>

            <Button
              fullWidth
              variant="filled"
              mt="8"
              bdrs="xs"
              onClick={handlePublish}
              loading={isPublishing}
              color={post.published ? "red" : "green"}
            >
              {post.published ? "Unpublish" : "Publish"}
            </Button>
          </Box>
        </Card.Section>
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
          currentAuthorId={(post as any).authorId}
          fetchUsersAction={getAllUsersAction}
        />
      )}
    </>
  );
}
