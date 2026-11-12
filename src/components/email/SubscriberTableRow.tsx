"use client";

import dayjs from "dayjs";
import type { SubscriberListItemOutputDTO } from "@/lib/schemas/email/subscriber-schemas";
import { remove as removeSubscriber } from "@/lib/actions/email/subscribers-actions";
import { usePathname } from "next/navigation";
import { ActionIcon, ThemeIcon, Table } from "@mantine/core";
import { Check, Trash, X } from "react-bootstrap-icons";
import { notifications } from "@mantine/notifications";

/**
 * The props interface for this component
 */
interface SubscriberTableRowProps {
  item: SubscriberListItemOutputDTO;
}

/**
 * Renders a singular table row in the subscribers table
 *
 * @param props - The properties for this component
 * @param props.subscriber - The subscriber object that will be rendered for this row
 */
export function SubscriberTableRow(props: SubscriberTableRowProps) {
  const pathname = usePathname();

  const { id, first_name, last_name, email, created_at, unsubscribed } =
    props.item;

  const subscribed_date = dayjs(created_at).format("MMM DD, YYYY");
  const status = unsubscribed ? <X size={16} /> : <Check size={16} />;

  const handleDeleteAction = async () => {
    const { error, data } = await removeSubscriber({ id }, pathname);

    const color = error ? "red" : "green";
    const message = error ? error.message : `${data.contact} deleted!`;

    notifications.show({
      color: color,
      message: message,
      autoClose: 1500,
    });
  };

  return (
    <Table.Tr>
      <Table.Td>{`${first_name} ${last_name}`}</Table.Td>
      <Table.Td>{email}</Table.Td>
      <Table.Td>{subscribed_date}</Table.Td>
      <Table.Td>
        <ThemeIcon
          color={unsubscribed ? "red" : "green"}
          variant={"light"}
          radius="sm"
        >
          {status}
        </ThemeIcon>
      </Table.Td>
      <Table.Td>
        <ActionIcon
          color={"red"}
          variant={"filled"}
          size={"md"}
          radius={"sm"}
          onClick={handleDeleteAction}
          title={"Delete Subscriber"}
        >
          <Trash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}
