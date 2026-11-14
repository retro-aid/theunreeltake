"use client";

import { ActionIcon, Table } from "@mantine/core";
import { SubscriberListItemOutputDTO } from "@/lib/schemas/email/subscriber-schemas";
import { X } from "react-bootstrap-icons";
import { removeSubscriber } from "@/lib/actions/email/mailing-lists-actions";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

export function SubscribersMailingListTable({
  data,
  segmentId,
}: {
  data: SubscriberListItemOutputDTO[];
  segmentId: string;
}) {

  const handleRemove = async (id: string) => {

    const { error, data } = await removeSubscriber({
      contactId: id,
      segmentId: segmentId
    });

    const color = error ? "red" : "green";
    const message = error
      ? error.message
      : `${data.id} removed from list!`;

    notifications.show({
      color: color,
      message: message,
      autoClose: 5000,
    });

    modals.closeAll();
  }

  const rows = data.map((subscriber, index) => (
    <Table.Tr key={index}>
      <Table.Td>{`${subscriber.first_name} ${subscriber.last_name}`}</Table.Td>
      <Table.Td>{subscriber.email}</Table.Td>
      <Table.Td>
        <ActionIcon
          color={"red"}
          size={"sm"}
          variant={"outline"}
          title={"Remove"}
          onClick={async () => await handleRemove(subscriber.id)}
        >
          <X />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Email</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
