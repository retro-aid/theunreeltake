"use client";

import { Anchor } from "@mantine/core";
import { useRouter } from "next/navigation";

/**
 * Provides navigation back to the visitor's previous page.
 */
export default function BackLinkButton() {
  const router = useRouter();
  return (
    <Anchor
      component="button"
      type="button"
      onClick={() => router.back()}
      aria-label="Go back to the previous page"
    >
      ← Back
    </Anchor>
  );
}
