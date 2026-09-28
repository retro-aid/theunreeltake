"use client";

import { AppShell } from "@mantine/core";
import React from "react";
import { HomeHeader } from "@/app/ui/home/HomeHeader";
import { useHeadroom } from "@mantine/hooks";

export function HomeShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headroom = useHeadroom({ fixedAt: 80 });

  return (
    <AppShell
      header={{ height: 80, collapsed: !headroom.pinned, offset: false }}
    >
      <AppShell.Header>
        <HomeHeader />
      </AppShell.Header>

      <AppShell.Main
        h={"100%"}
        style={{ display: "flex", flexDirection: "column" }}
        pt={80}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
