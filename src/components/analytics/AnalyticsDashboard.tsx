import { Flex, Group, Stack, Text } from "@mantine/core"
import { People } from "react-bootstrap-icons"
import {
    ViewsCard,
    AmountCommentsCard,
    PendingRequestsCard
} from "./cards";

export function AnalyticsDashboard() {
    return(
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
          <Group
            gap={"xl"}
            wrap={"nowrap"}
            justify={"center"}
            align={"center"}
            w={"20%"}
            maw={440}
            style={{
              borderStyle: "solid",
              borderWidth: "3px",
              padding: "5px",
              borderRadius: "12px",
              boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Stack gap={5} align="center">
              <People size={40} />
              <Text size="xl" fw={500}>
                100
              </Text>
              <Text size="xl" fw={400}>
                Active Members
              </Text>
            </Stack>
          </Group>
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
    )  
}

