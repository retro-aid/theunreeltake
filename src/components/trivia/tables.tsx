"use client"

import { Trivia } from "@/generated/prisma/client";
import { createTriviaQuestionAction, deleteQuestionAction } from "@/lib/actions/trivia-actions";
import { TriviaQuestionSchema } from "@/lib/schemas";
import { Badge, Box, Button, Checkbox, Group, Modal, Pagination, Paper, Select, Stack, Table, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";

export function TriviaTable({data}: {data: Trivia[]})
{
    const [category, setCategory] = useState<string | null>(null);
    const [type, setType] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<string | null>(null);
    const [published, setStatus] = useState<boolean | null>(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [modalOpened, setModalOpened] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const form = useForm({
    mode: 'uncontrolled',
    initialValues: { question: "", answer: "", category: ""},
    onValuesChange: (values) => {
      console.log(values);
    },
    validate: zod4Resolver(TriviaQuestionSchema),
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (values: typeof form.values) => {
    setServerError(""); 
  
    setIsSuccess(true);
    setModalOpened(false);
    setActiveModal(null);

    if(activeModal == "new")
    {
      await createTriviaQuestionAction(values.question, values.answer, values.category);
    }
    else if(activeModal == "delete")
    {
      if (selectedQuestionId) await deleteQuestionAction(selectedQuestionId);
    }
    
    form.reset();
    };
  
    const handleClose = () => {
      form.reset();
      setIsSuccess(false);
      setServerError("");
      setModalOpened(false);
      setActiveModal(null);
    };


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
              <Button size="xs" variant="light"
              onClick={() => {
                setSelectedQuestionId(item.id)
                setModalOpened(true);
                setActiveModal("edit");
              }}
              >Edit</Button>
              <Button size="xs" variant="light">Publish</Button>
              <Button size="xs" color="red" variant="light"
              onClick={() => {
                setSelectedQuestionId(item.id)
                setModalOpened(true);
                setActiveModal("delete");
              }}
              >Delete</Button>
            </Group>
          </Table.Td>
        </Table.Tr>
      ));

    return (
    <>
    {activeModal == "delete" && (
      <Modal 
        opened={modalOpened} onClose={handleClose} title={"Delete a trivia question"} centered radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
        {serverError && (
          serverError
        )}
        Are you sure you want to delete this question?
        <Group mt="md">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="red" type="submit" loading={form.submitting}>
              Confirm
            </Button>
          </Group>
          </form>
      </Modal>
    )}
    {activeModal == "new" && (
      <Modal
        opened={modalOpened} onClose={handleClose} title={isSuccess ? "" : "Create a new trivia question"} centered radius="md">
              <form onSubmit={form.onSubmit(handleSubmit)}>
                {serverError && (
                  serverError
                )}
      
                <TextInput
                  label="Question"
                  description="The trivia question"
                  placeholder="What studio made Spirited Away?"
                  radius="md"
                  key={form.key("question")}
                  {...form.getInputProps("question")}
                />
                <TextInput
                  label="Answer"
                  description="The trivia question's answer"
                  placeholder="Studio Ghibli"
                  radius="md"
                  key={form.key("answer")}
                  {...form.getInputProps("answer")}
                />
                <TextInput
                  label="Category"
                  description="The trivia question's category"
                  placeholder="Animated films"
                  radius="md"
                  key={form.key("category")}
                  {...form.getInputProps("category")}
                />
                <Group justify="space-between" mt="xl">
                  <Button color="dark" radius="md" type="submit" loading={form.submitting}>
                    Create Question
                  </Button>
                  <Button variant="default" radius="md" onClick={handleClose}>
                    Cancel
                  </Button>
                </Group>
              </form>
          </Modal>
    )}
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
          <Button onClick={() => {
            setModalOpened(true);
            setActiveModal("new")
          }}>Add Questions</Button>
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
  </>
  );  
}