"use client";

import { Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import type { RequestDTO } from "@/lib/dal/dto/media-requests";

type RequestDetailsProps = {
  request: RequestDTO | undefined;
  onReply: () => void;
  onDelete: () => void;
};

/**
 * Displays the selected request and its available management actions.
 *
 * @param props - The selected request and action callbacks.
 * @returns The selected request panel.
 */
export default function RequestDetails({
  request,
  onReply,
  onDelete,
}: RequestDetailsProps) {
  return (
    <Paper withBorder radius="md" p="lg" mb="lg">
      {request ? (
        <Stack>
          <Title order={4}>Selected: {request.title}</Title>

          <Text size="sm" c="dimmed">
            {request.message}
          </Text>

          <Group>
            <Button
              size="xs"
              variant="light"
              component={Link}
              href={{
                pathname: "/dashboard/posts/create",
                query: { mrid: request.id },
              }}
            >
              Create Post
            </Button>

            <Button size="xs" variant="light" onClick={onReply}>
              Reply To User
            </Button>

            <Button size="xs" variant="light" color="red" onClick={onDelete}>
              Delete Request
            </Button>
          </Group>
        </Stack>
      ) : (
        <Text c="dimmed">Select a card to view details</Text>
      )}
    </Paper>
  );
}
