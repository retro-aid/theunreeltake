import {
  Group,
  Pagination,
  Skeleton,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

export function ResendTableSkeleton({
  rows,
  cols,
}: {
  rows: number;
  cols: number;
}) {
  const renderedCols = Array.from({ length: cols }, (_, i) => (
    <TableTh key={i}>
      <Skeleton height={24} miw={50} maw={250} radius={"sm"} />
    </TableTh>
  ));

  const renderedRows = Array.from({ length: rows }, (_, i) => (
    <TableTr key={i}>
      <TableTd colSpan={cols}>
        <Skeleton height={24} radius={"sm"} />
      </TableTd>
    </TableTr>
  ));

  return (
    <>
      <Table verticalSpacing={"sm"} horizontalSpacing={"md"}>
        <TableThead>
          <TableTr>{renderedCols}</TableTr>
        </TableThead>
        <TableTbody>{renderedRows}</TableTbody>
      </Table>
      <Group justify={"flex-end"} mt={"md"}>
        <Pagination total={1} disabled withPages={false} />
      </Group>
    </>
  );
}
