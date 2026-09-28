import { Avatar, Box, Group, Text, UnstyledButton } from "@mantine/core";
import { useContext } from "react";
import { AuthContext } from "@/app/ui/admin/AuthContext";

import classes from "./UserButton.module.css";

export function UserButton() {
  const data = useContext(AuthContext);

  return (
    <UnstyledButton className={classes.user}>
      <Group gap={0}>
        <Box>
          <Avatar
            variant={"light"}
            src={data?.user.image}
            radius={"xs"}
            size={36}
          >
            {data?.user.name
              .split(" ")
              .slice(0, 2)
              .map((x) => x[0])}
          </Avatar>
        </Box>

        <Box w={165} ml={7}>
          <Text size="sm" fw={700} truncate={"end"}>
            {data?.user.name}
          </Text>

          <Text c="dimmed" mih={14} size={"11px"} truncate={"end"}>
            {data?.user.email}
          </Text>
        </Box>
      </Group>
    </UnstyledButton>
  );
}
