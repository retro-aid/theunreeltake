"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  type CreateTagForm as CreateTagFormValues,
  CreateTagSchema,
} from "@/lib/schemas/tag-schemas";
import { createTagAction } from "@/lib/actions/tag-actions";
import { AllowedTagType } from "@/lib/constants";
import { Button, Group, Select, TextInput } from "@mantine/core";
import { PlusLg } from "react-bootstrap-icons";

export function CreateTagForm() {
  const createTagForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      type: AllowedTagType.Category,
    },
    validate: zod4Resolver(CreateTagSchema),
    onSubmitPreventDefault: "always",
  });

  const handleSubmit = async (formData: CreateTagFormValues) => {
    const { error, success } = await createTagAction(formData);

    if (!success) console.log(error);

    createTagForm.reset();
  };
  /**
   * URT 386 changed:
   * Added input description for "Display Name" and "Tag Type"
   *
   * @remarks
   * the description from <Text Input> is part of "@mantine/core"
   *
   * @returns
   * returns the same layout but with now the input description added for better user experience
   */
  return (
    <form
      onSubmit={createTagForm.onSubmit(handleSubmit)}
      onReset={createTagForm.reset}
    >
      <Group align={"start"}>
        <TextInput
          label={"Display Name"}
          description="Tag name would be visible to everyone"
          miw={250}
          key={createTagForm.key("name")}
          {...createTagForm.getInputProps("name")}
        />

        <Select
          label={"Tag Type"}
          miw={250}
          description="Choose which tag category it is"
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
