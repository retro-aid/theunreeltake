"use client";

import Link from "next/link";
import { Button } from "@mantine/core";
import { Send } from "react-bootstrap-icons";

/** Links the newsletter dashboard to the one-time broadcast composer. */
export function BroadcastButton() {
  return (
    <Button
      component={Link}
      href="/dashboard/email/broadcast"
      leftSection={<Send size={18} />}
      color="teal"
      prefetch={false}
    >
      Send a broadcast
    </Button>
  );
}
