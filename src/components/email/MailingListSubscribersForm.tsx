"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "@mantine/form";
import {
  ContactToMailingListInputDTO,
  ContactToMailingListInputSchema,
} from "@/lib/schemas/email/mailing-lists-schemas";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { SubscribersMailingListTable } from "@/components/email/SubscribersMailingListTable";
import { Button, Group, Loader, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  listSubscribers,
  addSubscriber,
} from "@/lib/actions/email/mailing-lists-actions";
import { SubscriberListItemOutputDTO } from "@/lib/schemas/email/subscriber-schemas";
import { list } from "@/lib/actions/email/subscribers-actions";
import { modals } from "@mantine/modals";

interface MailingListSubscribersFormProps {
  segmentId: string;
}

export function MailingListSubscribersForm(
  props: MailingListSubscribersFormProps,
) {
  const [isLoading, startTransition] = useTransition();

  const [subscribers, setSubscribers] = useState<SubscriberListItemOutputDTO[]>(
    [],
  );
  const [subscribersOnMailingList, setSubscribersOnMailingList] = useState<
    SubscriberListItemOutputDTO[]
  >([]);

  useEffect(
    () =>
      startTransition(async () => {
        const subscribersResponse = await list({
          paginateOption: "none",
          limit: 100,
        });

        if (subscribersResponse.error || !subscribersResponse.data) {
          notifications.show({
            color: "red",
            message: `${subscribersResponse.error.message} : ${subscribersResponse.error.status}`,
          });
          return;
        }

        setSubscribers(subscribersResponse.data.data);

        const { error, data } = await listSubscribers({
          segmentId: props.segmentId,
          paginateOption: "none",
          limit: 100,
        });

        if (error || !data) {
          notifications.show({
            color: "red",
            message: `${error.message} : ${error.status}`,
          });
          return;
        }

        setSubscribersOnMailingList(data.data);
      }),
    [props.segmentId],
  );

  const initialValues: ContactToMailingListInputDTO = {
    contactId: "",
    segmentId: props.segmentId,
  };

  const form = useForm({
    mode: "uncontrolled",
    initialValues: initialValues,
    validate: zod4Resolver(ContactToMailingListInputSchema),
  });

  const selectionData = subscribers.map((subscriber) => ({
    value: subscriber.id,
    label: subscriber.email,
  }));

  const handleSubmit = async (formData: ContactToMailingListInputDTO) => {
    const { error, data } = await addSubscriber(formData);

    const color = error ? "red" : "green";
    const message = error
      ? error.message
      : `${data.id} added to list ${formData.segmentId}!`;

    notifications.show({
      color: color,
      message: message,
      autoClose: 5000,
    });

    modals.closeAll();
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group align={"start"} my={"md"}>
          <Select
            searchable
            data={selectionData}
            flex={1}
            key={"contactId"}
            {...form.getInputProps("contactId")}
          />
          <Button variant={"outline"} type={"submit"} loading={form.submitting}>
            Add
          </Button>
        </Group>
      </form>
      <SubscribersMailingListTable
        data={subscribersOnMailingList}
        segmentId={props.segmentId}
      />
    </>
  );
}
