"use client";

import { Loader, Table } from "@mantine/core";
import { useState, useTransition } from "react";
import { MailingListDetailOutputDTO } from "@/lib/schemas/email/mailing-lists-schemas";
import { get } from "@/lib/actions/email/mailing-lists-actions";
import { MailSubRow } from "./MailingSubRow";

/**
 *
 * @param param0 Takes in a specific MailingListDetailOutputDTO (Mailing List + Subs)
 * @returns The modal for handling the display of each subscriber in a Mailing List as its own table
 */
export function SubTableModal({
  MailingList,
}: {
  MailingList: MailingListDetailOutputDTO;
}) {
  const subRows = MailingList.subscribers.map((item) => (
    <MailSubRow key={item.id} Subscriber={item} MailId={MailingList.id} />
  ));
  return (
    <Table highlightOnHover verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>First Name</Table.Th>
          <Table.Th>Last Name</Table.Th>
          <Table.Th>Email</Table.Th>
          <Table.Th>Currently Subscribed</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{subRows}</Table.Tbody>
    </Table>
  );
}
