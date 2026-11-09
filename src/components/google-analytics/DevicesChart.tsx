"use client";

import { PieChart } from "@mantine/charts";
import { ColorSwatch, Group, Stack, Text} from "@mantine/core";
import type { GADeviceOutputDTO } from "@/lib/schemas/analytics-schemas";

const COLORS: Record<string, string> = {
    desktop: "yellow",
    mobile: "blue",
    tablet: "red",
}

const label = (device: string) => device.charAt(0).toUpperCase() + device.slice(1);

export function DevicesChartView({data}: {data: GADeviceOutputDTO[]}) 
{
    const total = data.reduce((sum, d) => sum + d.visitors, 0);

    const chartData = data.map((d) => ({
        name: label(d.device),
        value: d.visitors,
        color: COLORS[d.device] ?? "gray",
    }));

    return (
        <Group justify="center" gap="xl" wrap="wrap">
            <PieChart data={chartData} withTooltip size={160} />

            <Stack gap="xs">
                {chartData.map((d)=> (
                    <Group key={d.name} gap="xs" wrap="nowrap">
                        <ColorSwatch color={`var(--mantine-color-${d.color}-6)` } size={12} />
                        <Text size="sm">
                            {d.name}: {d.value.toLocaleString()}  
                            {total ? ` (${Math.round((d.value / total) * 100)}%)` : ""}
                        </Text>
                    </Group>
                ))}
            </Stack>
        </Group>
    );
}