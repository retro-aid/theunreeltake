"use client";

import {
  Text,
  Group,
  ActionIcon,
  Badge,
  Button,
  TableData,
  Modal,
  Stack,
  Title,
  Table,
  Pagination,
} from "@mantine/core";
import * as templates from "@/lib/actions/email/templates-actions";
import { useState } from "react";
import Link from "next/link";
import { PencilSquare, Trash, PlusSquare, PlusLg } from "react-bootstrap-icons";
import { useDisclosure } from "@mantine/hooks";

/**
 * Displays the table of email templates
 *
 * @params Takes the list (Template Summary) of email templates and put it in an array (EmailGridProps) to display it.
 * @returns The table component of Email Templates
 */
type TemplateSummary = NonNullable<
  Awaited<ReturnType<typeof templates.list>>["data"]
>[number];
type EmailGridProps = { data: TemplateSummary[] };
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const PAGE_SIZE = 10;

export function EmailTemplateTable({ data }: EmailGridProps) {
  const [opened, { open, close }] = useDisclosure();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length/PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = data.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const handleDelete = async (id: string) => {
    const { error } = await templates.remove(id); // revalidates the list

    if (error) {
      console.log(error);
    }
  };

  const tableData: TableData = {
    head: ["Name", "Status", "Last Updated", "Actions"],
    body: pageRows.map((template) => {
      const isPublished = template.status === "published";

      const statusColumn = (
        <Badge color={isPublished ? "green" : "red"} variant="filled">
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );

      const actionButtons = (
        <Group>
          <ActionIcon
            color="blue"
            component={Link}
            href={`/dashboard/email/templates/${template.id}/edit`}
          >
            <PencilSquare />
          </ActionIcon>
          <ActionIcon
            color="red"
            onClick={() => {
              open();
              setSelectedTemplateId(template.id);
            }}
          >
            <Trash />
          </ActionIcon>
        </Group>
      );
      return [
        template.name,
        statusColumn,
        template.updated_at ? formatDate(template.updated_at) : "-",
        actionButtons,
      ];
    }),
  };
  return (
    <>
      <Modal
        title={
          <Stack gap={0}>
            <Title order={4}>
              Are you sure you want to delete this template?
            </Title>
            <Text size="sm">This action cannot be undone</Text>
          </Stack>
        }
        opened={opened}
        onClose={close}
      >
        <Group justify="center">
          <Button
            color="red"
            onClick={async () => {
              close();
              await handleDelete(selectedTemplateId);
            }}
          >
            Yes, Delete
          </Button>
          <Button variant="default" onClick={close}>
            No, Keep
          </Button>
        </Group>
      </Modal>

      
      <Table data={tableData} withRowBorders highlightOnHover maw={900} />
      <Button
      leftSection={<PlusLg />}
      component={Link}
      href={`/dashboard/email/templates/create`}>
      Add
      </Button>

      {totalPages > 1 || (
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={setPage}
          color={"gray"}
          mt="md"
          />
      )}

      {data.length === 0 && (
        <Text c="dimmed" ta="center" mt="md">
          No email templates yet. Use "New Template" to create one.
        </Text>
      )}
    </>
  );
}
