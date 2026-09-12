"use client"

import { Trivia } from "@/generated/prisma/client";
import { Badge, Box, Button, Checkbox, Group, Pagination, Paper, Select, Stack, Table, TextInput, Title } from "@mantine/core"
import { useState } from "react";

export function TriviaTable({data}: {data: Trivia[]})
{
    const [category, setCategory] = useState<string | null>(null);
    const [type, setType] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<string | null>(null);
    const [published, setStatus] = useState<boolean | null>(null);
    const [search, setSearch] = useState("");
      
    const filteredData = data.filter((item) => {
       return(
        (!category || item.category === category) &&
        (!type || item.type === type) &&
        (!difficulty || item.difficulty === difficulty) &&
        (!published || item.published === published) &&
        item.question.toLowerCase().includes(search.toLowerCase())
       );
      });
      
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const pagedData = filteredData.slice(
     (page - 1) * PAGE_SIZE,
     page * PAGE_SIZE
    );

    const rows = pagedData.map((item, index) => (
        <Table.Tr key={index}>
          <Table.Td><Checkbox 
           checked={selectedRows.includes(index)}
           onChange={(e) => {
           if (e.currentTarget.checked) {
             setSelectedRows([...selectedRows, index]);
           } else {
             setSelectedRows(selectedRows.filter((i) => i !== index));
           }}}/>
          </Table.Td>
          <Table.Td>{item.question}</Table.Td>
          <Table.Td>{item.category}</Table.Td>
          <Table.Td>{item.difficulty}</Table.Td>
          <Table.Td>{item.type}</Table.Td>
          <Table.Td>
            <Badge color={item.published === true ? "green" : "red"} variant="light">
              {item.published === true ? "Published" : "Draft"}
            </Badge>
          </Table.Td>
          <Table.Td>{item.sucrate}</Table.Td>
          <Table.Td>
            <Group gap="xs">
              <Button size="xs" variant="light">Edit</Button>
              <Button size="xs" variant="light">Publish</Button>
              <Button size="xs" color="red" variant="light">Delete</Button>
            </Group>
          </Table.Td>
        </Table.Tr>
      ));

    return (
    <Box p="lg" style={{ minHeight: "95vh", display: "flex", flexDirection: "column" }}>
      <Stack gap="lg" style={{ flex: 1 }}>
        <Title order={2}>Trivia</Title>
        <Group>
          <Select
            placeholder="Category: All"
            data={['Horror', 'Comedy', 'Action', 'Thriller']}
            value={category}
            onChange={setCategory}
          />
          <Select
           placeholder="Type: All"
           data={['Multiple Choice', 'True/False']}
           value={type}
           onChange={setType}
          />
          <Select
           placeholder="Difficulty: All"
           data={['Easy', 'Medium', 'Hard', 'Extreme']}
           value={difficulty}
           onChange={setDifficulty}
          />
          <Select
           placeholder="Status: All"
           data={[true, false]}
           value={published}
           onChange={setStatus}
          />
          <TextInput
           placeholder="Search..."
           value={search}
           onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Button>Add Questions</Button>
        </Group>

        {/* Bulk Actions */}
        <Group>
          <Checkbox label="Select all" 
            checked={pagedData.length > 0 && selectedRows.length === pagedData.length}
            indeterminate={
              selectedRows.length > 0 && selectedRows.length < pagedData.length
            }
            onChange={(e) => {
              if (e.currentTarget.checked) {
                setSelectedRows(pagedData.map((_, index) => index));
              } else {
                setSelectedRows([]);
              }
            }}
          />
          <Group gap="xs">
            <Button variant="subtle" color="red">Delete</Button>
            <Button variant="subtle">Publish</Button>
            <Button variant="subtle">Move</Button>
          </Group>
        </Group>

        {/* Table */}
        <Paper withBorder radius="md" style={{overflowX:"auto"}}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th></Table.Th>
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
      </Stack>
      <Group mt="md" justify="flex-start" >
        <Pagination
          value={page}
          onChange={setPage}
          total={totalPages}
        />
        <Box>
         {filteredData.length} results
        </Box>
      </Group>
    </Box>
  );  
}