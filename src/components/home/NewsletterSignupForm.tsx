"use client";

import { list as listMailingLists } from "@/lib/actions/email/mailing-lists-actions";
import { create as createSubscriber } from "@/lib/actions/email/subscribers-actions";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { CreateSubscriberInputSchema } from "@/lib/schemas/email/subscriber-schemas";
import { useState } from "react";
import {
  Button,
  Flex,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

export function NewsletterSignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validate: zod4Resolver(CreateSubscriberInputSchema),
  });

  const handleSubmit = async (formData: typeof form.values) => {
    let mailingList: string | undefined = undefined;

    const { data } = await listMailingLists({ paginateOption: "none" });

    if (data && data.data.length > 0)
      mailingList = data.data[data.data.length - 1].id;

    const response = await createSubscriber({
      ...formData,
      segments: !mailingList ? undefined : [{ id: mailingList }],
    });

    if (response.error || !response.data) {
      setError("Something went wrong. Please try again later!");
      form.reset();
      return;
    }

    setSuccess(true);
    form.reset();
  };

  return (
    <Stack gap={"xs"} mx={"md"}>
      <Title order={2} ta={"center"}>
        Never Miss a Review
      </Title>
      <Text ta={"center"}>Signup For Our Newsletter</Text>
      {success ? (
        <Text ta={"center"} c={"green"}>
          Thanks for subscribing! We&#39;ll be in touch soon!
        </Text>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Flex w={"100%"} justify={"center"}>
            <Stack gap={"xs"} maw={450}>
              <Group justify={"center"}>
                <TextInput
                  flex={1}
                  label={"First Name"}
                  withAsterisk
                  key={form.key("firstName")}
                  {...form.getInputProps("firstName")}
                  placeholder="John"
                  radius="md"
                  type={"text"}
                />
                <TextInput
                  flex={1}
                  label={"Last Name"}
                  withAsterisk
                  key={form.key("lastName")}
                  {...form.getInputProps("lastName")}
                  placeholder="Doe"
                  radius="md"
                  type={"text"}
                />
              </Group>

              <TextInput
                label={"Email"}
                withAsterisk
                key={form.key("email")}
                {...form.getInputProps("email")}
                placeholder="johndoe@email.com"
                radius="md"
                type={"email"}
              />
              <Flex w={"100%"} justify={"center"}>
                <Button
                  loading={form.submitting}
                  radius={"md"}
                  type={"submit"}
                  w={"100%"}
                  maw={200}
                  color={"dark"}
                >
                  Submit
                </Button>
              </Flex>
              {error ? (
                <Text c={"red"} ta={"center"}>
                  {error}
                </Text>
              ) : null}
            </Stack>
          </Flex>
        </form>
      )}
    </Stack>
  );
}
