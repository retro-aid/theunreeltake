import "server-only";
import { convertToPaginationOptions, requireAdmin } from "@/lib/dal/utils";
import type {
  ListMailingListInputDTO,
  ListMailingListOutputDTO,
  ListMailingListContactsInputDTO,
  ListMailingListContactOutputDTO,
  RemoveMailingListInputDTO,
  RemoveMailingListOutputDTO,
  CreateMailingListInputDTO,
  CreateMailingListOutputDTO,
  ContactToMailingListInputDTO,
  AddContactToMailingListOutputDTO,
  RemoveContactFromMailingListOutputDTO,
} from "@/lib/schemas/email/mailing-lists-schemas";

import {
  ListMailingListOutputSchema,
  ListMailingListContactsInputSchema,
  ListMailingListContactsOutputSchema,
  CreateMailingListInputSchema,
  CreateMailingListOutputSchema,
  RemoveMailingListInputSchema,
  RemoveMailingListOutputSchema,
  ContactToMailingListInputSchema,
  AddContactToMailingListOutputSchema,
  RemoveContactFromMailingListOutputSchema,
} from "@/lib/schemas/email/mailing-lists-schemas";

import { resend, unwrap } from "./resend";
import { PaginationSchema } from "@/lib/schemas/email/util-schemas";

/**
 * Gets all mailing lists. There can be none.
 *
 * @returns Each list's ID and name.
 * @throws If you're not an admin or Resend has a problem.
 */
export async function list(
  params: ListMailingListInputDTO,
): Promise<ListMailingListOutputDTO> {
  await requireAdmin();

  const validatedParams = PaginationSchema.parse(params);

  const options = convertToPaginationOptions(validatedParams);

  const resolvedResponse = unwrap(await resend.segments.list(options));

  return ListMailingListOutputSchema.parse(resolvedResponse);
}

export async function listSubscribers(
  params: ListMailingListContactsInputDTO,
): Promise<ListMailingListContactOutputDTO> {
  await requireAdmin();

  const validatedParams = ListMailingListContactsInputSchema.parse(params);

  const paginationOptions = convertToPaginationOptions(validatedParams);

  const resolvedResponse = unwrap(
    await resend.contacts.list({
      segmentId: validatedParams.segmentId,
      ...paginationOptions,
    }),
  );

  return ListMailingListContactsOutputSchema.parse(resolvedResponse);
}

/**
 * Creates a mailing list.
 *
 * @param params - The list's name.
 * @returns The new list's ID.
 * @throws If you're not an admin, the name is wrong or taken, or Resend has a
 * problem.
 */
export async function create(
  params: CreateMailingListInputDTO,
): Promise<CreateMailingListOutputDTO> {
  await requireAdmin();

  const validatedParams = CreateMailingListInputSchema.parse(params);

  const resolvedResponse = unwrap(
    await resend.segments.create(validatedParams),
  );

  return CreateMailingListOutputSchema.parse(resolvedResponse);
}

/**
 * Deletes a mailing list. Everyone on it stays a subscriber.
 *
 * @param id - The mailing list's ID.
 * @returns The deleted list's ID.
 * @throws If you're not an admin or Resend has a problem.
 */
export async function remove(
  id: RemoveMailingListInputDTO,
): Promise<RemoveMailingListOutputDTO> {
  await requireAdmin();

  const validatedId = RemoveMailingListInputSchema.parse(id);

  const resolvedResponse = unwrap(await resend.segments.remove(validatedId));

  return RemoveMailingListOutputSchema.parse(resolvedResponse);
}

/**
 * Adds a subscriber to a mailing list.
 *
 * @remarks
 * They need to already be a subscriber (a Resend contact).
 *
 * @param params - The list's ID and the subscriber's email.
 * @returns The subscriber's ID.
 * @throws If you're not an admin, the input is wrong, or Resend has a
 * problem (like the subscriber not existing).
 */
export async function addSubscriber(
  params: ContactToMailingListInputDTO,
): Promise<AddContactToMailingListOutputDTO> {
  await requireAdmin();

  const validatedParams = ContactToMailingListInputSchema.parse(params);

  const resolvedResponse = unwrap(
    await resend.contacts.segments.add(validatedParams),
  );

  return AddContactToMailingListOutputSchema.parse(resolvedResponse);
}

/**
 * Takes a subscriber off a mailing list. They stay a subscriber.
 *
 * @param params - The list's ID and the subscriber's email.
 * @returns The subscriber's ID.
 * @throws If you're not an admin, the input is wrong, or Resend has a problem.
 */
export async function removeSubscriber(
  params: ContactToMailingListInputDTO,
): Promise<RemoveContactFromMailingListOutputDTO> {
  await requireAdmin();

  const validatedParams = ContactToMailingListInputSchema.parse(params);

  const resolvedResponse = unwrap(
    await resend.contacts.segments.remove(validatedParams),
  );

  return RemoveContactFromMailingListOutputSchema.parse(resolvedResponse);
}
