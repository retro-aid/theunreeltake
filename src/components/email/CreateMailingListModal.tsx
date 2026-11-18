"use client";

import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { create } from "@/lib/actions/email/mailing-lists-actions";
import { notifications } from "@mantine/notifications";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Plus } from "react-bootstrap-icons";
import {
  CreateMailingListInputDTO,
  CreateMailingListInputSchema,
} from "@/lib/schemas/email/mailing-lists-schemas";

export function CreateMailingListModal() {
  const [opened, { open, close }] = useDisclosure();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "" },
    validate: zod4Resolver(CreateMailingListInputSchema),
  });

  const handleSubmit = async (formData: CreateMailingListInputDTO) => {
    const delay = 2000;

    const { error, data } = await create(formData);

    if (!error) {
      setTimeout(() => {
        window.location.reload();
      }, delay);
    }

    const color = error ? "red" : "green";
    const message = error ? error.message : `${data.name} created!`;

    notifications.show({
      color: color,
      message: message,
      autoClose: delay,
    });

    form.reset();
    close();
  };

  return (
    <>
      <ActionIcon
        size={"lg"}
        radius={"sm"}
        title={"Create New"}
        variant={"outline"}
        onClick={open}
      >
        <Plus size={24} />
      </ActionIcon>
      <Modal
        opened={opened}
        onClose={close}
        title={<Text fw={600}>Create a Mailing List</Text>}
        centered
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput
              required
              label="Name"
              description={"The name of this mailing list"}
              key={form.key("name")}
              {...form.getInputProps("name")}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={form.submitting}
                variant={"outline"}
              >
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
