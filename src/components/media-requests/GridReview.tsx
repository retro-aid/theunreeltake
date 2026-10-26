"use client";

import { SimpleGrid } from "@mantine/core";
import { RequestCard } from "@/components/media-requests/cards";
import type { RequestDTO } from "@/lib/dal/dto/media-requests";

type GridReviewProps = {
  data: RequestDTO[];
  onReplyAction: (id: string) => void;
  onDeleteAction: (id: string) => void;
};

/**
 * Displays media requests in a responsive grid of {@link RequestCard}s.
 *
 * @remarks
 * Cards handle their own actions now, so the grid just passes the reply and
 * delete callbacks down instead of tracking which card is selected.
 *
 * @param props - The requests to show and the reply/delete callbacks.
 * @returns A responsive grid of media request cards.
 */
export default function GridReview({
  data,
  onReplyAction,
  onDeleteAction,
}: GridReviewProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
      {data.map((item) => (
        <RequestCard
          key={item.id}
          request={item}
          onReplyAction={onReplyAction}
          onDeleteAction={onDeleteAction}
        />
      ))}
    </SimpleGrid>
  );
}
