"use client";

/**
 * URT 386 changes:
 * Added an input description to help users navigate when wanting to comment on a post
 */

import { Button, Fieldset, Group, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { AnonymousCommentFormSchema } from "@/lib/schemas/comment-schemas";
import { postAnonymousCommentAction } from "@/lib/actions/comment-actions";

export function VisitorCommentForm({ slug }: { slug: string }) {
  const commentForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      email: "",
      message: "",
    },
    validate: zod4Resolver(AnonymousCommentFormSchema),
  });

  const handleSubmit = async (formData: typeof commentForm.values) => {
    await postAnonymousCommentAction(slug, formData);
    commentForm.reset();
  };

  /**
   * included the input description so that the users know what to input
   * @returns
   * the descriptions under label to inform the user on what each will do
   *
   * @remarks
   * The description = "" comes from the TextInput - part of "@mantine/core"
   */

  return (
    <form onSubmit={commentForm.onSubmit(handleSubmit)}>
      <Fieldset
        legend={"Leave a Comment"}
        py={{ base: "md", sm: "md" }}
        px={{ base: "md", sm: "xl" }}
      >
        <Group grow>
          <TextInput
            label={"Name:"}
            maw={250}
            description="Username that will be shown on the comment"
            key={commentForm.key("username")}
            {...commentForm.getInputProps("username")}
          />

          <TextInput
            label={"Email:"}
            maw={250}
            description="Email will be used to notify of any replies"
            key={commentForm.key("email")}
            {...commentForm.getInputProps("email")}
          />
        </Group>

        <Textarea
          mt={"md"}
          label={"Message:"}
          minRows={4}
          autosize
          maxLength={500}
          description="Write your comment below (max 500 characters)"
          key={commentForm.key("message")}
          {...commentForm.getInputProps("message")}
        />

        <Button type={"submit"} mt={"lg"} loading={commentForm.submitting}>
          Comment
        </Button>
      </Fieldset>
    </form>
  );
}
