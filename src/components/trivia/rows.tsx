"use client";

import { Trivia } from "@/generated/prisma/client";
import {
  createTriviaQuestionAction,
  deleteQuestionAction,
  updateQuestionAction,
  publishQuestionAction,
} from "@/lib/actions/trivia-actions";
import { TriviaQuestionSchema } from "@/lib/schemas";
import {
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  TableTd,
  TableTr,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";

export function TriviaRow({ question }: { question: Trivia }) {
  const [modalOpened, setModalOpened] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { question: "", answer: "", category: "" },
    validate: zod4Resolver(TriviaQuestionSchema),
  });

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
    } else if (activeModal == "delete") {
      if (selectedQuestionId) await deleteQuestionAction(selectedQuestionId);
    } else if (activeModal == "edit") {
      if (selectedQuestionId)
        await updateQuestionAction(
          selectedQuestionId,
          values.question,
          values.answer,
          values.category,
        );
    } else if (activeModal == "publish") {
      if (selectedQuestionId) await publishQuestionAction(selectedQuestionId);
    }

    form.reset();
    form.setInitialValues({
      question: "",
      answer: "",
      category: "",
    });
  };

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
    <>
      {activeModal == "delete" && (
        <Modal
          opened={modalOpened}
          onClose={handleClose}
          title={"Delete a trivia question"}
          centered
          radius="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            {serverError && serverError}
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
      {activeModal == "edit" && (
        <Modal
          opened={modalOpened}
          onClose={handleClose}
          title={"Edit a trivia question"}
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
                Finish Editing
              </Button>
              <Button variant="default" radius="md" onClick={handleClose}>
                Cancel
              </Button>
            </Group>
          </form>
        </Modal>
      )}
      {activeModal == "publish" && (
        <Modal
          opened={modalOpened}
          onClose={handleClose}
          title={"Publish a trivia question"}
          centered
          radius="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            {serverError && serverError}
            Are you sure you want to publish this question?
            <Group mt="md">
              <Button variant="default" onClick={handleClose}>
                Cancel
              </Button>
              <Button color="green" type="submit" loading={form.submitting}>
                Confirm
              </Button>
            </Group>
          </form>
        </Modal>
      )}
      <TableTr key={question.id}>
        <TableTd>{question.question}</TableTd>
        <TableTd>{question.category}</TableTd>
        <TableTd>{question.difficulty}</TableTd>
        <TableTd>{question.type}</TableTd>
        <TableTd>
          <Badge
            color={question.published === true ? "green" : "red"}
            variant="light"
          >
            {question.published === true ? "Published" : "Draft"}
          </Badge>
        </TableTd>
        <TableTd>{question.sucrate}</TableTd>
        <TableTd>
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              onClick={() => {
                setSelectedQuestionId(question.id);

                setModalOpened(true);
                setActiveModal("edit");
              }}
            >
              Edit
            </Button>
            <Button
              size="xs"
              variant="light"
              onClick={() => {
                setSelectedQuestionId(question.id);
                setModalOpened(true);
                setActiveModal("publish");
              }}
            >
              Publish
            </Button>
            <Button
              size="xs"
              color="red"
              variant="light"
              onClick={() => {
                setSelectedQuestionId(question.id);
                setModalOpened(true);
                setActiveModal("delete");
              }}
            >
              Delete
            </Button>
          </Group>
        </TableTd>
      </TableTr>
    </>
  );
}
