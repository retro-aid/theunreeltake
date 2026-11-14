import { useState } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { CreateUserForm, CreateUserSchema } from "@/lib/schemas";
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

export function CreateUser() {
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const createUserForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validate: zod4Resolver(CreateUserSchema),
  });

  const handleCreateUser = async (formData: CreateUserForm) => {
    const { error } = await authClient.signUp.email({ ...formData });

    if (error) setErrorMessage(error.message ?? "An Unknown Error Occurred");
    else setSuccess(true);
  };

  if (success) return <Text size={"xl"}>User Created!</Text>;

  return (
    <Box maw={300} p={"lg"}>
      <Title order={3} mb={"sm"}>
        Create User
      </Title>

      {errorMessage ? <Text c={"red"}>{errorMessage}</Text> : null}

      <form onSubmit={createUserForm.onSubmit(handleCreateUser)}>
        <Stack gap={"xs"}>
          <TextInput
            label={"Name"}
            placeholder={"Name"}
            key={"name"}
            {...createUserForm.getInputProps("name")}
          />

          <TextInput
            label={"Email"}
            placeholder={"johndoe@email.com"}
            key={"email"}
            {...createUserForm.getInputProps("email")}
          />

          <PasswordInput
            label={"Password"}
            key={"password"}
            {...createUserForm.getInputProps("password")}
          />

          <Group justify={"center"}>
            <Button
              type={"submit"}
              w={"50%"}
              loading={createUserForm.submitting}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
