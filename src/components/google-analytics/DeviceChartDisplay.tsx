import { getGADevicesAction } from "@/lib/actions/analytics-actions";
import type { GARangeOutput } from "@/lib/schemas/analytics-schemas";
import { AnalyticsCard, load} from "./AnalyticsCard";
import { DevicesChartView } from "./DevicesChart";

export async function DevicesChartDisplay({range}: {range: GARangeOutput}) {
    const { data, error } = await load(() => getGADevicesAction(range));

    return(
        <AnalyticsCard title="Devices" error={error} empty={data?.length === 0}>
            {data && <DevicesChartView data={data}/>}
        </AnalyticsCard>
    );
}