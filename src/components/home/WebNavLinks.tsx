"use client";

import { Anchor, Flex, Group } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { publicRouteMetadata } from "@/lib/constants";

export function WebNavLinks() {
  const path = usePathname();
  const webNavLinks = publicRouteMetadata
    .filter((item) => !item.disabled)
    .map((item) => {
      if (item.disabled) return;
      const active = path === item.href;

      return (
        <Anchor
          component={Link}
          prefetch={item.prefetch}
          key={item.label}
          style={{
            fontWeight: 600,
            fontSize: 18,
            color: active ? "white" : "rgba(255,255,255,0.75)",
            borderBottom: active ? "2px solid white" : "2px solid transparent",
            paddingBottom: 6,
            transition: "background-color 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = active
              ? "white"
              : "rgba(255,255,255,0.6)")
          }
          size={"md"}
          href={item.href}
          underline="never"
        >
          {item.label}
        </Anchor>
      );
    });

  return (
    <Flex justify="center" w="100%">
      <Group gap="xl">{webNavLinks}</Group>
    </Flex>
  );
}
