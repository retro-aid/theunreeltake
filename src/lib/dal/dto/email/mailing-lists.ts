import "server-only";
import type { Contact, Segment } from "resend";
import { requireAdmin } from "@/lib/dal/utils";
import { AppError } from "@/lib/errors";
import {
  MailingListDetailOutputSchema,
  MailingListIdInputSchema,
  MailingListIdOutputSchema,
  MailingListInputSchema,
  MailingListMemberInputSchema,
  MailingListOutputSchema,
  type MailingListDetailOutputDTO,
  type MailingListIdOutputDTO,
  type MailingListInputDTO,
  type MailingListMemberInputDTO,
  type MailingListOutputDTO,
} from "@/lib/schemas/email/mailing-lists-schemas";
import { resend, unwrap } from "./resend";

/**
 * Gets every mailing list in Resend, going through every page.
 *
 * @returns The mailing lists.
 * @throws If Resend has a problem.
 */
async function listAll() {
  const lists: Segment[] = [];
  let cursor: string | undefined;

  do {
    const page = unwrap(
      await resend.segments.list({ limit: 100, after: cursor }),
    );
    lists.push(...page.data);
    cursor = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (cursor);

  return lists;
}

/**
 * Makes sure no other list already has this name, ignoring case.
 *
 * @param name - The name to check.
 * @param id - The list being renamed, so it doesn't match itself.
 * @throws If another list has the name.
 */
async function assertNameIsAvailable(name: string, id?: string) {
  const taken = (await listAll()).some(
    (list) => list.name.toLowerCase() === name.toLowerCase() && list.id !== id,
  );

  if (taken)
    throw new AppError("A mailing list with that name already exists", 409);
}

/**
 * Gets everyone on a mailing list, going through every page.
 *
 * @param segmentId - The mailing list's ID.
 * @returns The people on the list.
 * @throws If Resend has a problem.
 */
async function listMembers(segmentId: string) {
  const members: Contact[] = [];
  let cursor: string | undefined;

  do {
    const page = unwrap(
      await resend.contacts.list({ segmentId, limit: 100, after: cursor }),
    );
    members.push(...page.data);
    cursor = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (cursor);

  return members;
}

/**
 * Gets all mailing lists. There can be none.
 *
 * @returns Each list's ID and name.
 * @throws If you're not an admin or Resend has a problem.
 */
export async function list(): Promise<MailingListOutputDTO[]> {
  await requireAdmin();

  return MailingListOutputSchema.array().parse(await listAll());
}

export async function listExtra(): Promise<MailingListDetailOutputDTO[]> {
  await requireAdmin();

  let detailedList = [];
  const mls = MailingListOutputSchema.array().parse(await listAll());
  for (let i = 0; i < mls.length; i++){
    const listId = MailingListIdInputSchema.parse(mls[i].id);
    const list = unwrap(await resend.segments.get(listId));
    const members = await listMembers(listId);

    detailedList.push(MailingListDetailOutputSchema.parse({
      ...list,
      subscribers: members.map((member) => ({
        ...member,
        firstName: member.first_name,
        lastName: member.last_name,
      })),
    }))
  }

  return detailedList;
}

/**
 * Gets one mailing list and everyone on it.
 *
 * @param id - The mailing list's ID.
 * @returns The list and its subscribers.
 * @throws If you're not an admin or the list doesn't exist.
 */
export async function get(id: string): Promise<MailingListDetailOutputDTO> {
  await requireAdmin();

  const listId = MailingListIdInputSchema.parse(id);
  const list = unwrap(await resend.segments.get(listId));
  const members = await listMembers(listId);

  return MailingListDetailOutputSchema.parse({
    ...list,
    subscribers: members.map((member) => ({
      ...member,
      firstName: member.first_name,
      lastName: member.last_name,
    })),
  });
}

/**
 * Creates a mailing list.
 *
 * @param mailingList - The list's name.
 * @returns The new list's ID.
 * @throws If you're not an admin, the name is wrong or taken, or Resend has a
 * problem.
 */
export async function create(
  mailingList: MailingListInputDTO,
): Promise<MailingListIdOutputDTO> {
  await requireAdmin();

  const { name } = MailingListInputSchema.parse(mailingList);
  await assertNameIsAvailable(name);

  return MailingListIdOutputSchema.parse(
    unwrap(await resend.segments.create({ name })),
  );
}

/**
 * Renames a mailing list.
 *
 * @param id - The mailing list's ID.
 * @param mailingList - The new name.
 * @returns The list's ID.
 * @throws If you're not an admin, the name is wrong or taken, or Resend has a
 * problem.
 */
export async function update(
  id: string,
  mailingList: MailingListInputDTO,
): Promise<MailingListIdOutputDTO> {
  await requireAdmin();

  const listId = MailingListIdInputSchema.parse(id);
  const { name } = MailingListInputSchema.parse(mailingList);
  await assertNameIsAvailable(name, listId);

  return MailingListIdOutputSchema.parse(
    unwrap(await resend.segments.update(listId, { name })),
  );
}

/**
 * Deletes a mailing list. Everyone on it stays a subscriber.
 *
 * @param id - The mailing list's ID.
 * @returns The deleted list's ID.
 * @throws If you're not an admin or Resend has a problem.
 */
export async function remove(id: string): Promise<MailingListIdOutputDTO> {
  await requireAdmin();

  return MailingListIdOutputSchema.parse(
    unwrap(await resend.segments.remove(MailingListIdInputSchema.parse(id))),
  );
}

/**
 * Adds a subscriber to a mailing list.
 *
 * @remarks
 * They need to already be a subscriber (a Resend contact).
 *
 * @param member - The list's ID and the subscriber's email.
 * @returns The subscriber's ID.
 * @throws If you're not an admin, the input is wrong, or Resend has a
 * problem (like the subscriber not existing).
 */
export async function addSubscriber(
  member: MailingListMemberInputDTO,
): Promise<MailingListIdOutputDTO> {
  await requireAdmin();

  const { mailingListId, email } = MailingListMemberInputSchema.parse(member);

  return MailingListIdOutputSchema.parse(
    unwrap(
      await resend.contacts.segments.add({ email, segmentId: mailingListId }),
    ),
  );
}

/**
 * Takes a subscriber off a mailing list. They stay a subscriber.
 *
 * @param member - The list's ID and the subscriber's email.
 * @returns The subscriber's ID.
 * @throws If you're not an admin, the input is wrong, or Resend has a problem.
 */
export async function removeSubscriber(
  member: MailingListMemberInputDTO,
): Promise<MailingListIdOutputDTO> {
  await requireAdmin();

  const { mailingListId, email } = MailingListMemberInputSchema.parse(member);

  return MailingListIdOutputSchema.parse(
    unwrap(
      await resend.contacts.segments.remove({
        email,
        segmentId: mailingListId,
      }),
    ),
  );
}
