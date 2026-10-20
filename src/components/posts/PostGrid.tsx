"use client";

import React, { useState } from "react";

import type { PostDTO } from "@/lib/dal/dto/posts";
import { ScrollableGrid } from "@/components/generic/ScrollableGrid";




/**
 * URT-413 changes:
 *  Part of the implementation is to refactor the components of the PostCard and create its own called PostCard.tsx
 *  This ensures it follows the team's code structure and easier to navigate
 */
import { PostCard, type Icons } from "@/components/posts/PostCard";

type GridProps = {
  data: PostDTO[];
  icons: Icons;
  isAdmin?: boolean;
  onPostUpdatedAction: () => void;
};


/**
 * Grid layout view for rendering posts using {@link ScrollableGrid}.
 */
export function PostGrid({
  data,
  icons,
  isAdmin = false,
  onPostUpdatedAction,
}: GridProps) {
  return (
    <ScrollableGrid<PostDTO>
      data={data}
      layout="grid"
      pageSize={0}
      height={600}
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
          isAdmin={isAdmin}
          onPostUpdatedAction={onPostUpdatedAction}
        />
      )}
    />
  );
}
