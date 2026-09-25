"use client";

import {useForm} from "@mantine/form";
import {useDisclosure} from "@mantine/hooks";
import {useRouter} from "next/navigation";
import {DeletePostModal} from "@/app/ui/admin/DeletePostModal";
import {zod4Resolver} from "mantine-form-zod-resolver";
import {Button, Checkbox, Group, Input, Paper, Stack, TextInput, Title} from "@mantine/core";
import {SiteTextEditor} from "@/app/ui/admin/SiteTextEditor"
import { CreatePostTemplateSchema } from "@/lib/schemas/template-schemas";
import { createPostTemplateAction, deletePostTemplateAction, updatePostTemplateAction } from "@/lib/actions/template-actions";

interface TemplateProp {
  id: string;
  title: string;
  description: string;
  htmlContent: string;
  isPublic: boolean;
}

type Prefill = { title: string; description: string; htmlContent: string; isPublic: boolean; };

export function TemplateForm({ template, prefill }: { template?: TemplateProp | null; prefill?: Prefill }) {

  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const isEditMode = !!template;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: template?.title || prefill?.title || "",
      description: template?.description || prefill?.title || "",
      pageContent: template?.htmlContent || (prefill?.htmlContent ? "<p>" + prefill.htmlContent + "</p>" : ""),
      isPublic: template?.isPublic || prefill?.isPublic || false
    },
    validate: zod4Resolver(CreatePostTemplateSchema),
  });

  const handleSubmit= async (action: "publish" | "draft" | "save") => {
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    const values = form.getValues();

    if (isEditMode && template) {

      const { error, success } = await updatePostTemplateAction(
        template.id,
        values.title,
        values.description,
        values.pageContent,
        values.isPublic);

      if(!success) {
        console.log(error);
        return;
      }

      router.push('/dashboard/templates');

    } else {
      await createPostTemplateAction(values.title, values.description, values.pageContent, values.isPublic);
      router.push('/dashboard/templates');
    }
  };

  const handleDeleteConfirm = async () => {
    if (isEditMode && template) {
      await deletePostTemplateAction(template.id);
    }
    close();
    router.push('/dashboard/templates');
  }

  return (
    <>


    <DeletePostModal 
        opened={opened} 
        onClose={close} 
        onConfirm={handleDeleteConfirm} 
      />

    <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" mih="85vh" display="flex" style={{ flexDirection: 'column' }}>
      <Title order={1} mb="lg">{isEditMode ? "Edit Template" : "Create New Template"}</Title>

      <form>
        <Stack gap="md">
          
          <TextInput label="Template Title" placeholder="Enter the title of your template" key="title" {...form.getInputProps('title')} />

           <TextInput label="Template Description" placeholder="Enter the description of your template" key="description" 
           {...form.getInputProps('description')} />

          <Input.Wrapper label="Page Content" error={form.errors.pageContent}>
            <SiteTextEditor value={form.getInputProps('pageContent').defaultValue} onChange={form.getInputProps('pageContent').onChange} />
          </Input.Wrapper>

          <Group justify="flex-end" mt="md">
            {!isEditMode && (
              <>
                <Button color="red" onClick={open}>Discard</Button>
                <Checkbox
                  label="Make Public?"
                  key= 'isPublic'
                  {...form.getInputProps('isPublic', { type: 'checkbox' })}
                />
                <Button color="dark" onClick={() => handleSubmit("publish")}>Save</Button>
              </>
            )}
            {isEditMode && template && (
              <>
                <Button color="red" onClick={open}>Delete</Button>
                <Checkbox
                  label="Make Public?"
                  key= 'isPublic'
                  {...form.getInputProps('isPublic', { type: 'checkbox' })}
                />
                <Button variant="default" onClick={() => handleSubmit("save")}>Save</Button>
              </>
            )}
          </Group>
        </Stack>
      </form>
    </Paper>
    </>
  );
}