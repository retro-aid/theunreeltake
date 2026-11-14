"use client";

import { Table } from "@mantine/core";
import { SubscriberListItemOutputDTO } from "@/lib/schemas/email/subscriber-schemas";

export function SubscribersMailingListTable({
  data,
}: {
  data: SubscriberListItemOutputDTO[];
}) {
  const rows = data.map((subscriber, index) => (
    <Table.Tr key={index}>
      <Table.Td>{`${subscriber.first_name} ${subscriber.last_name}`}</Table.Td>
      <Table.Td>{subscriber.email}</Table.Td>
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
