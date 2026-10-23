"use client";

import { useMemo, useState } from "react";
import type { CulledAdminComment } from "@/lib/dal/dto/comments";
import { AdminCommentGrid } from "./AdminCommentGrid";
import { SearchBar } from "@/components/generic/SearchBar";

export function filterAdminComments(
  comments: CulledAdminComment[],
  search: string,
) {
  const query = search.trim().toLowerCase();
  if (!query) return comments;

  return comments.filter((c) =>
    [c.post.title, c.messageContent, c.username, c.email, c.userId].some(
      (field) => field?.toLowerCase().includes(query),
    ),
  );
}

/**
 * URT-419: the main changes in this is to adjust the search bar so that
 *  the size is appropriotate and the search be on the left to try make it on the same row as the
 * logos on the right
 */
export function AdminCommentSearch({
  comments,
}: {
  comments: CulledAdminComment[];
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => filterAdminComments(comments, search),
    [comments, search],
  );

  const searchElement = (
    <div style={{ width: 500, maxWidth: "100%" }}>
      <SearchBar
        initialValue={search}
        placeholderText="Search by post, message, username, email or user ID"
        onSearchAction={setSearch}
      />
    </div>
  );

  return (
    <AdminCommentGrid
      key={search}
      comments={filtered}
      headerLeft={searchElement}
    />
  );
}
