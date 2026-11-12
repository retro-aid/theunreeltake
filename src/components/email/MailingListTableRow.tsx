"use client";

import { MailingListOutputDTO } from "@/lib/schemas/email/mailing-lists-schemas";
import { ActionIcon, Group, Table, Tooltip } from "@mantine/core";
import { People, Trash } from "react-bootstrap-icons";

interface MailingListTableRowProps {
  item: MailingListOutputDTO;
}

export function MailingListTableRow(props: MailingListTableRowProps) {
  const { name } = props.item;

  return (
    <Table.Tr>
      <Table.Td>{`${name}`}</Table.Td>
      <Table.Td w={150}>
        <Group gap={"sm"}>
          <Tooltip label={"View Members"} position={"bottom"} withArrow>
            <ActionIcon color={"indigo"}>
              <People />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={"Delete"} position={"bottom"} withArrow>
            <ActionIcon color={"red"}>
              <Trash />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
