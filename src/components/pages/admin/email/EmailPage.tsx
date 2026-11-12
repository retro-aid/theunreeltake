import { Container, Group, Tabs, TabsList, TabsTab } from "@mantine/core";
import { BroadcastButton } from "@/components/newsletter";
import AsyncResendTable from "@/components/email/AsyncResendTable";

import { list as listSubscribers } from "@/lib/actions/email/subscribers-actions";
import { SubscriberTableRow } from "@/components/email/SubscriberTableRow";

export function EmailPage() {
  return (
    <>
      <Group p={"sm"} justify={"end"}>
        <BroadcastButton />
      </Group>
      <Tabs defaultValue={"activity"}>
        <TabsList>
          <TabsTab value={"activity"}>Activity</TabsTab>
          <TabsTab value={"mailing-lists"}>Mailing Lists</TabsTab>
          <TabsTab value={"subscribers"}>Subscribers</TabsTab>
          <TabsTab value={"templates"}>Templates</TabsTab>
          <TabsTab value={"automations"}>Automations</TabsTab>
        </TabsList>
      </Tabs>
      <Container mt={"xl"}>
        <AsyncResendTable
          title={"Subscribers"}
          headers={["Name", "Email", "Subscribed", "Status", "Actions"]}
          listAction={listSubscribers}
          RowElement={SubscriberTableRow}
        />
      </Container>
    </>
  );
}
