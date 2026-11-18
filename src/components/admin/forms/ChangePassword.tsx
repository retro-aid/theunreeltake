"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { ChangePasswordForm, ChangePasswordSchema } from "@/lib/schemas";
import { notifyPasswordChanged } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import {
  Button,
  List,
  ListItem,
  PasswordInput,
  Stack,
  Text,
} from "@mantine/core";

export function ChangePassword() {
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const changePasswordForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      currentPassword: "",
      newPassword: "",
    },
    validate: zod4Resolver(ChangePasswordSchema),
  });

  const handleChangePassword = async (formData: ChangePasswordForm) => {
    const { error } = await authClient.changePassword({
      ...formData,
      revokeOtherSessions: false,
    });

    if (error) {
      setErrorMessage(error.message ?? "Incorrect current password");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    } else {
      await notifyPasswordChanged();
      changePasswordForm.reset();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    }

    changePasswordForm.reset();
  };
  /**
   * URT 386 changed:
   * Added input description for new password
   *
   * @remarks
   * the description from <PasswordInput> is part of "@mantine/core"
   *
   * @returns
   * returns the same layout but with now the input description added for when a user wants to change password
   */
  return (
    <>
      <form onSubmit={changePasswordForm.onSubmit(handleChangePassword)}>
        <Stack gap={"md"}>
          <Text size={"md"} c={"dimmed"}>
            Password Requirements:
          </Text>
          <List c={"dimmed"}>
            <ListItem>Must be at least 8 characters long</ListItem>
            <ListItem>Must contain one uppercase letter</ListItem>
            <ListItem>Must contain one number</ListItem>
            <ListItem>Must contain one special character</ListItem>
          </List>

          <PasswordInput
            flex={1}
            maw={300}
            placeholder="Current password"
            radius="md"
            key={changePasswordForm.key("currentPassword")}
            {...changePasswordForm.getInputProps("currentPassword")}
          />

          <PasswordInput
            flex={1}
            maw={300}
            placeholder="New password"
            radius="md"
            key={changePasswordForm.key("newPassword")}
            {...changePasswordForm.getInputProps("newPassword")}
          />

          <Button
            color={"gray.9"}
            type="submit"
            w={"fit-content"}
            loading={changePasswordForm.submitting}
          >
            Change
          </Button>
        </Stack>
      </form>
      {success && (
        <Text c="green" size="sm" mb="md">
          Password changed successfully!
        </Text>
      )}
      {errorMessage && (
        <Text c="red" size="sm" mb="md">
          {errorMessage}
        </Text>
      )}
    </>
  );
}
