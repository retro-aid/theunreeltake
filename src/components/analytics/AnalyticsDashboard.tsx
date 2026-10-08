import { Group } from "@mantine/core";
import {
  ViewsCard,
  AmountCommentsCard,
  PendingRequestsCard,
  TotalUsersCard,
} from "./cards";

export function AnalyticsDashboard() {
  return (
    <Group grow gap={"lg"} wrap={"wrap"} px={{ base: 0, md: "xl" }}>
      <ViewsCard />
      <TotalUsersCard />
      <AmountCommentsCard />
      <PendingRequestsCard />
    </Group>
  );
}
