"use client";

import { MailingListItemOutputDTO } from "@/lib/schemas/email/mailing-lists-schemas";
import { ActionIcon, Group, Table, Tooltip } from "@mantine/core";
import { People, Trash } from "react-bootstrap-icons";
import dayjs from "dayjs";
import { modals } from "@mantine/modals";
import { MailingListSubscribersForm } from "@/components/email/MailingListSubscribersForm";

interface MailingListTableRowProps {
  item: MailingListItemOutputDTO;
}

export function MailingListTableRow(props: MailingListTableRowProps) {
  const { name, created_at, id } = props.item;

  const openSubscribersModal = () =>
    modals.open({
      title: "Subscribers for this mailing list",
      children: <MailingListSubscribersForm segmentId={id} />,
    });

  return (
    <Table.Tr>
      <Table.Td>{name}</Table.Td>
      <Table.Td>{dayjs(created_at).format("MMM DD, YYYY")}</Table.Td>
      <Table.Td w={150}>
        <Group gap={"sm"}>
          <Tooltip label={"View Subscribers"} position={"bottom"} withArrow>
            <ActionIcon color={"indigo"} onClick={openSubscribersModal}>
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
