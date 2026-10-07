import { Flex, Group } from "@mantine/core";
import {
  ViewsCard,
  AmountCommentsCard,
  PendingRequestsCard,
  TotalUsersCard,
} from "./cards";

export function AnalyticsDashboard() {
  return (
    <Flex
      mih={500}
      gap="xs"
      justify="left"
      align="left"
      direction="column"
      wrap="wrap"
    >
      <Flex mih={250} w={"100%"} gap="xl" direction="row" wrap="wrap">
        <ViewsCard />
        <TotalUsersCard />
      </Flex>

      <Flex mih={250} w={"100%"} gap="xl" direction="row" wrap="wrap">
        <AmountCommentsCard />
        <PendingRequestsCard />
        <Group
          gap={"xl"}
          wrap={"nowrap"}
          justify={"center"}
          align={"center"}
          w={"30%"}
          style={{
            borderStyle: "solid",
            borderWidth: "3px",
            padding: "5px",
            borderRadius: "12px",
          }}
        >
          Box 5
        </Group>
      </Flex>
    </Flex>
  );
}
