"use client";

import {
  Flex,
  Pagination,
  ScrollArea,
  Stack,
  Title
} from "@mantine/core";
import {DashboardCard} from "@/components/comments";
import {useState} from "react";

export default function CommentsPage() {

  const [page, setPage] = useState(1);

  return (
    <Flex direction={"column"} h={"calc(100vh - 32px)"}>

      <Title mb={"lg"}>Recent Comments</Title>

      <ScrollArea bd={"1px solid gray.3"} p={"lg"} bdrs={"md"}>
        <Stack>
          {[...Array(10).keys()].map((value) =>
            <DashboardCard key={value}/>
          )}
        </Stack>
      </ScrollArea>

      <Pagination py={"lg"} siblings={1} total={10}/>

    </Flex>
  );
}