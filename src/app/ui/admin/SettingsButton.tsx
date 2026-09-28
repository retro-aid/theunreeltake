import { Button } from "@mantine/core";
import { Gear } from "react-bootstrap-icons";
import Link from "next/link";

export function SettingsButton() {
  return (
    <Button
      component={Link}
      href={"/dashboard/settings"}
      leftSection={<Gear size={18} />}
      justify={"start"}
      color={"dark"}
      variant={"subtle"}
      fullWidth
      prefetch={false}
    >
      <span>Settings</span>
    </Button>
  );
}
