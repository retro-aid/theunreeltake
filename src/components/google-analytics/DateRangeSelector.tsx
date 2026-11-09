"use client";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SegmentedControl } from "@mantine/core";
import type { GARangeOutput } from "@/lib/schemas/analytics-schemas";

const OPTIONS = [
    { label: "7 days", value: "7d"},
    { label: "30 days", value: "30d"},
    { label: "12 months", value: "12m"},
];

/**
 * Lets the user switch between 7 Days, 30 Days, or 12 Months to see the GA data
 * 
 * @param value - Taken from the GARangeOutput
 * @returns Changes the data shown depending on last 7 Days, 30 Days, or 12 Months
 */
export function DateRangeSelector({value}: {value: GARangeOutput}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();

    const onChange = (next: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", next);

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    return(
        <SegmentedControl
            value={value}
            onChange={onChange}
            data={OPTIONS}
            disabled={pending}
            w={240}
        />
    )
}