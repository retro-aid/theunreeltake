"use client";

import {CulledAdminComment} from "@/lib/dal/dto/comments";
import {Group, Pagination, ScrollArea, Stack} from "@mantine/core";
import {AdminCommentCard} from "@/components/comments/cards";
import React, {useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {ActionButtons, ActionMenuOption} from "@/components/generic/ActionButtons";

const sortOptions: ActionMenuOption[] = [
  { label: "User Name (A-Z)", value: "username-asc" },
  { label: "User Name (Z-A)", value: "username-desc" },
  { label: "User ID (A-Z)", value: "userId-asc" },
  { label: "User ID (Z-A)", value: "userId-desc" },
  { label: "Email (A-Z)", value: "email-asc" },
  { label: "Email (Z-A)", value: "email-desc" },
  { label: "Date Posted (Old - New)", value: "createdAt-asc" },
  { label: "Date Posted (New - Old)", value: "createdAt-desc" },
];

function sortComments(comments: CulledAdminComment[], sort: string) {

  if (!sort) return comments;

  const [key, direction] = sort.split("-") as ["username" | "userId" | "email" | "createdAt", "asc" | "desc"];
  const order = direction === "asc" ? 1 : -1;

  return [...comments].sort((a, b) => {
    const result = key === "createdAt"
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : (a[key] ?? "").localeCompare(b[key] ?? "");

    return result * order;
  });
}

export function chunkData<T>(array: T[], chunkSize: number): T[][] {

  if(!array.length)
    return [];

  const head = array.slice(0, chunkSize);
  const tail = array.slice(chunkSize);

  return [head, ...chunkData(tail, chunkSize)];
}

export function AdminCommentGrid(
  { comments }: { comments: CulledAdminComment[] }
) {

  const viewport = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [sort, setSort] = useState("");

  const chunkedComments = chunkData(sortComments(comments, sort), 5);

  let pageItems: React.JSX.Element[] = [];

  if(chunkedComments.length > 0) {
    pageItems = chunkedComments[page - 1].map(item =>
      <AdminCommentCard key={item.id} comment={item}/>
    );
  }

  const scrollToTop = () => viewport.current!.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
  }

  const handlePageChange = (p: number) => {
    setPage(p);
    scrollToTop();
  }

  return (
    <>
      <Group mb={"md"}>
        <ActionButtons
          sort={{ label: "Sort By", options: sortOptions, onSelect: handleSort }}
          onRefresh={() => router.refresh()}
        />
      </Group>
      <ScrollArea
        bd={"1px solid gray.3"}
        bg={"gray.0"}
        p={"lg"}
        bdrs={"md"}
        h={700}
        viewportRef={viewport}
      >
        <Stack>
          {pageItems}
        </Stack>
      </ScrollArea>

      <Pagination
        total={chunkedComments.length}
        value={page}
        onChange={handlePageChange}
        siblings={1}
        py={"lg"}
      />
    </>
  );
}
