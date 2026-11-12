"use client";

import React, { use, useState } from "react";
import { Group, Table } from "@mantine/core";
import { ResendTablePaginationControl } from "@/components/email/ResendTablePaginationControl";
import { notifications } from "@mantine/notifications";
import type { UnreelResult } from "@/lib/errors";
import type {
  PaginationInputDTO,
  ResendListResponse,
} from "@/lib/schemas/email/util-schemas";

interface ResendTableContentProps<T extends ResendListResponse> {
  headers: string[];
  limit?: number;
  initialData: Promise<UnreelResult<T>>;
  listAction: (params: PaginationInputDTO) => Promise<UnreelResult<T>>;
  RowElement: React.ComponentType<{ item: T["data"][number] }>;
}

interface TableInnerProps<T extends ResendListResponse> {
  headers: string[];
  RowElement: React.ComponentType<{ item: T["data"][number] }>;
  rows: T["data"];
}

export function ResendTableContent<T extends ResendListResponse>(
  props: ResendTableContentProps<T>,
) {
  const { headers } = props;

  const initialDataResult = use(props.initialData);

  const initialData = initialDataResult.data ?? { has_more: false, data: [] };

  const [currentRows, setCurrentRows] = useState(initialData.data);

  const [currentEdges, setCurrentEdges] = useState<string[]>([
    currentRows[0].id,
    currentRows[currentRows.length - 1].id,
  ]);

  if (initialDataResult.error) return "Failed to load list";

  const getPage = async (method: "next" | "prev") => {
    const response =
      method === "next"
        ? await props.listAction({
            paginateOption: "after",
            after: currentEdges[1],
            limit: props.limit,
          })
        : await props.listAction({
            paginateOption: "before",
            before: currentEdges[0],
            limit: props.limit,
          });

    if (!response.error && response.data) {
      const { has_more, data } = response.data;

      setCurrentRows(data);
      setCurrentEdges([data[0].id, data[data.length - 1].id]);

      return has_more;
    }

    // Show error notification
    notifications.show({
      color: "red",
      message: `${response.error} : ${response.error?.status}`,
      autoClose: 1500,
    });

    return false;
  };

  return (
    <>
      <Table.ScrollContainer minWidth={500} maxHeight={700}>
        <Table verticalSpacing={"xs"} highlightOnHover>
          <TableInner
            headers={headers}
            rows={currentRows}
            RowElement={props.RowElement}
          />
        </Table>
      </Table.ScrollContainer>
      <Group justify="flex-end" mt="md">
        <ResendTablePaginationControl
          initialHasMore={initialData.has_more}
          prevPageAction={async () => getPage("prev")}
          nextPageAction={async () => getPage("next")}
        />
      </Group>
    </>
  );
}

function TableInner<T extends ResendListResponse>(props: TableInnerProps<T>) {
  const { headers, rows, RowElement } = props;

  const renderedRows = rows.map((rowItem, index) => (
    <RowElement key={index} item={rowItem} />
  ));

  const renderedHeaders = headers.map((header, index) => (
    <Table.Th key={index}>{header}</Table.Th>
  ));

  return (
    <>
      <Table.Thead>
        <Table.Tr>{renderedHeaders}</Table.Tr>
      </Table.Thead>
      <Table.Tbody>{renderedRows}</Table.Tbody>
    </>
  );
}
