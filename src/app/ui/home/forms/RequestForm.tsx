"use client";

import {
  Button,
  Card,
  Divider,
  Fieldset,
  Flex,
  Group,
  NativeSelect,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useEffect, useState } from "react";
import { RequestFormSchema } from "@/lib/schemas";
import {
  AllowedTagType,
  maxTextAreaLength,
  maxTextInputLength,
} from "@/lib/constants";
import { getAllTags, submitRequestForm } from "@/lib/actions";
import Link from "next/link";
import { Tag } from "@/generated/prisma/client";

export function RequestForm() {
  const [mediaTags, setMediaTags] = useState(new Array<Tag>());

  useEffect(() => {
    getAllTags(AllowedTagType.Media).then((result) => {
      if (result.data) {
        setMediaTags(result.data);
      }
    });
  }, []);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      email: "",
      title: "",
      mediaType: "Movie",
      message: "",
    },
    validate: zod4Resolver(RequestFormSchema),
    validateInputOnChange: true,
  });

  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await submitRequestForm(values);
      form.reset();
      setCompleted(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (completed) {
    return (
      <Flex justify="center" align="center" direction="column" py="xl">
        <Card shadow="sm" padding="xl" w={{ base: "100%", sm: 500 }}>
          <Title order={2} mb="md" ta={"center"}>
            Thank you for your request!
          </Title>
          <Text component={Link} href={"/"} ta={"center"}>
            Back to home
          </Text>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex justify="center" py="xl">
      <Card shadow="sm" w={"100%"} maw={900} px={{ base: "md", lg: "xl" }}>
        <Title order={1} ta={"center"} mb="lg">
          Send Us Your Request
        </Title>

        <Text size="md" mb={"sm"}>
          Didn’t find the Unreel Take you were looking for? Request a movie for
          our review! Since we all have day jobs, we are entering in movies as
          we watch them. If there is a movie you are looking for that we haven’t
          reviewed, just request it and we will watch it as soon as we can.
        </Text>

        <Text size="md" mb="xl">
          Once it is ready, we will personally let you know. Leaving your name
          is optional, but please insert your email address so we know how to
          notify you. None of the information you submit below is stored any
          longer than necessary. Once we post your requested review, all
          submitted information is deleted.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Flex direction={{ base: "column", sm: "row" }} gap="md" mb="md">
            <Fieldset legend="Your Information" w={{ base: "100%", sm: "50%" }}>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                withAsterisk
                mb="sm"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />
              <TextInput
                label="Name (optional)"
                placeholder="Your Name"
                mb="sm"
                maxLength={maxTextInputLength}
                key={form.key("name")}
                {...form.getInputProps("name")}
              />
            </Fieldset>
            <Fieldset
              legend="Request Information"
              w={{ base: "100%", sm: "50%" }}
            >
              <TextInput
                label="Title"
                placeholder="Title of movie, book, etc."
                withAsterisk
                mb="sm"
                maxLength={maxTextInputLength}
                key={form.key("title")}
                {...form.getInputProps("title")}
              />
              <NativeSelect
                label="Type"
                data={mediaTags.map((tag) => tag.displayName)}
                mb="sm"
                key={form.key("mediaType")}
                {...form.getInputProps("mediaType")}
              />
              <Textarea
                label="Message (optional)"
                placeholder="Anything else you want us to know"
                autosize
                minRows={3}
                maxLength={maxTextAreaLength}
                key={form.key("message")}
                {...form.getInputProps("message")}
              />
            </Fieldset>
          </Flex>

          <Divider my="xl" size="sm" color="rgba(0,0,0,0.1)" />
          <Text c="dimmed" size="sm" mb="md" ta={"center"}>
            By clicking the submit button, you agree to allow us to store and
            process the information above for contact purposes.
          </Text>
          <Group justify="center" mt="md">
            <Button
              type="submit"
              w={{ base: "100%", sm: "50%" }}
              loading={form.submitting}
              radius="xl"
              color={"dark"}
            >
              Submit Request
            </Button>
          </Group>
        </form>
      </Card>
    </Flex>
  );
}
