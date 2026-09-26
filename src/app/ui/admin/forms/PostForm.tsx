"use client";

import {useForm} from "@mantine/form";
import {useDisclosure} from "@mantine/hooks";
import {useRouter} from "next/navigation";
import {DeletePostModal} from "@/app/ui/admin/DeletePostModal";
import {zod4Resolver} from "mantine-form-zod-resolver";
import {Button, Group, Input, Paper, MultiSelect, Stack, TextInput, Title} from "@mantine/core";
import {createNewPost, deletePost, getAllTags, savePost} from "@/lib/actions";
import {Button, Group, Input, Paper, Select, Stack, TextInput, Title} from "@mantine/core";
import {createNewPost, deletePost, getAllTags} from "@/lib/actions";
import {CreatePostSchema} from "@/lib/schemas";
import {SiteTextEditor} from "@/app/ui/admin/SiteTextEditor"
import {useEffect, useState} from "react";
import {Tag} from "@/generated/prisma/client";
import {updatePostAction} from "@/lib/actions/post-actions";

interface PostProp {
  id: string;
  title: string;
  slug: string;
  htmlContent: string;
  posterUrl: string | null;
  published: boolean;
  mediaTagId: number[];
}

type Prefill = { title: string; message: string; mediaTagId: number[] };

export function PostForm({ post, prefill }: { post?: PostProp | null; prefill?: Prefill }) {
  const [mediaTags, setMediaTags] = useState(new Array<Tag>());
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  useEffect(() => {
    // REMOVED 'AllowedTagType.Media' so it fetches ALL tags and it works 
    getAllTags()
      .then(result => {
        if(result.data) {
          setMediaTags(result.data);
        }
      });
  }, []);

  const isEditMode = !!post;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: post?.title || prefill?.title || "",
      slug: post?.slug || "",
      mediaTagId: post?.mediaTagId?.map(String) ?? prefill?.mediaTagId?.map(String) ?? [],
      posterUrl: post?.posterUrl ?? null,
      pageContent: post?.htmlContent || (prefill?.message ? "<p>" + prefill.message + "</p>" : ""),
    },
    validate: zod4Resolver(CreatePostSchema),
  });

  const handleSubmit= async (action: "publish" | "draft" | "save") => {
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    const values = form.getValues();
    const parsedMediaTagIds = values.mediaTagId.map((id: string) => parseInt(id, 10));

    if (isEditMode && post) {
      const isPublishing = action === "publish" ? true : post.published;

      const { error, success } = await savePost(
        post.id,
        values.title,
        values.slug,
        values.pageContent,
        isPublishing,
        values.posterUrl ? values.posterUrl : null,
        parsedMediaTagIds
      );

      if(!success) {
        console.log(error);
        return;
      }
      await updatePostAction({
        id: post.id,
        slug: values.slug,
        title: values.title,
        posterUrl: values.posterUrl,
        htmlContent: values.pageContent,
        imageUrls: [],
        published: isPublishing,
        tags: [ {tagId: values.mediaTagId} ]
      });

      router.push('/dashboard/posts');

    } else {
      const isPublishing = action === "publish";
      await createNewPost({...values, mediaTagId: parsedMediaTagIds, published: isPublishing });
      router.push('/dashboard/posts');
    }
  };

  const handleDeleteConfirm = async () => {
    if (isEditMode && post) {
      await deletePost(post.id);
    }
    close();
    router.push('/dashboard/posts');
  }
  
  return (
    <>
      <DeletePostModal opened={opened} onClose={close} onConfirm={handleDeleteConfirm} />

      <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" mih="85vh" display="flex" style={{ flexDirection: 'column' }}>
        <Title order={1} mb="lg">{isEditMode ? "Edit Post" : "Create New Post"}</Title>
        <form>
          <Stack gap="md">
            <TextInput label="Post Title" placeholder="Enter the title of your post" key="title" {...form.getInputProps('title')} />

            <Group grow align="flex-start">
              <TextInput label="Slug" placeholder="e.g., my-new-post" key="slug" {...form.getInputProps('slug')} />
              <MultiSelect
                label="Tags"
                placeholder="Select media type"
                searchable
                clearable
                hidePickedOptions
                data={mediaTags.map((tag) => ({ value: String(tag.id), label: tag.displayName }))}
                key="mediaTagId"
                {...form.getInputProps('mediaTagId')}
              />
              <TextInput label="Poster Url" placeholder="https://www.example.com" key={"posterUrl"} {...form.getInputProps("posterUrl")} />
            </Group>

            <Input.Wrapper label="Page Content" error={form.errors.pageContent}>
              <SiteTextEditor value={form.getInputProps('pageContent').defaultValue} onChange={form.getInputProps('pageContent').onChange} />
            </Input.Wrapper>

            <Group justify="flex-end" mt="md">
              {!isEditMode && (
                <>
                  <Button color="red" onClick={open}>Discard</Button>
                  <Button variant="default" onClick={() => handleSubmit("draft")}>Save as Draft</Button>
                  <Button color="dark" onClick={() => handleSubmit("publish")}>Publish</Button>
                </>
              )}
              {isEditMode && post && (
                <>
                  <Button color="red" onClick={open}>Delete</Button>
                  <Button variant="default" onClick={() => handleSubmit("save")}>Save</Button>
                  {!post.published && (
                     <Button color="dark" onClick={() => handleSubmit("publish")}>Publish</Button>
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