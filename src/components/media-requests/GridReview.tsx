"use client";

import { Title, Stack, Paper, SimpleGrid, Text } from "@mantine/core";
import { RequestDTO } from "@/lib/dal/dto/media-requests";

type GridReviewProps = {
  data: RequestDTO[];
  selectedId?: string;
  onSelectAction?: (id: string) => void;
};
/**
 * Displays media requests in a responsive grid of selectable cards.
 *
 * Each card shows the request title, requester name, email address, and
 * message. Requests without a name are labeled as anonymous. The currently
 * selected request is visually highlighted, and clicking a card gives
 * the optional selection callback.
 *
 * @param props - The data and selection properties used to render the grid.
 * @param props.data - The media requests to display.
 * @param props.selectedId - The id of the currently selected request.
 * @param props.onSelectAction - Callback invoked when a request card is clicked.
 * @returns A responsive grid of media-request cards.
 */
export default function GridReview({
  data,
  selectedId,
  onSelectAction,
}: GridReviewProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
      {data.map((item) => {
        const isSelected = item.id === selectedId;

        return (
          <Paper
            key={item.id}
            withBorder
            radius="md"
            p="md"
            onClick={() => onSelectAction?.(item.id)}
            style={{
              cursor: "pointer",
              backgroundColor: isSelected ? "#e7e6e6" : "white",
              transition: "0.2s ease",
            }}
          >
            <Stack gap={4}>
              <Title order={4}>{item.title}</Title>
              <Text size="xs" c="dimmed">
                Requested By: {item.name ?? "Anonymous"}
              </Text>
              <Text size="xs" c="dimmed">
                Email: {item.email}
              </Text>

              <Text size="sm" mt="xs">
                {item.message}
              </Text>
            </Stack>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
