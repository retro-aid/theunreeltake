'use client'

import { Card, Table, Button, Group, Modal, TextInput } from "@mantine/core"
import { MailListRow } from "./MailingMailRow"
import { useState } from "react"
import { useForm } from "@mantine/form"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { MailingListDetailOutputDTO, MailingListInputDTO, MailingListInputSchema, MailingListOutputDTO } from "@/lib/schemas/email/mailing-lists-schemas"
import { create } from "@/lib/actions/email/mailing-lists-actions"

/**
 * A function that displays the basic Mailing List Table
 * @param param0 Takes in an array of MailingListDetailOutputDTO (Mailing List + Subs)
 * @returns The Add Mailing List modal and the Mailing List Table
 */
export function MailingListTable({ MailingLists }: { MailingLists: MailingListDetailOutputDTO[]}){
    const [modalOpened, setModalOpened] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Form used for creating adding subscribers to a mailing list
    const MailListInputform = useForm({
        mode: "uncontrolled",
        initialValues: { name: "" },
        validate: zod4Resolver(MailingListInputSchema),
    });

    const handleSubmit = async (values: typeof MailListInputform.values) => {
  
        setModalOpened(false);
        
    
        if (activeModal == "Add Mailing List") {
          const mailingList: MailingListInputDTO = {name: values.name}
          await create(mailingList);
        }
    
        setActiveModal(null);
        MailListInputform.reset();
        MailListInputform.setInitialValues({
          name: "",
        });
    };

    const handleClose = () => {
        setModalOpened(false);
        setActiveModal(null);
    };

    const rows = MailingLists.map((item) => (
        <MailListRow key={item.id} MailingList={item}/>
    ))
    return (
        <>
        {activeModal == "Add Mailing List" && (
            <Modal
                opened={modalOpened}
                onClose={handleClose}
                title={"Create a new mailing list"}
                centered
                radius="md"
            >
                <form onSubmit={MailListInputform.onSubmit(handleSubmit)}>
        
                <TextInput
                    label="Name"
                    description="The mailing list's name"
                    radius="md"
                    key={MailListInputform.key("name")}
                    {...MailListInputform.getInputProps("name")}
                />
                <Group justify="space-between" mt="xl">
                    <Button
                    color="dark"
                    radius="md"
                    type="submit"
                    loading={MailListInputform.submitting}
                    >
                        Create Mailing List
                    </Button>
                    <Button variant="default" radius="md" onClick={handleClose}>
                        Cancel
                    </Button>
                </Group>
                </form>
            </Modal>
        )}

        <Card withBorder padding="lg" radius="md">
            <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Mailing List</Table.Th>
                        <Table.Th>
                        <Button onClick={() => {
                        setModalOpened(true);
                        setActiveModal("Add Mailing List");
                        }}>
                            Add Mailing List
                        </Button>
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Card>
        </>
    )
}