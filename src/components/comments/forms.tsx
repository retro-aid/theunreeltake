"use client";

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
   * URT 386 changes: include placeholder for the "Leave a comment section"
   *  - the user now knows the name entry is optional
   *  - the user knows the email entry is optional
   *  - the user knows that the max number of words in a comment allowed
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
            placeholder="Name is optional"
            key={commentForm.key("username")}
            {...commentForm.getInputProps("username")}
          />

          <TextInput
            label={"Email:"}
            maw={250}
            placeholder="Email is optional"
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
          placeholder="Write your comment below (max 500 words)"
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
