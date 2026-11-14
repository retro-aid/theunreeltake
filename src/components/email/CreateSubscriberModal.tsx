"use client";

import {
  Button,
  Modal,
  TextInput,
  Group,
  Stack,
  Text,
  ActionIcon,
} from "@mantine/core";
import { create } from "@/lib/actions/email/subscribers-actions";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  CreateSubscriberInputDTO,
  CreateSubscriberInputSchema,
} from "@/lib/schemas/email/subscriber-schemas";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Plus } from "react-bootstrap-icons";
import { notifications } from "@mantine/notifications";

export function CreateSubscriberModal() {
  const initialValues: CreateSubscriberInputDTO = {
    email: "",
    firstName: "",
    lastName: "",
  };

  const [opened, { open, close }] = useDisclosure();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: initialValues,
    validate: zod4Resolver(CreateSubscriberInputSchema),
  });

  const handleSubmit = async (formData: CreateSubscriberInputDTO) => {
    const { error, data } = await create(formData);

    const color = error ? "red" : "green";
    const message = error ? error.message : `${data.id} created!`;

    notifications.show({
      color: color,
      message: message,
      autoClose: 5000,
    });

    close();
  };

  return (
    <>
      <ActionIcon
        size={"lg"}
        radius={"sm"}
        title={"Add subscriber"}
        variant={"outline"}
        onClick={open}
      >
        <Plus size={24} />
      </ActionIcon>
      <Modal
        opened={opened}
        onClose={close}
        title={<Text fw={600}>Add New Subscriber</Text>}
        centered
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput
              required
              label="Email"
              placeholder="user@example.com"
              key={form.key("email")}
              {...form.getInputProps("email")}
            />
            <TextInput
              required
              label="First Name"
              placeholder="John"
              key={form.key("firstName")}
              {...form.getInputProps("firstName")}
            />
            <TextInput
              required
              label="Last Name"
              placeholder="Doe"
              key={form.key("lastName")}
              {...form.getInputProps("lastName")}
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
                Save Contact
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
