import AsyncResendTable from "@/components/email/AsyncResendTable";

import { list as listSubscribers } from "@/lib/actions/email/subscribers-actions";
import { SubscriberTableRow } from "@/components/email/SubscriberTableRow";
import { CreateSubscriberModal } from "@/components/email/CreateSubscriberModal";
import { Container } from "@mantine/core";

export default function Page() {
  return (
    <Container>
      <AsyncResendTable
        title={"Subscribers"}
        headers={["Name", "Email", "Subscribed", "Status", "Actions"]}
        listAction={listSubscribers}
        RowElement={SubscriberTableRow}
        CreationModalElement={<CreateSubscriberModal />}
      />
    </Container>
  );
}
