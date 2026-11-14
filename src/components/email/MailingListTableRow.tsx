"use client";

import { MailingListItemOutputDTO } from "@/lib/schemas/email/mailing-lists-schemas";
import { ActionIcon, Group, Table, Title, Tooltip } from "@mantine/core";
import { People, Trash } from "react-bootstrap-icons";
import dayjs from "dayjs";
import { modals } from "@mantine/modals";
import { MailingListSubscribersForm } from "@/components/email/MailingListSubscribersForm";
import { remove } from "@/lib/actions/email/mailing-lists-actions";
import { notifications } from "@mantine/notifications";

interface MailingListTableRowProps {
  item: MailingListItemOutputDTO;
}

export function MailingListTableRow(props: MailingListTableRowProps) {
  const { name, created_at, id } = props.item;

  const openSubscribersModal = () =>
    modals.open({
      title: <Title order={4}>Subscribers For This List:</Title>,
      children: <MailingListSubscribersForm segmentId={id} />,
    });

  const handleRemove = async () => {

    const { error, data } = await remove(id);

    const color = error ? "red" : "green";
    const message = error
      ? error.message
      : `Deleted mailing list ${data.id}`;

    notifications.show({
      color: color,
      message: message,
      autoClose: 5000,
    });

    modals.closeAll();
  }

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
            <ActionIcon color={"red"} onClick={handleRemove}>
              <Trash />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
