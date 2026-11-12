//import { PieChart} from "@mantine/charts"
import { Title, Stack, Group, Skeleton, SimpleGrid } from "@mantine/core";
import { DateRangeSelector } from "@/components/google-analytics/DateRangeSelector";
import { OverviewStats } from "@/components/google-analytics/OverviewStats";
import { DevicesChartDisplay } from "@/components/google-analytics/DeviceChartDisplay";
import { LocationList } from "@/components/google-analytics";
import { TopPosts } from "@/components/google-analytics";
import { GARangeInputSchema } from "@/lib/schemas/analytics-schemas";
import { Suspense } from "react";

/**
 * Based on the Date range (7 days, 30 days, 12 months)
 * Contains components such as:
 *      DateRangeSelector - Changes the Date Range
 *      Overview Stats - From the entire site like Total Views, Visitors and Avg Engagement Time
 *      Device Chart - Displays the devices that the users uses when visiting a site
 *      Location List - Displays the countries where the users are from
 *      Top Posts - Displays Top Posts either from Total Views or Avg Time spent view the post.
 *
 * @param searchParams - Sorts the information display based on Time (7 Days Ago, 30 Days Ago, 12 Months Ago)
 *                       Default value is 30d.
 * @returns The information components contain in the Analytics Page from Admin Dashboard
 */
export async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range = GARangeInputSchema.safeParse(rawRange).data ?? "30d";

  return (
    <Stack key={range} gap="lg">
      <Title>Analytics</Title>
      <DateRangeSelector range={range} />

      <Suspense fallback={<Skeleton height={110} />}>
        <OverviewStats range={range} />
      </Suspense>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Suspense key={`devices-${range}`} fallback={<Skeleton height={220} />}>
          <DevicesChartDisplay range={range} />
        </Suspense>

        <Suspense
          key={`locations-${range}`}
          fallback={<Skeleton height={220} />}
        >
          <LocationList range={range} />
        </Suspense>
      </SimpleGrid>

      <Suspense key={`posts-${range}`} fallback={<Skeleton height={180} />}>
        <TopPosts range={range} />
      </Suspense>
    </Stack>
  );
}
