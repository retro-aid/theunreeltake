import React from "react";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import "@mantine/core/styles.css";

import Head from "next/head";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Unreel Take",
  description: "WIP Description",
};

export default function RootAdminLayout({
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
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
