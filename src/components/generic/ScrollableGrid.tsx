"use client";
/**
 * URT 388 changes: create a ScrollableGrid that would be used for PostGrid and AdminCommentGrid
 * Grabbing the common things from both tsx and paste it here so that both Grid can be scrollable
 */
import React, { useRef, useState, useMemo } from "react";
import { Group, Pagination, ScrollArea, Stack, Grid } from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  ActionButtons,
  ActionMenuOption,
} from "@/components/generic/ActionButtons";

export function chunkData<T>(array: T[], chunkSize: number): T[][] {
  if (!array.length) return [];
  const head = array.slice(0, chunkSize);
  const tail = array.slice(chunkSize);
  return [head, ...chunkData(tail, chunkSize)];
}

export type SortFunction<T> = (items: T[], sortValue: string) => T[];

export interface ScrollableGridProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  pageSize?: number;
  height?: number | string;
  layout?: "stack" | "grid";
  gridColProps?: {
    span?: any;
    style?: React.CSSProperties;
  };
  sortOptions?: ActionMenuOption[];
  onSort?: SortFunction<T>;
  onRefresh?: () => void;
  showActions?: boolean;
}

/**
 * URT388 chagnge:
 * Generic reusable viewport component providing scrolling, pagination, sorting,
 * and flexible layouts.
 *
 * @remarks
 * Stored in `/lib/components/generic/ScrollableGrid.tsx` and exported as a shared component
 * across the application (e.g., used by Posts and Admin Comments pages).
 *
 * @typeParam T - The entity data type rendered by the grid.
 * @param props - Configuration props defined in {@link ScrollableGridProps}.
 * @returns A scrollable container with optional sorting and pagination controls.
 */

export function ScrollableGrid<T>({
  data,
  renderItem,
  keyExtractor,
  pageSize = 5,
  height = 700,
  layout = "stack",
  gridColProps,
  sortOptions,
  onSort,
  onRefresh,
  showActions = true,
}: ScrollableGridProps<T>) {
  const router = useRouter();
  const viewport = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("");

  const processedData = useMemo(() => {
    if (sort && onSort) {
      return onSort(data, sort);
    }
    return data;
  }, [data, sort, onSort]);

  const chunkedData = useMemo(
    () => (pageSize > 0 ? chunkData(processedData, pageSize) : [processedData]),
    [processedData, pageSize],
  );

  const currentPageItems = chunkedData[page - 1] ?? [];

  const scrollToTop = () => {
    viewport.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollToTop();
  };

  const handleRefresh = onRefresh ?? (() => router.refresh());

  return (
    <>
      {showActions && (sortOptions || onRefresh) && (
        <Group mb="md" justify="flex-end">
          <ActionButtons
            sort={
              sortOptions
                ? {
                    label: "Sort By",
                    options: sortOptions,
                    onSelect: handleSort,
                  }
                : undefined
            }
            onRefreshAction={handleRefresh}
          />
        </Group>
      )}

      <ScrollArea
        bd="1px solid gray.3"
        bg="gray.0"
        p="lg"
        bdrs="md"
        h={height}
        viewportRef={viewport}
      >
        {layout === "stack" ? (
          <Stack>
            {currentPageItems.map((item) => (
              <React.Fragment key={keyExtractor(item)}>
                {renderItem(item)}
              </React.Fragment>
            ))}
          </Stack>
        ) : (
          <Grid>
            {currentPageItems.map((item) => (
              <Grid.Col
                key={keyExtractor(item)}
                span={gridColProps?.span ?? { base: 12, sm: 6, md: 3 }}
                style={gridColProps?.style}
              >
                {renderItem(item)}
              </Grid.Col>
            ))}
          </Grid>
        )}
      </ScrollArea>

      {pageSize > 0 && chunkedData.length > 1 && (
        <Pagination
          total={chunkedData.length}
          value={page}
          onChange={handlePageChange}
          siblings={1}
          py="lg"
        />
      )}
    </>
  );
}
