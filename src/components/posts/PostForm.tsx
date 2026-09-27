"use client";

import {useForm} from "@mantine/form";
import {useDisclosure} from "@mantine/hooks";
import {useRouter} from "next/navigation";
import {DeletePostModal} from "@/app/ui/admin/DeletePostModal";
import {zod4Resolver} from "mantine-form-zod-resolver";
import {Button, Group, Input, MultiSelect, Paper, Stack, TextInput, Title} from "@mantine/core";
import {createNewPostAction, deletePostAction, savePostAction} from "@/lib/actions/post-actions";
import {CreatePostSchema} from "@/lib/schemas";
import {SiteTextEditor} from "@/app/ui/admin/SiteTextEditor"
import type {TagDTO} from "@/lib/dal/dto/tags";

interface PostProp {
  id: string;
  title: string;
  slug: string;
  htmlContent: string;
  posterUrl: string | null;
  published: boolean;
  mediaTagId: string[];
}

type Prefill = { title: string; message: string; mediaTagId: number };

export function PostForm({
  post,
  prefill,
  mediaTags,
}: {
  post?: PostProp | null;
  prefill ?: Prefill;
  mediaTags: TagDTO[];
}) {

  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const isEditMode = !!post;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: post?.title || prefill?.title || "",
      slug: post?.slug || "",
      mediaTagId: post?.mediaTagId ? post.mediaTagId :prefill?.mediaTagId ? [String(prefill?.mediaTagId)] : [],
      posterUrl: post?.posterUrl ?? null,
      imageUrls: [],
      pageContent: post?.htmlContent || (prefill?.message ? "<p>" + prefill.message + "</p>" : ""),
    },
    validate: zod4Resolver(CreatePostSchema),
  });

  const handleSubmit= async (action: "publish" | "draft" | "save") => {
    console.log("handleSubmit called with:", action);
    const { hasErrors, errors } = form.validate();
    
    if (hasErrors){ 
        console.log("validation errors:", hasErrors);
        console.log("hasErrors:", hasErrors);
        console.log("errors:", errors);
        console.log("form values:", form.getValues());
        return;
    }
    const values = form.getValues();

    if (isEditMode && post) {
      const isPublishing = action === "publish" ? true : post.published;

      const { error, success } = await savePostAction(
        post.id,
        values.title,
        values.slug,
        values.pageContent, 
        isPublishing,
        values.posterUrl ? values.posterUrl : null,
        values.mediaTagId);

      if(!success) {
        console.log(error);
        return;
      }

      router.push('/dashboard/posts');

    } else {
      const isPublishing = action === "publish";
      await createNewPostAction({...values, published: isPublishing });
      router.push('/dashboard/posts');
    }
  };

  const handleDeleteConfirm = async () => {
    if (isEditMode && post) {
      await deletePostAction(post.id);
    }
    close();
    router.push('/dashboard/posts');
  }

  return (
    <>


    <DeletePostModal 
        opened={opened} 
        onClose={close} 
        onConfirm={handleDeleteConfirm} 
      />

    <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" mih="85vh" display="flex" style={{ flexDirection: 'column' }}>
      <Title order={1} mb="lg">{isEditMode ? "Edit Post" : "Create New Post"}</Title>
      <form>
        <Stack gap="md">
          
          <TextInput label="Post Title" placeholder="Enter the title of your post" key="title" {...form.getInputProps('title')} />

          <Group grow align="flex-start">
            <TextInput label="Slug" placeholder="e.g., my-new-post" key="slug" {...form.getInputProps('slug')} />
            <MultiSelect
              label="Media Type"
              placeholder="Select media type"
              data={mediaTags.map((tag) => ({
                value: String(tag.id),
                label: tag.displayName,
            	}))}
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
                <Button variant="default" onClick={() => {console.log("test"); handleSubmit("save")}}>Save</Button>
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