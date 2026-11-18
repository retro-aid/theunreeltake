"use client";

import {
  Button,
  TextInput,
  Text,
  Stack,
  Modal,
  Group,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { ChangeUsernameForm, ChangeUsernameSchema } from "@/lib/schemas";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { ExclamationTriangle } from "react-bootstrap-icons";

export function ChangeUsername() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);

  const usernameForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
    },
    validate: zod4Resolver(ChangeUsernameSchema),
  });

  const handleInitialSubmit = (formData: ChangeUsernameForm) => {
    setErrorMessage("");
    setSuccessMessage("");
    open();
  };

  const executeUsernameUpdate = async () => {
    setIsUpdating(true);
    setErrorMessage("");

    const newUsername = usernameForm.getValues().username;

    const { error } = await authClient.updateUser({
      name: newUsername,
    });

    setIsUpdating(false);

    if (error) {
      setErrorMessage(error.message ?? "An Unknown Error Occurred");
      close();
      return;
    }

    setSuccessMessage("Username successfully updated!");
    usernameForm.reset();
    close();
  };

  /**
   * URT 386 changed:
   * Added input description for new username
   *
   * @remarks
   * the description from <Text Input> is part of "@mantine/core"
   *
   * @returns
   * returns the same layout but with now the input description added for username so users know about new username being visible to everyone
   */
  return (
    <>
      <form onSubmit={usernameForm.onSubmit(handleInitialSubmit)}>
        <Stack gap={"xs"}>
          <Flex align={"center"} columnGap={6}>
            <ExclamationTriangle color={"var(--mantine-color-yellow-7)"} />
            <Text size={"md"} c={"yellow.7"}>
              User name will be visible to everyone!
            </Text>
          </Flex>

          <Group align={"start"}>
            <TextInput
              maw={"300"}
              w={"100%"}
              placeholder="New Username"
              key={usernameForm.key("username")}
              {...usernameForm.getInputProps("username")}
            />

            <Button color={"gray.9"} type="submit">
              Change
            </Button>
          </Group>
        </Stack>
      </form>

      {errorMessage && (
        <Text c="red" size="sm" mt={4}>
          {errorMessage}
        </Text>
      )}

      {successMessage && (
        <Text c="green" size="sm" mt={4}>
          {successMessage}
        </Text>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title="Confirm Username Change"
        centered
        radius="md"
      >
        <Text size="sm" mb="xl">
          Are you sure you want to change your username to{" "}
          <strong>{usernameForm.getValues().username}</strong>?
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={close} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={executeUsernameUpdate}
            loading={isUpdating}
          >
            Confirm Change
          </Button>
        </Group>
      </Modal>
    </>
  );
}
