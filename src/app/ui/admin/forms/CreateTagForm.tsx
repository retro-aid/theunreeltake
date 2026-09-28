"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { CreateTagFom, CreateTagSchema } from "@/lib/schemas";
import { createTag } from "@/lib/actions";
import { AllowedTagType } from "@/lib/constants";
import { Button, Group, Select, TextInput } from "@mantine/core";
import { PlusLg } from "react-bootstrap-icons";

export default function CreateTagForm() {
  const createTagForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      type: AllowedTagType.Category,
    },
    validate: zod4Resolver(CreateTagSchema),
    onSubmitPreventDefault: "always",
  });

  const handleSubmit = async (formData: CreateTagFom) => {
    const { error, success } = await createTag(formData);

    if (!success) console.log(error);

    createTagForm.reset();
  };

  return (
    <form
      onSubmit={createTagForm.onSubmit(handleSubmit)}
      onReset={createTagForm.reset}
    >
      <Group align={"start"}>
        <TextInput
          label={"Display Name"}
          miw={250}
          key={createTagForm.key("name")}
          {...createTagForm.getInputProps("name")}
        />

        <Select
          label={"Tag Type"}
          miw={250}
          key={createTagForm.key("type")}
          data={Object.values(AllowedTagType)}
          allowDeselect={false}
          {...createTagForm.getInputProps("type")}
        />

        <Group my={24}>
          <Button leftSection={<PlusLg />} type={"submit"} miw={90}>
            Add
          </Button>

          {createTagForm.isDirty() ? (
            <Button type={"reset"} miw={90}>
              Clear
            </Button>
          ) : null}
        </Group>
      </Group>
    </form>
  );
}
