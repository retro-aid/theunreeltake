import { ActionIcon, Container } from "@mantine/core";
import AsyncResendTable from "@/components/email/AsyncResendTable";
import { list as listEmailTemplates } from "@/lib/actions/email/templates-actions";
import { TemplateTableRow } from "@/components/email/TemplateTableRow";
import { Plus } from "react-bootstrap-icons";

export default function Page() {
  return (
    <Container>
      <AsyncResendTable
        title={"Email Templates"}
        headers={["Name", "Last Updated", "Status", "Actions"]}
        listAction={listEmailTemplates}
        RowElement={TemplateTableRow}
        CreationModalElement={
          <ActionIcon
            size={"lg"}
            radius={"sm"}
            title={"Create New"}
            variant={"outline"}
            component={"a"}
            href={"/dashboard/email/templates/create"}
          >
            <Plus size={24} />
          </ActionIcon>
        }
      />
    </Container>
  );
}
