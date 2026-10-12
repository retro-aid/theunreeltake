"use client";

import { Trivia } from "@/generated/prisma/client";
import { Box, Group, Pagination, Paper, Table } from "@mantine/core";
import { useState } from "react";
import { TriviaRow } from "./rows";

export function TriviaTable({ data }: { data: Trivia[] }) {
  // Uses data to set the page
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const pagedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Makes rows of TriviaRow components by mapping the paged data
  const rows = pagedData.map((item) => (
    <TriviaRow key={item.id} question={item} />
  ));

  return (
    <>
      {/* Table */}
      <Paper withBorder radius="md" style={{ overflowX: "auto" }}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Question</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Difficulty</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>% Correct</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
      <Group mt="md" justify="flex-start">
        <Pagination value={page} onChange={setPage} total={totalPages} />
        <Box>{data.length} results</Box>
      </Group>
    </>
  );
}
