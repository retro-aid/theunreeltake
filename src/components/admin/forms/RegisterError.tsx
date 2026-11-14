"use client";

import { Center, Anchor, Title, Paper } from "@mantine/core";
import Link from "next/link";

export default function RegisterError({
  errorString,
}: {
  errorString: string;
}) {
  return (
    <>
      <Paper shadow="xs" p="xl" mt="xl" w="50%" mx="auto">
        <Title order={1} ta="center">
          {errorString}
        </Title>
        <Center m={"lg"}>
          <p>Request for a new invite</p>
        </Center>
        <Center m={"lg"}>
          <Anchor component={Link} href={"/"} c="dark" ta="center">
            Back to Home
          </Anchor>
        </Center>
      </Paper>
    </>
  );
}
