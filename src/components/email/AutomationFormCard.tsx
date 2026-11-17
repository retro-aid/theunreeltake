"use client";

import {
  AutomationInputSchema,
  AutomationOutputDTO,
} from "@/lib/schemas/email/automations-schemas";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  ActionIcon,
  Card,
  Grid,
  GridCol,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  Tooltip,
} from "@mantine/core";
import { Floppy, X } from "react-bootstrap-icons";
import { notifications } from "@mantine/notifications";
import { update as updateAutomation } from "@/lib/actions/email/automations-actions";

interface AutomationFormCardProps {
  item: AutomationOutputDTO;
}

export function AutomationFormCard(props: AutomationFormCardProps) {
  const { id, name, event, enabled } = props.item;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      event: event,
      enabled: enabled,
    },
    validate: zod4Resolver(AutomationInputSchema),
  });

  const handleSubmit = async (formData: typeof form.values) => {
    const delay = 5000;

    const { error, data } = await updateAutomation(id, {
      event: formData.event ?? undefined,
      enabled: formData.enabled ?? undefined,
    });

    if (!error) {
      setTimeout(() => {
        window.location.reload();
      }, delay);
    }

    const color = error ? "red" : "green";
    const message = error ? error.message : `${data.id} updated!`;

    notifications.show({
      color: color,
      message: message,
      autoClose: delay,
    });

    form.reset();
  };

  return (
    <Card
      mih={"4.5rem"}
      w={"100%"}
      bd={"1px solid gray.4"}
      bdrs={"md"}
      py={"xs"}
      px={"lg"}
    >
      <form onSubmit={form.onSubmit(handleSubmit)} onReset={form.reset}>
        <Group justify={"space-between"} h={"100%"} align={"center"} gap={0}>
          <Grid columns={12} w={"100%"} columnGap={"md"} rowGap={4} flex={1}>
            <Grid.Col span={4}>
              <Text size={"xs"} fw={"bold"}>
                ID
              </Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size={"xs"} fw={"bold"}>
                Name
              </Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size={"xs"} fw={"bold"}>
                Event Trigger
              </Text>
            </Grid.Col>
            <Grid.Col span={2}>
              <Text size={"xs"} fw={"bold"}>
                Enabled
              </Text>
            </Grid.Col>

            <Grid.Col span={4} align={"center"}>
              <Text size={"md"} truncate={"end"} title={id}>
                {id}
              </Text>
            </Grid.Col>

            <Grid.Col span={3} align={"center"}>
              <Text size={"md"} truncate={"end"} title={name}>
                {name}
              </Text>
            </Grid.Col>

            <Grid.Col span={3} align={"center"}>
              <Select
                key={form.key("event")}
                maw={175}
                size={"xs"}
                allowDeselect
                data={[
                  "unreeltake.new_post",
                  "unreeltake.comment_reply",
                  "unreeltake.request_made",
                ]}
                {...form.getInputProps("event")}
              />
            </Grid.Col>

            <GridCol span={2} align={"center"}>
              <Switch
                key={form.key("enabled")}
                {...form.getInputProps("enabled", { type: "checkbox" })}
              />
            </GridCol>
          </Grid>
          <Stack gap={"0.20rem"} w={22} align={"center"}>
            {form.isDirty() ? (
              <>
                <Tooltip label={"Save Changes"} position={"bottom"} withArrow>
                  <ActionIcon
                    size={"sm"}
                    bdrs={"xs"}
                    color={"green"}
                    type={"submit"}
                    loading={form.submitting}
                  >
                    <Floppy size={14} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip
                  label={"Discard Changes"}
                  position={"bottom"}
                  withArrow
                >
                  <ActionIcon
                    size={"sm"}
                    bdrs={"xs"}
                    color={"red"}
                    type={"reset"}
                    disabled={form.submitting}
                  >
                    <X size={16} />
                  </ActionIcon>
                </Tooltip>
              </>
            ) : null}
          </Stack>
        </Group>
      </form>
    </Card>
  );
}
