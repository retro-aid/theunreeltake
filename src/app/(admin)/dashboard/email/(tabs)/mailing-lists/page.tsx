import AsyncResendTable from "@/components/email/AsyncResendTable";
import { list as listMailingLists } from "@/lib/actions/email/mailing-lists-actions";
import { MailingListTableRow } from "@/components/email/MailingListTableRow";
import { CreateMailingListModal } from "@/components/email/CreateMailingListModal";
import { Container } from "@mantine/core";

export default function Page() {
  return (
    <Container>
      <AsyncResendTable
        title={"Mailing Lists"}
        headers={["Name", "Created", "Actions"]}
        listAction={listMailingLists}
        RowElement={MailingListTableRow}
        CreationModalElement={<CreateMailingListModal />}
      />
    </Container>
  );
}
