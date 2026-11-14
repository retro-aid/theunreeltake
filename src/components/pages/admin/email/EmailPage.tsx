import {
  Container,
  Group,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@mantine/core";
import { BroadcastButton } from "@/components/newsletter";
import AsyncResendTable from "@/components/email/AsyncResendTable";

import { list as listSubscribers } from "@/lib/actions/email/subscribers-actions";
import { list as listMailingLists } from "@/lib/actions/email/mailing-lists-actions";
import { SubscriberTableRow } from "@/components/email/SubscriberTableRow";
import { MailingListTableRow } from "@/components/email/MailingListTableRow";
import { CreateSubscriberModal } from "@/components/email/CreateSubscriberModal";
import { CreateMailingListModal } from "@/components/email/CreateMailingListModal";

export function EmailPage() {
  return (
    <>
      <Group p={"sm"} justify={"end"}>
        <BroadcastButton />
      </Group>
      <Tabs defaultValue={"activity"} keepMounted={false}>
        <TabsList>
          <TabsTab value={"activity"}>Activity</TabsTab>
          <TabsTab value={"mailing-lists"}>Mailing Lists</TabsTab>
          <TabsTab value={"subscribers"}>Subscribers</TabsTab>
          <TabsTab value={"templates"}>Templates</TabsTab>
          <TabsTab value={"automations"}>Automations</TabsTab>
        </TabsList>

        <Container mt={"xl"}>
          <TabsPanel value={"subscribers"}>
            <AsyncResendTable
              title={"Subscribers"}
              headers={["Name", "Email", "Subscribed", "Status", "Actions"]}
              listAction={listSubscribers}
              RowElement={SubscriberTableRow}
              CreationModalElement={<CreateSubscriberModal />}
            />
          </TabsPanel>

          <TabsPanel value={"mailing-lists"}>
            <AsyncResendTable
              title={"Mailing Lists"}
              headers={["Name", "Created", "Actions"]}
              listAction={listMailingLists}
              RowElement={MailingListTableRow}
              CreationModalElement={<CreateMailingListModal />}
            />
          </TabsPanel>
        </Container>
      </Tabs>
    </>
  );
}
