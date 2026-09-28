"use client";
import { Box, Flex } from "@mantine/core";
import { RequestForm } from "@/app/ui/home/forms/RequestForm";

export default function RequestsPage() {
  return (
    <Flex
      w={"100%"}
      h={"100%"}
      justify={"center"}
      align={"flex-start"}
      gap="xl"
      wrap="wrap"
    >
      <Box w={{ base: "100%", lg: "50%" }}>
        <RequestForm />
      </Box>
    </Flex>
  );
}
