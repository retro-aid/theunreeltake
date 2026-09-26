"use client"

import { Flex, Pagination, Group } from "@mantine/core";
import { PencilSquare, Chat, Trash, BarChart } from "react-bootstrap-icons";
import { PostGrid } from "@/app/ui/admin/AdminPostGrid";
import { NewPostButton } from "@/app/ui/admin/NewPostButton";
import React, { useState, useEffect, useTransition, useCallback } from "react";
import { SearchBar } from "@/components/generic/SearchBar";
import { ActionButtons, ActionMenuOption } from "@/components/generic/ActionButtons";
import { getAdminPostsAction } from "@/lib/actions/post-actions";
import { Post } from "@/generated/prisma/client";

const postsPerPage = 10;

const icons = {
  Edit: PencilSquare,
  Chat: Chat,
  Stats: BarChart,
  Delete: Trash,
};

const filterOptions: ActionMenuOption[] = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

const sortOptions: ActionMenuOption[] = [
  { label: "Post Name (A-Z)", value: "title-asc" },
  { label: "Post Name (Z-A)", value: "title-desc" },
  { label: "Date Created (Old - New)", value: "createdAt-asc" },
  { label: "Date Created (New - Old)", value: "createdAt-desc" },
];

export default function DashboardPostsPage() {

  const [, startTransition] = useTransition();

  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("");

  const handleSearch = (value: string) => { setSearch(value); setPage(1); };
  const handleFilter = (value: string) => { setFilter(value); setPage(1); };
  const handleSort = (value: string) => { setSort(value); setPage(1); };

  const refresh = useCallback(() => startTransition(async () => {

    const res = await getAdminPostsAction({
      page,
      limit: postsPerPage,
      search,
      filter,
      sort
    });

    if (res.success) {
      setPosts(res.data);
      setTotal(Math.ceil(res.total / postsPerPage));
    }

  }), [page, search, filter, sort]);

  useEffect(() => refresh(), [refresh]);

  return (
    <div style={{ padding: "0 40px" }}>
      <h1>Your Posts</h1>
      <Flex justify={"space-between"} gap={"md"}>
        <Group>
          <Flex miw={500}>
            <SearchBar
              onSearchAction={(value: string) => handleSearch(value)}
            />
          </Flex>
          <ActionButtons
            filter={{ label: "Filter By", options: filterOptions, onSelect: handleFilter }}
            sort={{ label: "Sort By", options: sortOptions, onSelect: handleSort }}
            onRefresh={refresh}
          />
        </Group>
        <Group justify={"flex-end"}>
          <NewPostButton />
        </Group>
      </Flex>

      <Flex style={{ marginTop: '32px' }}>
        <PostGrid data={posts} icons={icons} />
      </Flex>

      <Pagination
        total={total}
        value={page}
        onChange={setPage}
        color={"gray"}
        style={{ marginTop: 32, bottom: 20, left: 300 }}
      />
    </div>
  );
}