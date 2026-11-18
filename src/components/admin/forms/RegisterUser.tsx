"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { RegisterUserForm, RegisterUserSchema } from "@/lib/schemas";
import { authClient } from "@/lib/auth-client";
import {
  Button,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Flex,
  Overlay,
  Paper,
  Container,
  Center,
  Anchor,
} from "@mantine/core";
import { deleteInvitationToken } from "@/lib/actions";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/**
 *
 * Renders the user registration form so the invited user can create an acccount
 *
 * @param verificationID - ID associated with the user who was invited
 * @param email - The email associated with the user who was invited
 * @returns The registration form UI
 */
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
    <Flex
      mih={"100vh"}
      w="100%"
      pos="relative"
      align="center"
      justify="center"
      style={{
        overflow: "hidden",
        backgroundImage: "url(/img/popcorn.jpg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Overlay color="#000" backgroundOpacity={0.3} zIndex={0} />
      <Image
        src={"/img/white_logo_transparent_background.png"}
        width={3050}
        height={1138}
        placeholder="blur"
        blurDataURL="/img/white_logo_transparent_background.png"
        alt="Unreel Take"
        loading={"eager"}
        style={{
          position: "absolute",
          width: 180,
          height: "auto",
          top: 30,
          left: 25,
        }}
      />

      <Container w="100%" maw={480} px={25}>
        <Paper
          withBorder
          shadow="md"
          p={45}
          mt={10}
          radius={"md"}
          pos={"relative"}
        >
          <Title
            ta="center"
            style={{
              fontSize: 42,
              lineHeight: 1.1,
              marginBottom: 55,
            }}
          >
            Setup Your Account
          </Title>
          {errorMessage ? <Text c={"red"}>{errorMessage}</Text> : null}

          <form onSubmit={registerUserForm.onSubmit(handleCreateUser)}>
            <TextInput
              size="lg"
              label={"Display Name"}
              placeholder={"Name"}
              radius={"lg"}
              key={"name"}
              {...registerUserForm.getInputProps("name")}
            />

            <TextInput
              size="lg"
              label={"Email"}
              placeholder={"Email"}
              radius={"lg"}
              key={"email"}
              autoComplete="off"
              {...registerUserForm.getInputProps("email")}
            />

            <PasswordInput
              size="lg"
              label={"Password"}
              placeholder={"Your password"}
              mt={"lg"}
              radius={"md"}
              key={"password"}
              autoComplete="off"
              {...registerUserForm.getInputProps("password")}
            />

            <PasswordInput
              size="lg"
              label={"Verify Password"}
              placeholder={"Your password"}
              mt={"lg"}
              radius={"md"}
              key={"confirmPassword"}
              {...registerUserForm.getInputProps("confirmPassword")}
            />

            <Button
              fullWidth
              size="lg"
              mt={"xl"}
              radius={"md"}
              type={"submit"}
              loading={registerUserForm.submitting}
              color="dark"
            >
              Submit
            </Button>
          </form>
        </Paper>

        <Center m={"lg"} pos={"relative"}>
          <Anchor
            component={Link}
            href={"/login"}
            c={"white"}
            style={{
              padding: "10px 24px",
              borderRadius: "999px",
              border: "1px solid white",
              display: "inline-block",
            }}
          >
            Back to Login
          </Anchor>
        </Center>
      </Container>
    </Flex>
  );
}
