"use client";

import {
  Button,
  Container,
  LoadingOverlay,
  Paper,
  TextInput,
  Text,
  Title,
  Stack,
  Center,
  Anchor,
} from "@mantine/core";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { ForgotPasswordForm, ForgotPasswordSchema } from "@/lib/schemas";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function ForgotPassword() {
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const forgotPasswordForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },
    validate: zod4Resolver(ForgotPasswordSchema),
  });

  const handleForgotPassword = async (formData: ForgotPasswordForm) => {
    const { data, error } = await authClient.requestPasswordReset({
      email: formData.email,
      redirectTo: "/reset-password",
    });

    if (error || !data || !data.status) {
      setErrorMessage("An error occurred. Please try again");
      return;
    }

    setSuccess(true);
  };

  /**
 * URT 386 changed: 
 * Added input description for forgot password
 * 
 * @remarks
 * the description from <Text Input> is part of "@mantine/core"
 * 
 * @returns
 * returns the same layout but with now the input description added for user to expect the password reset would be sent to the email inputted 
 */

  return (
    <Container size={420} my={40}>
      <Title ta="center">Forgot Password</Title>

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
                Sent an email verification!
              </Text>
            </Center>
            <Center>
              <Anchor onClick={() => setSuccess(false)}>
                Didn&#39;t get an email? Click here to try again
              </Anchor>
            </Center>
          </Stack>
        ) : (
          <>
            <LoadingOverlay
              visible={forgotPasswordForm.submitting}
              zIndex={1000}
              overlayProps={{ radius: "sm", blur: 2 }}
            />

            {errorMessage ? <Text c={"red"}>{errorMessage}</Text> : null}

            <form onSubmit={forgotPasswordForm.onSubmit(handleForgotPassword)}>
              <TextInput
                label={"Email"}
                description = "Password reset request will be sent to that email"
                placeholder={"johndoe@example.com"}
                radius={"md"}
                key={"email"}
                {...forgotPasswordForm.getInputProps("email")}
              />

              <Button fullWidth mt={"xl"} radius={"md"} type={"submit"}>
                Send Reset Request
              </Button>
            </form>
          </>
        )}
      </Paper>
    </Container>
  );
}
