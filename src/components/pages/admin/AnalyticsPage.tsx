//import { PieChart} from "@mantine/charts"
import { Title, Stack, Group, Skeleton } from "@mantine/core"
import { DateRangeSelector } from "@/components/google-analytics/DateRangeSelector"
import { OverviewStats } from "@/components/google-analytics/OverviewStats";
import { DevicesChartDisplay } from "@/components/google-analytics/DeviceChartDisplay";
import { GARangeInputSchema } from "@/lib/schemas/analytics-schemas";
import { Suspense } from "react";



export async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{range?: string}>;
}) {
    const {range : rawRange } = await searchParams;
    const range = GARangeInputSchema.safeParse(rawRange).data ?? "30d";

    

    return (
        <Stack key={range} gap="lg">
            
            <Title>Analytics</Title>
            <DateRangeSelector value={range} />
            

            <Suspense fallback={<Skeleton height={110} />}>
                <OverviewStats range={range}/>
            </Suspense>

            <Suspense fallback={<Skeleton height={220} />}>
                <DevicesChartDisplay range={range}/>
            </Suspense>
        </Stack>
    )
}