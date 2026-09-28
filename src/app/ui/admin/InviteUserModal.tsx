"use client";

import { useState } from "react";
import { Modal, Button, TextInput, Text, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { InviteUserSchema } from "@/lib/schemas";
import { checkUserExists, createInvitationVerification } from "@/lib/actions";

export function InviteUserModal({
  opened,
  onCloseAction,
}: {
  opened: boolean;
  onCloseAction: () => void;
}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "" },
    validate: zod4Resolver(InviteUserSchema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    setServerError("");

    // Check to see if the user exists
    const userExists = await checkUserExists(values.email);
    if (userExists) {
      setServerError("A user with this email already exists");
      return;
    }

    await createInvitationVerification(values.email);

    setIsSuccess(true);
  };

  const handleClose = () => {
    form.reset();
    setIsSuccess(false);
    setServerError("");
    onCloseAction();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isSuccess ? "" : "Invite a New User"}
      centered
      radius="md"
    >
      {isSuccess ? (
        <Stack align="center" py="md">
          <Text fw={700} size="xl">
            Invite a New User
          </Text>
          <Text>Invitation successfully sent!</Text>
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
            label="Email"
            description="The email of the user you're inviting"
            placeholder="someuser@domain.com"
            radius="md"
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          <Group justify="space-between" mt="xl">
            <Button
              color="dark"
              radius="md"
              type="submit"
              loading={form.submitting}
            >
              Send Invitation
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
