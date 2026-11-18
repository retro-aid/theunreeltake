"use client";

import React from "react";
import { Container, Group, Tabs } from "@mantine/core";
import { BroadcastButton } from "@/components/newsletter";
import { usePathname, useRouter } from "next/navigation";

export function EmailPageLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  const route = "/dashboard/email";

  const router = useRouter();
  const pathname = usePathname();
  const tab = pathname.split("/").pop();

  const activeTab = tab === "email" ? "activity" : tab;

  const handleChange = (value: string | null) => {
    if (!value || value === "activity") {
      router.push(route);
      return;
    }

    router.push(`${route}/${value}`);
  };

  return (
    <>
      <Group p={"sm"} justify={"end"}>
        <BroadcastButton />
      </Group>
      <Tabs value={activeTab} onChange={handleChange}>
        <Tabs.List>
          <Tabs.Tab value={"activity"}>Activity</Tabs.Tab>
          <Tabs.Tab value={"mailing-lists"}>Mailing Lists</Tabs.Tab>
          <Tabs.Tab value={"subscribers"}>Subscribers</Tabs.Tab>
          <Tabs.Tab value={"templates"}>Templates</Tabs.Tab>
          <Tabs.Tab value={"automations"}>Automations</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Container mt={"xl"} fluid>
        {children}
      </Container>
    </>
  );
}
