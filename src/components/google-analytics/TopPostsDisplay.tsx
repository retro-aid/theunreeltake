import { getGAPostStatsAction } from "@/lib/actions/analytics-actions";
import type { GARangeOutput } from "@/lib/schemas/analytics-schemas";
import { AnalyticsCard, load } from "./AnalyticsCard";
import { TopPostsView } from "./TopPostsList";

/**
 * Returns the Card with Top Posts.
 *
 * @param range - Sorts the information display based on Time (7 Days Ago, 30 Days Ago, 12 Months Ago)
 * @returns The Card with Top Posts Information Display from TopPostsList.tsx
 */
export async function TopPosts({ range }: { range: GARangeOutput }) {
  const { data, error } = await load(() => getGAPostStatsAction(range));

  return (
    <AnalyticsCard title="Top posts" error={error} empty={data?.length === 0}>
      {data && <TopPostsView data={data} />}
    </AnalyticsCard>
  );
}
