"use client";

import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { Moon, Sun } from "react-bootstrap-icons";

export default function ThemeToggleButton() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <Tooltip label={"Toggle theme"} position={"bottom"}>
      <ActionIcon
        onClick={() =>
          setColorScheme(computedColorScheme === "light" ? "dark" : "light")
        }
        variant="default"
        size={"lg"}
        radius="md"
        aria-label="Toggle color scheme"
      >
        {colorScheme === "dark" ? <Sun /> : <Moon />}
      </ActionIcon>
    </Tooltip>
  );
}
