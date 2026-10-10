"use client";

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
import {
  deletePostAction,
  togglePublishedAction,
} from "@/lib/actions/post-actions";
import type { PostDTO } from "@/lib/dal/dto/posts";
import { ScrollableGrid } from "@/components/generic/ScrollableGrid";

type Icons = {
  Edit: React.ElementType;
  Chat: React.ElementType;
  Stats: React.ElementType;
  Delete: React.ElementType;
};

/**
 * Icon component mapping required by the post card actions.
 */
type GridProps = {
  data: PostDTO[];
  icons: Icons;
  onPostUpdatedAction: () => void;
};

export function PostCard({
  post,
  icons,
  onPostUpdatedAction,
}: {
  post: PostDTO;
  icons: Icons;
  onPostUpdatedAction: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const onConfirm = async () => {
    await deletePostAction(post.id);
    setOpened(false);
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

  return (
    <>
      <Card shadow={"sm"} padding={"lg"} w={"249"} h={"267"} withBorder>
        <Card.Section>
          <Box p="xs" pos="relative">
            <Text fz="18" fw="700" mt={"5"} ml={"10"} truncate="end">
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
              alt={"Post Card"}
              bdrs={"xs"}
              h={"122"}
              w={"217"}
              mt={"5"}
              mx={"5"}
              src={
                post.posterUrl || "https://placehold.co/600x400?text=No+Poster"
              }
            />

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
                  variant={"filled"}
                  size={"md"}
                  bdrs={"xs"}
                  color={"black"}
                >
                  <icons.Edit size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Comments">
                <ActionIcon
                  variant={"light"}
                  size={"md"}
                  bdrs={"xs"}
                  color={"black"}
                >
                  <icons.Chat size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Analytics">
                <ActionIcon
                  variant={"light"}
                  size={"md"}
                  bdrs={"xs"}
                  color={"black"}
                >
                  <icons.Stats size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Tooltip label="Delete Post">
              <ActionIcon
                variant={"filled"}
                size={"md"}
                bdrs={"xs"}
                color={"red"}
                mx={"195"}
                mt={"8"}
                onClick={() => setOpened(true)}
              >
                <icons.Delete size={16} />
              </ActionIcon>
            </Tooltip>
            <Button
              fullWidth
              variant="filled"
              mt={"8"}
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
        opened={opened}
        onClose={() => setOpened(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}

/**
 * URT388 change:
 * Grid layout view for rendering posts using the generic {@link ScrollableGrid}.
 *
 * @remarks
 * - Refactored to delegate layout, responsiveness, and scrolling to the generic `ScrollableGrid` component.
 * - height can be adjusted such that if, ex. 600, it can make the posts scrollable
 * - Preserves existing post functionality and cards intact.
 *
 * @param props - Grid configuration props defined in {@link GridProps}.
 * @returns The posts collection rendered inside a scrollable grid container.
 */
export function PostGrid({ data, icons, onPostUpdatedAction }: GridProps) {
  return (
    <ScrollableGrid<PostDTO>
      data={data}
      layout="grid"
      pageSize={0} // Disable pagination so all posts display in a single scrollable viewport
      height={600} // Change the height to check the scroll works
      showActions={false}
      keyExtractor={(post) => post.id}
      gridColProps={{
        span: { base: 12, sm: 6, md: 3 },
        style: { minWidth: 249, maxWidth: 300 },
      }}
      renderItem={(post) => (
        <PostCard
          post={post}
          icons={icons}
          onPostUpdatedAction={onPostUpdatedAction}
        />
      )}
    />
  );
}
