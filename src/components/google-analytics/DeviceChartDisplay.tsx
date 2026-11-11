import { getGADevicesAction } from "@/lib/actions/analytics-actions";
import type { GARangeOutput } from "@/lib/schemas/analytics-schemas";
import { AnalyticsCard, load } from "./AnalyticsCard";
import { DevicesChart } from "./DevicesChart";

/**
 * Displays the Device Chart
 *
 * @param range - Sorts the information display based on Time (7 Days Ago, 30 Days Ago, 12 Months Ago)
 * @returns The Pie Chart of the Device based on the date range from DeviceChart.tsx
 */
export async function DevicesChartDisplay({ range }: { range: GARangeOutput }) {
  const { data, error } = await load(() => getGADevicesAction(range));

  return (
    <AnalyticsCard title="Devices" error={error} empty={data?.length === 0}>
      {data && <DevicesChart data={data} />}
    </AnalyticsCard>
  );
}
