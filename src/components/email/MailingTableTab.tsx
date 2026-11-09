'use server'

import { listExtra } from "@/lib/actions/email/mailing-lists-actions";
import { MailingListTable } from "./MailingTable";

/**
 * A function for everything displayed on the Mailing List Table Tab; 
 * Also queries data and passes it to the Mailing List Table
 * @returns The Mailing List Table
 */
export default async function MailingTableTab(){
    const result = await listExtra()

    return (
        <MailingListTable MailingLists={result.data || []}/>
    )
}