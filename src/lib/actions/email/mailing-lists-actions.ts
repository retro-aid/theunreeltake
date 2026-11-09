"use server";

import * as email from "@/lib/dal/dto/email";
import { toResult } from "@/lib/errors";
import type {
  MailingListInputDTO,
  MailingListMemberInputDTO,
} from "@/lib/schemas/email/mailing-lists-schemas";

const EMAIL_PAGES = "/dashboard/email";

/** Server action for {@link email.mailingLists.list}. */
export async function list() {
  return toResult(() => email.mailingLists.list());
}

/** Server action for {@link email.mailingLists.listExtra} */
export async function listExtra() {
  return toResult(() => email.mailingLists.listExtra());
}

/** Server action for {@link email.mailingLists.get}. */
export async function get(id: string) {
  return toResult(() => email.mailingLists.get(id));
}

/** Server action for {@link email.mailingLists.create}. */
export async function create(mailingList: MailingListInputDTO) {
  return toResult(() => email.mailingLists.create(mailingList), EMAIL_PAGES);
}

/** Server action for {@link email.mailingLists.update}. */
export async function update(id: string, mailingList: MailingListInputDTO) {
  return toResult(
    () => email.mailingLists.update(id, mailingList),
    EMAIL_PAGES,
  );
}

/** Server action for {@link email.mailingLists.remove}. */
export async function remove(id: string) {
  return toResult(() => email.mailingLists.remove(id), EMAIL_PAGES);
}

/** Server action for {@link email.mailingLists.addSubscriber}. */
export async function addSubscriber(member: MailingListMemberInputDTO) {
  return toResult(() => email.mailingLists.addSubscriber(member), EMAIL_PAGES);
}

/** Server action for {@link email.mailingLists.removeSubscriber}. */
export async function removeSubscriber(member: MailingListMemberInputDTO) {
  return toResult(
    () => email.mailingLists.removeSubscriber(member),
    EMAIL_PAGES,
  );
}
