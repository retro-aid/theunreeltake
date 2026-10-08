"use client";

import { useMemo, useState } from "react";
import type { CulledAdminComment } from "@/lib/dal/dto/comments";
import { AdminCommentGrid } from "./AdminCommentGrid";
import { SearchBar } from "@/components/generic/SearchBar";
import {Flex} from "@mantine/core";

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
 * URT 388 change: updated the search value so it looks like the PostGrid Search
 *
 * @remarks
 * Updated search bar layout: Wrapped within a constrained Mantine Flex box
 * to prevent full-width expansion, matching the visual layout of
 * the Posts page.
 *
 * @param props - Props containing the list of comments to search and manage.
 * @returns The search input paired with the filtered {@link AdminCommentGrid}.
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

  return (
    <>
    <Flex justify={"space-between"} gap={"md"}>
      <Flex miw={500}>
      <SearchBar
		    initialValue={search}
        placeholderText={"Search by post, message, username, email or user ID"}
        onSearchAction={setSearch}
      />
      </Flex>
    </Flex>
      <AdminCommentGrid key={search} comments={filtered} />
    </>
  );
}
