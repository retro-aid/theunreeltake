"use client";

import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { DeletePostModal } from "@/app/ui/admin/DeletePostModal";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  Button,
  Group,
  Input,
  MultiSelect,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import {
  createPostAction,
  deletePostAction,
  updatePostAction,
} from "@/lib/actions/post-actions";
import { CreatePostSchema } from "@/lib/schemas";
import { SiteTextEditor } from "@/app/ui/admin/SiteTextEditor";
import { useEffect, useState } from "react";
import { getPostTemplatesAction } from "@/lib/actions/template-actions";
import type { TagDTO } from "@/lib/dal/dto/tags";

interface PostProp {
  id: string;
  title: string;
  slug: string;
  htmlContent: string;
  posterUrl: string | null;
  published: boolean;
  tags: { tagId: number }[];
}

interface PostTemplate {
  id: string;
  title: string;
  htmlContent: string;
}

type Prefill = { title: string; message: string; mediaTags: number[] };

export function PostForm({
  post,
  prefill,
  mediaTags,
}: {
  post?: PostProp | null;
  prefill?: Prefill;
  mediaTags: TagDTO[];
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [templates, setTemplate] = useState<PostTemplate[]>([]);
  const router = useRouter();

  const isEditMode = !!post;

  const [pageContent, setPageContent] = useState(
    post?.htmlContent ||
      (prefill?.message ? "<p>" + prefill.message + "</p>" : ""),
  );

  useEffect(() => {
    if (isEditMode) return;

    getPostTemplatesAction().then((result) => {
      if (result.data) setTemplate(result.data);
    });
  }, [isEditMode]);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: post?.title || prefill?.title || "",
      slug: post?.slug || "",
      tagIds: new Array<{ value: number }>(), // TODO Fix this
      posterUrl: post?.posterUrl ?? null,
      imageUrls: new Array<string>(), // TODO Fix this
      pageContent:
        post?.htmlContent ||
        (prefill?.message ? "<p>" + prefill.message + "</p>" : ""),
    },
    validate: zod4Resolver(CreatePostSchema),
  });

  const handlePageContentChange = (html: string) => {
    setPageContent(html);
    form.setFieldValue("pageContent", html);
  };

  const [appliedTemplateHtml, setAppliedTemplateHtml] = useState<string | null>(
    null,
  );

  const selectTemplate = (templateId: string | null) => {
    if (!templateId) {
      if (appliedTemplateHtml !== null && pageContent === appliedTemplateHtml) {
        setPageContent("");
        form.setFieldValue("pageContent", "");
      }
      setAppliedTemplateHtml(null);
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setPageContent(template.htmlContent);
    form.setFieldValue("pageContent", template.htmlContent);
    setAppliedTemplateHtml(template.htmlContent);
  };

  const handleSubmit = async (action: "publish" | "draft" | "save") => {
    console.log("handleSubmit called with:", action);
    const { hasErrors, errors } = form.validate();

    if (hasErrors) {
      console.log("validation errors:", hasErrors);
      console.log("hasErrors:", hasErrors);
      console.log("errors:", errors);
      console.log("form values:", form.getValues());
      return;
    }
    const values = form.getValues();

    if (isEditMode && post) {
      const isPublishing = action === "publish" ? true : post.published;

      await updatePostAction({
        id: post.id,
        title: values.title,
        slug: values.slug,
        htmlContent: values.pageContent,
        published: isPublishing,
        posterUrl: values.posterUrl,
        tags: values.tagIds.map((i) => {
          return { tagId: i.value };
        }),
        imageUrls: values.imageUrls,
      });

      router.push("/dashboard/posts");
    } else {
      const isPublishing = action === "publish";
      await createPostAction({
        title: values.title,
        slug: values.slug,
        htmlContent: values.pageContent,
        published: isPublishing,
        posterUrl: values.posterUrl,
        imageUrls: values.imageUrls,
        tags: values.tagIds.map((t) => {
          return { tagId: t.value };
        }),
      });
      router.push("/dashboard/posts");
    }
  };

  const handleDeleteConfirm = async () => {
    if (isEditMode && post) {
      await deletePostAction(post.id);
    }
    close();
    router.push("/dashboard/posts");
  };

  return (
    <>
      <DeletePostModal
        opened={opened}
        onClose={close}
        onConfirm={handleDeleteConfirm}
      />

      <Paper
        withBorder
        shadow="sm"
        p="xl"
        radius="md"
        w="100%"
        mih="85vh"
        display="flex"
        style={{ flexDirection: "column" }}
      >
        <Title order={1} mb="lg">
          {isEditMode ? "Edit Post" : "Create New Post"}
        </Title>
        <form>
          <Stack gap="md">
            <TextInput
              label="Post Title"
              placeholder="Enter the title of your post"
              key="title"
              {...form.getInputProps("title")}
            />

            <Group grow align="flex-start">
              <TextInput
                label="Slug"
                placeholder="e.g., my-new-post"
                key="slug"
                {...form.getInputProps("slug")}
              />
              <MultiSelect
                label="Media Type"
                placeholder="Select media type"
                data={mediaTags.map((tag) => ({
                  value: tag.id,
                  label: tag.displayName,
                }))}
                key="tagIds"
                {...form.getInputProps("tagIds")}
              />
              <TextInput
                label="Poster Url"
                placeholder="https://www.example.com"
                key={"posterUrl"}
                {...form.getInputProps("posterUrl")}
              />
            </Group>

            <Group grow align={"flex-start"}>
              <TextInput
                label={"Image 1 Url"}
                placeholder={"https://www.example.com"}
                key={form.key("imageUrls.0")}
                {...form.getInputProps("imageUrls.0")}
              />
              <TextInput
                label={"Image 2 Url"}
                placeholder={"https://www.example.com"}
                key={form.key("imageUrls.1")}
                {...form.getInputProps("imageUrls.1")}
              />
            </Group>

            {!isEditMode && (
              <Select
                label="Start from a template"
                placeholder={
                  templates.length
                    ? "Choose a template"
                    : "No templates available"
                }
                data={templates.map((t) => ({ value: t.id, label: t.title }))}
                onChange={selectTemplate}
                disabled={!templates.length}
                clearable
              />
            )}

            <Input.Wrapper label="Page Content" error={form.errors.pageContent}>
              <SiteTextEditor
                value={pageContent}
                onChange={handlePageContentChange}
              />
            </Input.Wrapper>

            <Group justify="flex-end" mt="md">
              {!isEditMode && (
                <>
                  <Button color="red" onClick={open}>
                    Discard
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleSubmit("draft")}
                  >
                    Save as Draft
                  </Button>
                  <Button color="dark" onClick={() => handleSubmit("publish")}>
                    Publish
                  </Button>
                </>
              )}
              {isEditMode && post && (
                <>
                  <Button color="red" onClick={open}>
                    Delete
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleSubmit("save")}
                  >
                    Save
                  </Button>
                  {!post.published && (
                    <Button
                      color="dark"
                      onClick={() => handleSubmit("publish")}
                    >
                      Publish
                    </Button>
                  )}
                </>
              )}
            </Group>
          </Stack>
        </form>
      </Paper>
    </>
  );
}
