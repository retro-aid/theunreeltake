import { Paper, Group, Title } from "@mantine/core";
import { ResendTableContent } from "@/components/email/ResendTableContent";
import React, { Suspense } from "react";
import { ResendTableSkeleton } from "@/components/email/ResendTableSkeleton";
import { CreateSubscriberModal } from "@/components/email/CreateSubscriberModal";
import type {
  PaginationInputDTO,
  ResendListResponse,
} from "@/lib/schemas/email/util-schemas";
import { UnreelResult } from "@/lib/errors";

interface AsyncResendTableProps<T extends ResendListResponse> {
  title?: string | undefined;
  rowLimit?: number | undefined;
  headers: string[];
  listAction: (params: PaginationInputDTO) => Promise<UnreelResult<T>>;
  RowElement: React.ComponentType<{ item: T["data"][number] }>;
}

/**
 * Represents an asynchronous table that displays any resend list
 *
 * @author Aidan Anderson
 *
 * @param props The props that this component accepts
 * @param props.title The title of the table
 * @param props.rowLimit The number of rows to render per page
 * @param props.headers A list of headers to display for each column, in order
 * @param props.listAction The asynchronous action to perform upon page navigation or initial load
 * @param props.RowElement The JSX element to render for each row in the table
 */
export default function AsyncResendTable<T extends ResendListResponse>(
  props: AsyncResendTableProps<T>,
) {
  const {
    title = "Table",
    rowLimit = 10,
    headers,
    listAction,
    RowElement,
  } = props;

  const totalCols = headers.length;

  const initialListPromise = listAction({
    paginateOption: "none",
    limit: rowLimit,
  });

  return (
    <Paper withBorder radius="md" p={"xl"} shadow="xs" miw={550} maw={1000}>
      <Group justify="space-between" align="center" pb={"md"}>
        <Title order={2} p={0}>
          {title}
        </Title>
        <CreateSubscriberModal />
      </Group>

      <Suspense
        fallback={<ResendTableSkeleton rows={rowLimit} cols={totalCols} />}
      >
        <ResendTableContent
          limit={rowLimit}
          initialData={initialListPromise}
          headers={headers}
          listAction={listAction}
          RowElement={RowElement}
        />
      </Suspense>
    </Paper>
  );
}
