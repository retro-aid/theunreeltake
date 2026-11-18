import { Group, Progress, Stack, Text } from "@mantine/core";
import { getGALocationsAction } from "@/lib/actions/analytics-actions";
import type { GARangeOutput } from "@/lib/schemas/analytics-schemas";
import { AnalyticsCard, load } from "./AnalyticsCard";

/**
 * Returns the locations of the visitors from Google Analytics.
 *
 * @param range - Sorts the information display based on Time (7 Days Ago, 30 Days Ago, 12 Months Ago)
 * @returns A list of countries from each visitor
 */
export async function LocationList({ range }: { range: GARangeOutput }) {
  const { data, error } = await load(() => getGALocationsAction(range));
  const max = data?.[0]?.visitors ?? 0;

  return (
    <AnalyticsCard
      title="Top countries"
      error={error}
      empty={data?.length === 0}
    >
      <Stack gap="sm">
        {data?.slice(0, 5).map((row) => (
          <div key={row.country}>
            <Group justify="space-between" mb={4}>
              <Text size="sm">{row.country}</Text>
              <Text size="sm" c="dimmed">
                {row.visitors.toLocaleString()}
              </Text>
            </Group>
            <Progress value={max ? (row.visitors / max) * 100 : 0} size="sm" />
          </div>
        ))}
      </Stack>
    </AnalyticsCard>
  );
}
