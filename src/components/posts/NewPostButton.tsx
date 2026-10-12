"use client";

import { Button } from "@mantine/core";
import { Plus } from "react-bootstrap-icons";
import Link from "next/link";

export function NewPostButton() {
  return (
    <Button
      component={Link}
      href={"/dashboard/posts/create"}
      leftSection={<Plus size={20} />}
      color={"teal"}
      variant={"outline"}
      bg={"teal.0"}
      prefetch={false}
    >
      New
    </Button>
  );
}
