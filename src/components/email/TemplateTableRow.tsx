"use client";

import { ActionIcon, Badge, Group, Table, Tooltip } from "@mantine/core";
import type { ListTemplatesResponseSuccess } from "resend";
import dayjs from "dayjs";
import { remove as removeTemplate } from "@/lib/actions/email/templates-actions";
import { notifications } from "@mantine/notifications";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import { useRouter } from "next/navigation";

interface TemplateTableRowProps {
  item: ListTemplatesResponseSuccess["data"][number];
}

export function TemplateTableRow(props: TemplateTableRowProps) {
  const router = useRouter();

  const { id, name, status, updated_at } = props.item;

  const handleDeleteAction = async () => {
    const delay = 2000;

    const { error, data } = await removeTemplate(id);

    if (!error) {
      setTimeout(() => {
        window.location.reload();
      }, delay);
    }

    const color = error ? "red" : "green";
    const message = error ? error.message : `${data.id} deleted!`;

    notifications.show({
      color: color,
      message: message,
      autoClose: delay,
    });
  };

  return (
    <Table.Tr>
      <Table.Td>{name}</Table.Td>
      <Table.Td>{dayjs(updated_at).format("MMM DD, YYYY")}</Table.Td>
      <Table.Td>
        <Badge color={status === "draft" ? "orange" : "green"}>{status}</Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={"sm"}>
          <Tooltip label={"Edit Template"} position={"bottom"} withArrow>
            <ActionIcon
              color={"black"}
              variant={"filled"}
              size={"md"}
              radius={"sm"}
              onClick={() =>
                router.push(`/dashboard/email/templates/${id}/edit`)
              }
            >
              <PencilSquare size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={"Delete Template"} position={"bottom"} withArrow>
            <ActionIcon
              color={"red"}
              variant={"filled"}
              size={"md"}
              radius={"sm"}
              onClick={handleDeleteAction}
            >
              <Trash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
