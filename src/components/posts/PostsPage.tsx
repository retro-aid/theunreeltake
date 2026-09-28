"use client";
import { Flex, Pagination, Group } from "@mantine/core";
import { PencilSquare, Chat, Trash, BarChart } from "react-bootstrap-icons";
import { PostGrid } from "@/components/posts/PostGrid";
import { NewPostButton } from "@/app/ui/admin/NewPostButton";
import React, {
  useState,
  useEffect,
  useTransition,
  useCallback,
  useContext,
} from "react";
import { SearchBar } from "@/components/generic/SearchBar";
import { getAllPostsAction } from "@/lib/actions/post-actions";
import { AuthContext } from "@/app/ui/admin/AuthContext";
import type { PostDTO } from "@/lib/dal/dto/posts";
import {
  ActionButtons,
  ActionMenuOption,
} from "@/components/generic/ActionButtons";

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
  const authContext = useContext(AuthContext);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("");

  const [isLoading, startTransition] = useTransition();

  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleFilter = (value: string) => {
    setFilter(value);
    setPage(1);
  };
  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
  };
  const refresh = useCallback(
    () =>
      startTransition(async () => {
        const res = await getAllPostsAction({
          page: page,
          limit: postsPerPage,
          search: search,
          filter,
          sort,
        });

        if (res.success) {
          setPosts(res.data);
          setTotal(Math.ceil(res.total / postsPerPage));
        }
      }),
    [page, search, filter, sort],
  );

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
            filter={{
              label: "Filter By",
              options: filterOptions,
              onSelect: handleFilter,
            }}
            sort={{
              label: "Sort By",
              options: sortOptions,
              onSelect: handleSort,
            }}
            onRefreshAction={refresh}
          />
        </Group>
        <Group justify={"flex-end"}>
          <NewPostButton />
        </Group>
      </Flex>

      <Flex style={{ marginTop: "32px" }}>
        <PostGrid data={posts} icons={icons} onPostUpdatedAction={refresh} />
      </Flex>

      <Pagination
        total={total}
        value={page}
        onChange={setPage}
        color={"gray"}
        style={{
          marginTop: 32,
          bottom: 20,
          left: 300,
        }}
      />
    </div>
  );
}
