"use client";

import {
  Anchor,
  Button,
  Center,
  Container,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { ResetPasswordForm, ResetPasswordSchema } from "@/lib/schemas";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ResetPassword({ token }: { token: string }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const resetPasswordForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      password: "",
    },
    validate: zod4Resolver(ResetPasswordSchema),
  });

  const handleSubmit = async (formData: ResetPasswordForm) => {
    setErrorMessage("");

    const { data, error } = await authClient.resetPassword({
      newPassword: formData.password,
      token: token,
    });

    if (error || !data || !data.status) {
      setErrorMessage(error?.message ?? "An Unknown Error Occurred");
      return;
    }

    setSuccess(true);
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Reset Password</Title>

      <Paper
        withBorder
        shadow="sm"
        p={22}
        mt={30}
        radius={"md"}
        pos={"relative"}
      >
        {success ? (
          <Stack gap={"sm"}>
            <Center>
              <Text size={"xl"} fw={600}>
                Password successfully reset!
              </Text>
            </Center>
            <Center>
              <Anchor href={"/login"}>Go to Login</Anchor>
            </Center>
          </Stack>
        ) : (
          <>
            <LoadingOverlay
              visible={resetPasswordForm.submitting}
              zIndex={1000}
              overlayProps={{ radius: "sm", blur: 2 }}
            />

            {errorMessage ? <Text c={"red"}>{errorMessage}</Text> : null}

            <form onSubmit={resetPasswordForm.onSubmit(handleSubmit)}>
              <PasswordInput
                label={"Password"}
                placeholder={"Your new password"}
                mt={"md"}
                radius={"md"}
                key={"password"}
                {...resetPasswordForm.getInputProps("password")}
              />

              <Button fullWidth mt={"xl"} radius={"md"} type={"submit"}>
                Change Password
              </Button>
            </form>
          </>
        )}
      </Paper>
    </Container>
  );
}
