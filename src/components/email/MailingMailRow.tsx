'use client'

import { Table, Button, Modal, Group, TextInput } from "@mantine/core"
import { useState } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { MailingListDetailOutputDTO, MailingListMemberInputDTO, MailingListMemberInputSchema, MailingListOutputDTO } from "@/lib/schemas/email/mailing-lists-schemas";
import { addSubscriber, get, remove } from "@/lib/actions/email/mailing-lists-actions";
import { SubTableModal } from "./MailingSubTableModal";

/**
 * 
 * @param param0 Takes in a specific MailingListDetailOutputDTO (Mailing List + Subs)
 * @returns An individual row for the Mailing List table, as well as the Add Member and Delete Mailing List modals
 */
export function MailListRow({ MailingList }: { MailingList: MailingListDetailOutputDTO}){
    const [modalOpened, setModalOpened] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Form used for creating adding subscribers to a mailing list
    const MailListSubInputform = useForm({
      mode: "uncontrolled",
      initialValues: { mailingListId: MailingList.id, email: "" },
      validate: zod4Resolver(MailingListMemberInputSchema),
    });
    
    const handleSubmitAdd = async (values: typeof MailListSubInputform.values) => {
        setModalOpened(false);
        
        if (activeModal == "Add Member") {
          const member: MailingListMemberInputDTO = { mailingListId: MailingList.id, email: values.email}
          await addSubscriber(member);
        }
    
        setActiveModal(null);
        MailListSubInputform.reset();
        MailListSubInputform.setInitialValues({
            mailingListId: MailingList.id,
            email: "",
        });
    };

    const handleSubmitDelete = async () => {
        setModalOpened(false);
        if (activeModal == "Delete List") {
          await remove(MailingList.id)
        }
    
        setActiveModal(null);
        MailListSubInputform.reset();
        MailListSubInputform.setInitialValues({
            mailingListId: MailingList.id,
            email: "",
        });
    };

    const handleClose = () => {
        setModalOpened(false);
        setActiveModal(null);
        MailListSubInputform.reset();
        MailListSubInputform.setInitialValues({
            mailingListId: MailingList.id,
            email: "",
        });
    };

    return (
        <>
            {activeModal == "See Members" && (
                <Modal
                opened={modalOpened}
                onClose={handleClose}
                title={"See Members"}
                centered
                size="100%">
                    <SubTableModal MailingList={MailingList}/>
                </Modal>
            )}

            {activeModal == "Add Member" && (
                <Modal
                    opened={modalOpened}
                    onClose={handleClose}
                    title={"Add a member to a mailing list"}
                    centered
                    radius="md"
                >
                    <form onSubmit={MailListSubInputform.onSubmit(handleSubmitAdd)}>   
                        <TextInput
                            label="email"
                            description="The member's email"
                            radius="md"
                            key={MailListSubInputform.key("email")}
                            {...MailListSubInputform.getInputProps("email")}
                        />
                        <Group justify="space-between" mt="xl">
                            <Button
                            color="dark"
                            radius="md"
                            type="submit"
                            loading={MailListSubInputform.submitting}
                            >
                                Add Member
                            </Button>
                            <Button variant="default" radius="md" onClick={handleClose}>
                                Cancel
                            </Button>
                        </Group>
                    </form>
                </Modal>
            )}

            {activeModal == "Delete List" && (
            <Modal
                opened={modalOpened}
                onClose={handleClose}
                title={"Delete a mailing list"}
                centered
                radius="md"
            >
                <form onSubmit={(handleSubmitDelete)}>
                    Are you sure you want to delete this mailing list?
                    <Group mt="md">
                        <Button variant="default" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button color="red" type="submit">
                            Confirm
                        </Button>
                    </Group>
                </form>
            </Modal>
            )}

            <Table.Tr key={MailingList.id}>
                <Table.Td>{MailingList.name}</Table.Td>
                <Table.Td>
                    <Button
                    onClick={() => {
                    setModalOpened(true);
                    setActiveModal("See Members");
                    }}>
                        See Members
                    </Button>
                </Table.Td>
                <Table.Td>
                    <Button onClick={() => {
                    setModalOpened(true);
                    setActiveModal("Add Member");
                    }}>
                        Add Member
                    </Button>
                </Table.Td>
                <Table.Td>
                    <Button onClick={() => {
                    setModalOpened(true);
                    setActiveModal("Delete List");
                    }}>
                        Delete List
                    </Button>
                </Table.Td>
            </Table.Tr>
        </>
    )
}