import { SimpleGrid, Text } from "@mantine/core";
import { getGAOverviewAction } from "@/lib/actions/analytics-actions";
import { AnalyticsCard, load } from "./AnalyticsCard";
import type { GARangeOutput } from "@/lib/schemas/analytics-schemas";

const formatDuration = (seconds: number) => {
    const total = Math.round(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m ? `${m}m ${s}s`:`${s}s`;
};

export async function OverviewStats({range}: {range: GARangeOutput}) {
    console.log("OverviewStats range:", range);
    const {data, error} = await load(() => getGAOverviewAction(range));
    console.log("OverviewStats result:", { data, error });
    const stats = [
        { title: "Page views", value: data?.pageViews.toLocaleString()},
        { title: "Visitors", value: data?.visitors.toLocaleString()},
        {
            title: "Avg. engagement time",
            value: data && formatDuration(data.avgEngagementSeconds),
        },
    ];

    return (
        <SimpleGrid cols={{base: 1, sm: 3}}>
            {stats.map((stat) => (
                <AnalyticsCard key={stat.title} title={stat.title} error={error}>
                    <Text fz={32} fw={700}>{stat.value}</Text>
                </AnalyticsCard>
            ))}
        </SimpleGrid>
    )
}