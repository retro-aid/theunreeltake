"use client";

import { Pagination } from "@mantine/core";
import { useState, useTransition } from "react";

interface ResendTablePaginationControlProps {
  initialHasMore: boolean;
  prevPageAction: () => Promise<boolean>;
  nextPageAction: () => Promise<boolean>;
}

export function ResendTablePaginationControl(
  props: ResendTablePaginationControlProps,
) {
  const [isLoading, startTransition] = useTransition();

  const [endReached, setEndReached] = useState(false);

  const [hasMore, setHasMore] = useState(props.initialHasMore);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(props.initialHasMore ? 2 : 1);

  const handlePageChange = (value: number) =>
    startTransition(async () => {
      if (value < 1) return;

      if (value < currentPage) {
        await props.prevPageAction();

        setCurrentPage(currentPage - 1);

        setHasMore(true);

        return;
      }

      if (value > currentPage && hasMore) {
        const hasMoreAfter = await props.nextPageAction();

        if (!hasMoreAfter && !endReached) setEndReached(true);

        setCurrentPage(currentPage + 1);

        setHasMore(hasMoreAfter);

        if (hasMoreAfter && !endReached) setTotalPages(totalPages + 1);
      }
    });

  return (
    <Pagination
      value={currentPage}
      onChange={handlePageChange}
      total={totalPages}
      disabled={isLoading}
      withPages={false}
    />
  );
}
