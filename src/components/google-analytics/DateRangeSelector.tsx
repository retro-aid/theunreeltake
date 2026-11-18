"use client";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SegmentedControl } from "@mantine/core";
import type { GARangeOutput } from "@/lib/schemas/analytics-schemas";

const OPTIONS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "12 months", value: "12m" },
];

/**
 * Lets the user switch between 7 Days, 30 Days, or 12 Months.
 * Easier for users to tell how the data is being changed.
 * Changes the URL route path.
 *
 * @param range - Sorts the information display based on Time (7 Days Ago, 30 Days Ago, 12 Months Ago)
 * @returns Changes the data shown depending on last 7 Days, 30 Days, or 12 Months
 */
export function DateRangeSelector({ range }: { range: GARangeOutput }) {
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

  return (
    <SegmentedControl
      value={range}
      onChange={onChange}
      data={OPTIONS}
      disabled={pending}
      w={240}
    />
  );
}
