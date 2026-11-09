"use client";

import { SiteTextEditor } from "@/components/posts/SiteTextEditor";
import {
  Button,
  ButtonGroup,
  Group,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  EmailTemplateForm,
  EmailTemplateSchema,
} from "@/lib/schemas/email/templates-schemas";
import type { PostTemplate } from "@/generated/prisma/client";
import { useState } from "react";
import * as templates from "@/lib/actions/email/templates-actions";
import { redirect, useRouter } from "next/navigation";

interface EmailEditorFormProps {
  template?: ({ id: string } & EmailTemplateForm) | undefined;
  postTemplates?: PostTemplate[] | undefined;
}

export function EmailEditorForm(props: EmailEditorFormProps) {
  const router = useRouter();

  const [editorContent, setEditorContent] = useState(
    props.template?.html ?? "",
  );

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: props.template?.name ?? "",
      html: props.template?.html ?? "",
      subject: props.template?.subject ?? "",
      publish: false,
    },
    validate: zod4Resolver(EmailTemplateSchema),
  });

  const postTemplates = props.postTemplates?.map((t, index) => ({
    value: index,
    label: t.title,
  }));

  const handleEditorInput = (value: string) => {
    setEditorContent(value);
    form.setFieldValue("html", value);
  };

  const handleSubmit = async (submissionType: "publish" | "save") => {
    form.setFieldValue("publish", submissionType === "publish");

    const { errors, hasErrors } = form.validate();

    console.log(errors);

    if (hasErrors) return;

    const response = !props.template
      ? await templates.create(form.values)
      : await templates.update(props.template.id, form.values);

    if (response.error) {
      console.error(response.error.message);
    } else {
      redirect("/dashboard/email");
    }
  };

  return (
    <Group align={"start"}>
      <form>
        <Stack>
          <TextInput
            label={"Name"}
            description={"The name of this email template"}
            key={"name"}
            required
            {...form.getInputProps("name")}
          />

          <TextInput
            label={"Subject"}
            key={"subject"}
            required
            {...form.getInputProps("subject")}
          />

          {postTemplates && postTemplates.length > 0 ? (
            <Select
              label={"Start from a post template"}
              data={postTemplates}
              onChange={(_, option) => {
                if (!props.postTemplates) return;

                const html =
                  props.postTemplates[option.value].htmlContent ?? "";

                handleEditorInput(html);
              }}
            />
          ) : null}

          <ButtonGroup>
            <Button variant={"light"} onClick={() => handleSubmit("save")}>
              Save
            </Button>
            <Button
              color={"green"}
              variant={"light"}
              onClick={() => handleSubmit("publish")}
            >
              Publish
            </Button>
            <Button
              color={"red"}
              variant={"light"}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </Stack>
        <Stack>
          <SiteTextEditor value={editorContent} onChange={handleEditorInput} />
        </Stack>
      </form>
    </Group>
  );
}
