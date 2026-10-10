"use client";

import { Title, Stack, Paper, SimpleGrid, Text } from "@mantine/core";
import { RequestDTO } from "@/lib/dal/dto/requests";

//Props for component
type GridReviewProps = {
  data: RequestDTO[];
  selectedId?: string;
  onSelectAction?: (id: string) => void;
};

//Displays Requests in a responsive grid
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
            // Select the request when the card is clicked
            onClick={() => onSelectAction?.(item.id)}
            style={{
              cursor: "pointer",
              backgroundColor: isSelected ? "#e7e6e6" : "white",
              transition: "0.2s ease",
            }}
          >
            <Stack gap={4}>
              <Title order={4}>{item.title}</Title>
              {/*Email if given, otherwise resort to anoymous*/}
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
