'use client'

import { removeSubscriber } from "@/lib/actions/email/mailing-lists-actions";
import { MailingListDetailOutputDTO, MailingListMemberInputDTO } from "@/lib/schemas/email/mailing-lists-schemas";
import { Badge, Button, Group, Modal, Table } from "@mantine/core"
import { useState } from "react";

/**
 * 
 * @param param0 The subscribers for a specific mailing lsit and the mailing list's id
 * @returns An individual row in the mailing list's subscribers table, as well as a modal for removing a subscriber
 */
export function MailSubRow({ Subscriber, MailId }: { Subscriber: MailingListDetailOutputDTO["subscribers"][number], MailId: string}){
    const [modalOpened, setModalOpened] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const handleSubmit = async () => {
        setModalOpened(false);
        if (activeModal == "Remove Member") {
            const member: MailingListMemberInputDTO = { mailingListId: MailId, email: Subscriber.email}
            await removeSubscriber(member);
        }
        
        setActiveModal(null);
    };
    
    const handleClose = () => {
        setModalOpened(false);
        setActiveModal(null);
    };

    return (
        <>
        {activeModal == "Remove Member" && (
            <Modal
            opened={modalOpened}
            onClose={handleClose}
            title={"Remove a subscriber"}
            centered
            radius="md"
            >
                <form onSubmit={(handleSubmit)}>
                    Are you sure you want to remove this member?
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
        <Table.Tr key={Subscriber.id}>
            <Table.Td>{Subscriber.firstName}</Table.Td>
            <Table.Td>{Subscriber.lastName}</Table.Td>
            <Table.Td>{Subscriber.email}</Table.Td>
            <Table.Td>
                <Badge
                    color={Subscriber.unsubscribed === false ? "green" : "red"}
                        variant="light"
                        >
                    {Subscriber.unsubscribed === false ? "Subbed" : "Not Subbed"}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Button onClick={() => {
                setModalOpened(true);
                setActiveModal("Remove Member");
                }}>
                    Remove Member
                </Button>
            </Table.Td>
        </Table.Tr>
        </>
    )
}