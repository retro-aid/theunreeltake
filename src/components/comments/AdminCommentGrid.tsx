"use client";

import {CulledAdminComment} from "@/lib/dal/dto/comments";
import {Pagination, ScrollArea, Stack} from "@mantine/core";
import {AdminCommentCard} from "@/components/comments/cards";
import React, {useRef, useState} from "react";


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

  const chunkedComments = chunkData(comments, 5);

  let pageItems: React.JSX.Element[] = [];

  if(chunkedComments.length > 0) {
    pageItems = chunkedComments[page - 1].map(item =>
      <AdminCommentCard key={item.id} comment={item}/>
    );
  }

  const scrollToTop = () => viewport.current!.scrollTo({ top: 0, behavior: 'smooth' });

  const handlePageChange = (p: number) => {
    setPage(p);
    scrollToTop();
  }

  return (
    <>
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
