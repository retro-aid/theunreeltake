"use client";

import React from "react";
import { Anchor, AppShell, Box, Code, ScrollArea, Stack } from "@mantine/core";
import { SignOutButton } from "@/app/ui/admin/SignOutButton";
import { UserButton } from "@/app/ui/admin/UserButton";

import classes from "./NavbarSimple.module.css";
import pack from "@/../package.json";
import { useDisclosure } from "@mantine/hooks";
import AdminNavLinks from "@/app/ui/admin/AdminNavLinks";
import RoleBadge from "@/app/ui/admin/RoleBadge";
import { SettingsButton } from "./SettingsButton";

export function AdminShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      navbar={{ width: 250, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Navbar>
        <AppShell.Section
          component={ScrollArea}
          scrollbars={"y"}
          scrollbarSize={6}
        >
          <nav className={classes.navbar}>
            <div className={classes.navbarMain}>
              <Stack gap={7} className={classes.header}>
                <Box mx={7}>
                  <Code fw={700} color={"gray.2"}>
                    v{pack.version}
                  </Code>
                </Box>

                <UserButton />
                <RoleBadge />
              </Stack>
              <AdminNavLinks />
            </div>

            <div className={classes.footer}>
              <Anchor href={"/"}>View Homepage</Anchor>

              <SettingsButton />

              <SignOutButton />
            </div>
          </nav>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
