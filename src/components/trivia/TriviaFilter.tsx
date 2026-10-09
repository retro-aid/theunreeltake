"use client";

import { Trivia } from "@/generated/prisma/client";
import {
  Title,
  Group,
  Select,
  TextInput,
  Box,
  Stack,
  Button,
  Modal,
} from "@mantine/core";
import { useState } from "react";
import { TriviaTable } from "./tables";
import { createTriviaQuestionAction } from "@/lib/actions/trivia-actions";
import { TriviaQuestionSchema } from "@/lib/schemas";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";

export function TriviaFilter({ data }: { data: Trivia[] }) {
  // Filter States
  const [category, setCategory] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [published, setStatus] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  // Filtered Data
  const filteredData = data.filter((item) => {
    return (
      (!category || item.category === category) &&
      (!type || item.type === type) &&
      (!difficulty || item.difficulty === difficulty) &&
      (!published || item.published === published) &&
      item.question.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Modal States
  const [modalOpened, setModalOpened] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  // Form used for creating new trivia questions
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { question: "", answer: "", category: "" },
    validate: zod4Resolver(TriviaQuestionSchema),
  });

  // Function for handling the create question button
  const handleSubmit = async (values: typeof form.values) => {
    setServerError("");

    setIsSuccess(true);
    setModalOpened(false);
    setActiveModal(null);

    if (activeModal == "new") {
      await createTriviaQuestionAction(
        values.question,
        values.answer,
        values.category,
      );
    }

    form.reset();
    form.setInitialValues({
      question: "",
      answer: "",
      category: "",
    });
  };

  // Handles forms being closed
  const handleClose = () => {
    form.reset();
    setIsSuccess(false);
    setServerError("");
    setModalOpened(false);
    setActiveModal(null);

    form.setInitialValues({
      question: "",
      answer: "",
      category: "",
    });
  };

  return (
    //Modal for creating a new trivia question
    <>
      {activeModal == "new" && (
        <Modal
          opened={modalOpened}
          onClose={handleClose}
          title={isSuccess ? "" : "Create a new trivia question"}
          centered
          radius="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            {serverError && serverError}

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
              <Button
                color="dark"
                radius="md"
                type="submit"
                loading={form.submitting}
              >
                Create Question
              </Button>
              <Button variant="default" radius="md" onClick={handleClose}>
                Cancel
              </Button>
            </Group>
          </form>
        </Modal>
      )}

      {/* Filter Bar + Add Questions Button*/}
      <Box
        p="lg"
        style={{ minHeight: "95vh", display: "flex", flexDirection: "column" }}
      >
        <Stack gap="lg" style={{ flex: 1 }}>
          <Title order={2}>Trivia</Title>
          <Group>
            <Select
              placeholder="Category: All"
              data={["Horror", "Comedy", "Action", "Thriller"]}
              value={category}
              onChange={setCategory}
            />
            <Select
              placeholder="Type: All"
              data={["Multiple Choice", "True/False"]}
              value={type}
              onChange={setType}
            />
            <Select
              placeholder="Difficulty: All"
              data={["Easy", "Medium", "Hard", "Extreme"]}
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
            <Button
              onClick={() => {
                setModalOpened(true);
                setActiveModal("new");
              }}
            >
              Add Questions
            </Button>
          </Group>

          {/* Trivia Table */}
          <TriviaTable key={search} data={filteredData} />
        </Stack>
      </Box>
    </>
  );
}
