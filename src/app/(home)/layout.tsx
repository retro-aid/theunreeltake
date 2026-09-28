import type { Metadata } from "next";
import React from "react";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import "@mantine/core/styles.css";
import "@gfazioli/mantine-flip/styles.css";

import Head from "next/head";
import { HomeShell } from "@/app/ui/home/HomeShell";

export const metadata: Metadata = {
  title: "The Unreel Take",
  description: "Unprofessional Reviews That Give you Reel Information",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={"en"} {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript />
      </Head>
      <body>
        <MantineProvider defaultColorScheme={"light"}>
          <HomeShell>{children}</HomeShell>
        </MantineProvider>
      </body>
    </html>
  );
}
