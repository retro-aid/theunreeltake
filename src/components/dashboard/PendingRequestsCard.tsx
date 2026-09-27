'use client';

import { useEffect, useState } from "react";
import { Stack, Text } from '@mantine/core'
import { Send } from "react-bootstrap-icons"
import { getPendingRequestCountAction } from "@/lib/actions/request-actions";

export function PendingRequestsCard() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        async function fetchPendingRequestsCount() {
            try {
                const result = await getPendingRequestCountAction();
                setCount(result);
            } catch (error) {
                console.error("Failed to fetch pending request count:", error);
        }
    }
        fetchPendingRequestsCount();
    }, []);

    return (
            <Stack gap={4} align={"center"}>
                <Send size={28}></Send>
                <Text fw={700} size={"2rem"}>
                    {count !== null ? count.toLocaleString() : "No requests available"}
                </Text>
                <Text size={"sm"} c={"dimmed"}>
                    Requests Pending
                </Text>
            </Stack>
    )
}