import { Button } from "@mantine/core";
import Link from "next/link";

export function HomeHeaderButtons() {
  return (
    <Button
      component={Link}
      href={"/login"}
      prefetch={false}
      size={"md"}
      radius={"md"}
      variant={"outline"}
      color={"white"}
    >
      Login
    </Button>
  );
}
