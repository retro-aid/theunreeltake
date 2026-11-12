"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  Group,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import type { GAPostStatOutputDTO } from "@/lib/schemas/analytics-schemas";

//Values to help sort by longest avg times and highest total views per post.
type SortKey = "views" | "time";
const SORT_OPTIONS = [
  { label: "Most views", value: "views" },
  { label: "Longest avg. time", value: "time" },
];

//Format to Minutes:Seconds
const formatDuration = (seconds: number) => {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m ? `${m}m ${s}s` : `${s}s`;
};
/**
 * Top Posts Sorted by Views or AvgTimeSeconds from Google Analytics.
 * Contains a switch mode (SegmentedControl) to switch between Highest Views or Highest Avg Time
 * View Post Button is added to take users to each blog post
 *
 * @param data - Contains Post Data like path, title, views and avgTimeSeconds
 * @returns the Top Posts based on highest views or highest Avg Time
 */
export function TopPostsView({ data }: { data: GAPostStatOutputDTO[] }) {
  const [sort, setSort] = useState<SortKey>("views");

  //Deals with Tie Breakers
  const sorted = useMemo(() => {
    return [...data].sort((a, b) =>
      sort === "views"
        ? b.views - a.views || b.avgTimeSeconds - a.avgTimeSeconds
        : b.avgTimeSeconds - a.avgTimeSeconds || b.views - a.views,
    );
  }, [data, sort]);

  return (
    <Stack gap="md">
      <SegmentedControl
        size="xs"
        w="fit-content"
        value={sort}
        onChange={(value) => setSort(value as SortKey)}
        data={SORT_OPTIONS}
      />

      <ScrollArea type="auto" offsetScrollbars>
        <Group wrap="nowrap" align="stretch" gap="md" pb="xs">
          {sorted.map((post, index) => (
            <Paper
              key={post.path}
              withBorder
              p="md"
              w={240}
              style={{ flexShrink: 0 }}
            >
              <Stack gap="xs" h="100%" justify="space-between">
                <div>
                  <Text size="xs" c="dimmed">
                    #{index + 1}
                  </Text>
                  <Text fw={600} truncate="end" title={post.title}>
                    {post.title}
                  </Text>
                </div>
                <Group justify="space-between">
                  <div>
                    <Text size="xs" c="dimmed">
                      Views
                    </Text>
                    <Text fw={700}>{post.views.toLocaleString()}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">
                      Avg. time
                    </Text>
                    <Text fw={700}>{formatDuration(post.avgTimeSeconds)}</Text>
                  </div>
                </Group>

                <Button
                  component={Link}
                  href={post.path}
                  variant="light"
                  size="xs"
                  fullWidth
                >
                  View post
                </Button>
              </Stack>
            </Paper>
          ))}
        </Group>
      </ScrollArea>
    </Stack>
  );
}
