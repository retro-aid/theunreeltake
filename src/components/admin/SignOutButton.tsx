"use client";

import { useRouter } from "next/navigation";
import { Button } from "@mantine/core";
import { authClient } from "@/lib/auth-client";
import { useTransition } from "react";
import { BoxArrowRight } from "react-bootstrap-icons";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      leftSection={<BoxArrowRight size={18} />}
      justify={"start"}
      color={"red.6"}
      variant={"subtle"}
      fullWidth
      loading={isPending}
      loaderProps={{ type: "dots" }}
      onClick={() =>
        startTransition(async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => router.push("/login"),
            },
          });
        })
      }
    >
      <span>Logout</span>
    </Button>
  );
}
