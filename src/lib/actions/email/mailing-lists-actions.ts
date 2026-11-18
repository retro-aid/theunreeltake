"use server";

import * as mailingLists from "@/lib/dal/dto/email/mailing-lists";
import { toResult } from "@/lib/errors";
import type {
  ContactToMailingListInputDTO,
  CreateMailingListInputDTO,
  ListMailingListContactsInputDTO,
  ListMailingListInputDTO,
  RemoveMailingListInputDTO,
} from "@/lib/schemas/email/mailing-lists-schemas";

/** Server action for {@link mailingLists.list}. */
export async function list(params: ListMailingListInputDTO) {
  return toResult(() => mailingLists.list(params));
}

export async function listSubscribers(params: ListMailingListContactsInputDTO) {
  return toResult(() => mailingLists.listSubscribers(params));
}

/** Server action for {@link mailingLists.create}. */
export async function create(params: CreateMailingListInputDTO) {
  return toResult(() => mailingLists.create(params));
}

/** Server action for {@link mailingLists.remove}. */
export async function remove(id: RemoveMailingListInputDTO) {
  return toResult(() => mailingLists.remove(id));
}

/** Server action for {@link mailingLists.addSubscriber}. */
export async function addSubscriber(params: ContactToMailingListInputDTO) {
  return toResult(() => mailingLists.addSubscriber(params));
}

/** Server action for {@link mailingLists.removeSubscriber}. */
export async function removeSubscriber(params: ContactToMailingListInputDTO) {
  return toResult(() => mailingLists.removeSubscriber(params));
}
