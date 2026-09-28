"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { RegisterUserForm, RegisterUserSchema } from "@/lib/schemas";
import { authClient } from "@/lib/auth-client";
import {
  Box,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { deleteInvitationToken } from "@/lib/actions";
import { redirect } from "next/navigation";

export function RegisterUser({
  verificationID,
  email,
}: {
  verificationID: string;
  email: string;
}) {
  const [errorMessage, setErrorMessage] = useState("");

  const registerUserForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      email: email,
      password: "",
      confirmPassword: "",
    },
    validate: zod4Resolver(RegisterUserSchema),
  });

  const handleCreateUser = async (
    formData: Omit<RegisterUserForm, "confirmPassword">,
  ) => {
    const { error } = await authClient.signUp.email({ ...formData });

    if (error) {
      setErrorMessage(error.message ?? "An Unknown Error Occurred");
      return;
    }

    const { statusMessage, success } =
      await deleteInvitationToken(verificationID);

    if (!success) {
      setErrorMessage(statusMessage);
    }

    redirect("/dashboard");
  };

  return (
    <Box maw={300} p={"lg"}>
      <Title order={3} mb={"sm"}>
        Setup Your Account
      </Title>

      {errorMessage ? <Text c={"red"}>{errorMessage}</Text> : null}

      <form onSubmit={registerUserForm.onSubmit(handleCreateUser)}>
        <Stack gap={"xs"}>
          <TextInput
            label={"Display Name"}
            placeholder={"Name"}
            key={"name"}
            {...registerUserForm.getInputProps("name")}
          />

          <PasswordInput
            label={"Password"}
            key={"password"}
            {...registerUserForm.getInputProps("password")}
          />

          <PasswordInput
            label={"Verify Password"}
            key={"confirmPassword"}
            {...registerUserForm.getInputProps("confirmPassword")}
          />

          <Group justify={"center"}>
            <Button
              type={"submit"}
              w={"50%"}
              loading={registerUserForm.submitting}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
