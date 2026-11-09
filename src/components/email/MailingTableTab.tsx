'use server'

import { list, listExtra } from "@/lib/actions/email/mailing-lists-actions";
import { MailingListTable } from "./MailingTable";

export default async function MailingTableTab(){
    const result = await listExtra()

    return (
        <MailingListTable MailingLists={result.data || []}/>
    )
}