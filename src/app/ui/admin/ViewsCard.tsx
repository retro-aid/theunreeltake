'use client';

import { useEffect, useState } from "react";
import { Group, Stack, Text } from "@mantine/core";
import { Eye } from "react-bootstrap-icons";
import { getTotalViews } from "@/lib/actions";

export function ViewsCard() {
    const [views, setViews] = useState<number | null>(null);

    useEffect(() => {
        getTotalViews().then((result) => {
            if (result.success) setViews(result.total);
        });
    }, []);

    return (
        <Group
            gap={"xl"}
            wrap={"nowrap"}
            justify={"center"}
            align={"center"}
            w={"75%"}
            style={{ borderStyle: "solid", borderWidth: "3px", padding: "5px", borderRadius: "12px" }}
        >
            <Stack gap={4} align={"center"}>
                <Eye size={28} />
                <Text fw={700} size={"2rem"}>
                    {views !== null ? views.toLocaleString() : "Loading..."}
                </Text>
                <Text size={"sm"} c={"dimmed"}>
                    Total Views of Posts
                </Text>
            </Stack>
        </Group>
    );
}
