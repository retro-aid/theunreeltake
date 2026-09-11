"use client";

import {
  Button,
  Fieldset,
  Group,
  Textarea,
  TextInput
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {zod4Resolver} from "mantine-form-zod-resolver";
import {AnonymousCommentFormSchema} from "@/lib/schemas/comment-schemas";
import {postAnonymousCommentAction} from "@/lib/actions/comment-actions";



export function VisitorCommentForm(
  { slug }: { slug: string }
) {

  const commentForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      email: "",
      message: ""
    },
    validate: zod4Resolver(AnonymousCommentFormSchema)
  });

  const handleSubmit =
    async (formData: typeof commentForm.values) => {
      await postAnonymousCommentAction(slug, formData);
      commentForm.reset();
    }

  return (
    <form onSubmit={commentForm.onSubmit(handleSubmit)}>

      <Fieldset
        legend={"Leave a Comment"}
        py={{base: "md", sm: "md"}}
        px={{base: "md", sm: "xl"}}
      >

        <Group grow>

          <TextInput
            label={"Name:"}
            maw={250}
            key={commentForm.key("username")}
            {...commentForm.getInputProps("username")}
          />

          <TextInput
            label={"Email:"}
            maw={250}
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
          key={commentForm.key("message")}
          {...commentForm.getInputProps("message")}
        />

        <Button
          type={"submit"}
          mt={"lg"}
          loading={commentForm.submitting}
        >
          Comment
        </Button>

      </Fieldset>

    </form>
  );
}