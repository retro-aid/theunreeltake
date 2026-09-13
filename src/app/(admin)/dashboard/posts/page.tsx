"use client"

import { Flex, ActionIcon, Pagination, Group} from "@mantine/core";
import { Funnel, Filter, ArrowClockwise, PencilSquare, Chat, Trash, BarChart } from "react-bootstrap-icons"
import { PostGrid } from "@/app/ui/admin/AdminPostGrid";
import { NewPostButton } from "@/app/ui/admin/NewPostButton";
import React, {useState, useEffect, useTransition, useCallback, useContext} from "react";
import { HomeSearchBar } from "@/app/ui/home/HomeSearchBar";
import { getPostAction} from "@/lib/actions";
import {AuthContext} from "@/app/ui/admin/AuthContext";
import { Post } from "@/generated/prisma/client";

const postsPerPage = 10;

const icons = {
  Edit: PencilSquare,
  Chat: Chat,
  Stats: BarChart,
  Delete: Trash,
};

type CatalogItem = {
  id: string;
  title?: string;
  imageSrc: string;
};

export default function DashboardPostsPage() {

  const authContext = useContext(AuthContext);

  const [isLoading, startTransition] = useTransition();

  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  }

  const refresh = useCallback(() => startTransition(async () => {

    const res = await getPostAction({
      authorId: authContext.user.id,
      page: page,
      limit: postsPerPage,
      search: search
    });

    if(res.success) {
      setPosts(res.data);
      setTotal(Math.ceil(res.total / postsPerPage));
    }

  }), [page, search, authContext.user.id]);

  useEffect(() => refresh(), [refresh]);

  return(
    <div style={{ padding: "0 40px" }}>
      <h1>Your Posts</h1>
      <Flex
        justify={"space-between"}
        gap={"md"}>
        <Group>
          <Flex miw={500}>
            <HomeSearchBar
              onSearchAction={(value: string) => handleSearch(value)}
            />
          </Flex>
          <ActionIcon
            variant={"light"}
            color={"gray"}
            radius={"lg"}
            aria-label={"Filter Button"}>
            <Funnel size={16}/>
          </ActionIcon>
          <ActionIcon
            variant={"light"}
            color={"gray"}
            radius={"lg"}
            aria-label={"Sort Button"}>
            <Filter size={16}/>
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="gray"
            radius="lg"
            onClick={() => refresh()}
          >
            <ArrowClockwise size={16}/>
          </ActionIcon>
        </Group>
        <Group
          justify={"flex-end"}>
          <NewPostButton/>
        </Group>
      </Flex>

      <Flex
        style={{ marginTop: '32px' }}>
        <PostGrid data={posts} icons={icons} />
      </Flex>

      <Pagination
        total={total}
        value={page}
        onChange={setPage}
        color={"gray"}
        style={{
          marginTop: 32,
          bottom: 20,
          left: 300
        }}/>
    </div>
  );
}