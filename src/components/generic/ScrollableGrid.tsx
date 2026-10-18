"use client";

/**
 * removed the URT388 changes to now include the new URT-429 changes
 */
import React, { useRef, useState, useMemo } from "react";
import {
  Group,
  Pagination,
  ScrollArea,
  Stack,
  Grid,
  Text,
} from "@mantine/core";
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
  headerLeft?: React.ReactNode;
}

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
  headerLeft,
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

  /**
   * URT-419 changes: apply the changes like the search bar going to the left 
   *  - puts the logos on the left together in the same row
   *  - functions is not affected
   *  - also included on the bottom left the page "1 of 6" example
   */
  return (
    <>
      {showActions && (sortOptions || onRefresh || headerLeft) && (
        <Group mb="md" justify="space-between" align="center" wrap="nowrap">
          {/* Left: Search Bar */}
          {headerLeft && (
            <div style={{ width: 500, maxWidth: "100%" }}>{headerLeft}</div>
          )}

          {/* Right: Sort and Refresh clustered tightly together */}
          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            {(sortOptions || onRefresh) && (
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
            )}
          </Group>
        </Group>
      )}

      <ScrollArea
        bd="1px solid gray.3"
        bg="gray.0"
        p="lg"
        bdrs="md"
        h={height}
        viewportRef={viewport}
        styles={{
          viewport: { paddingRight: "10px" },
        }}
      >
        {layout === "stack" ? (
          <Stack gap="md">
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
        <Group justify="space-between" align="center" pt="lg">
          <Text size="sm" c="dimmed">
            Page {page} of {chunkedData.length}
          </Text>
          <Pagination
            total={chunkedData.length}
            value={page}
            onChange={handlePageChange}
            siblings={1}
            size="sm"
            radius="sm"
          />
        </Group>
      )}
    </>
  );
}
