"use client"

import { useState } from "react";
import { Modal, Button, TextInput, Text, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { TriviaQuestionSchema } from "@/lib/schemas";
import { createTriviaQuestion} from "@/lib/actions";

export function AddTriviaQuestion({ opened, onCloseAction }: { opened: boolean, onCloseAction: () => void })
{
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState("");

    const form = useForm({
    mode: "uncontrolled",
    initialValues: { question: "", answer: "", category: ""},
    validate: zod4Resolver(TriviaQuestionSchema)
  });

  const handleSubmit = async (values: typeof form.values) => {
    setServerError(""); 

    await createTriviaQuestion(values.question, values.answer, values.category);

    setIsSuccess(true);
  };

  const handleClose = () => {
    form.reset();
    setIsSuccess(false);
    setServerError("");
    onCloseAction();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={isSuccess ? "" : "Create a new trivia question"} centered radius="md">
      {isSuccess ? (
        <Stack align="center" py="md">
          <Text fw={700} size="xl">Create a new trivia question</Text>
          <Text>Trivia Question successfully made!</Text>
          <Button mt="md" color="dark" radius="md" onClick={handleClose}>
            Great!
          </Button>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {serverError && (
            <Text c="red" size="sm" mb="sm">
              {serverError}
            </Text>
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
      )}
    </Modal>
  );
}