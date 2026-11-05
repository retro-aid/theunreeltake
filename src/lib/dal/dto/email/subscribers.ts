import "server-only";
import type { Contact } from "resend";
import { requireAdmin } from "@/lib/dal/utils";
import {
  SubscriberIdSchema,
  SubscriberSchema,
  type SubscriberForm,
} from "@/lib/schemas/subscriber-schemas";
import { resend, unwrap } from "./resend";

/**
 * Returns the configured Resend audience identifier.
 *
 * @returns The Resend audience ID.
 * @throws If no audience ID is configured.
 */
function getAudienceId(): string {
  const id = process.env.RESEND_AUDIENCE_ID;
  if (!id) throw new Error("Resend audience is not configured.");
  return id;
}

/**
 * Retrieves every subscriber in the configured Resend audience.
 *
 * @returns All subscriber contacts in the audience.
 * @throws If the user is not an admin, the audience is not configured, or
 * Resend fails.
 */
export async function list(): Promise<Contact[]> {
  await requireAdmin();
  const audienceId = getAudienceId();
  const subscribers: Contact[] = [];
  let cursor: string | undefined;

  do {
    const page = unwrap(
      await resend.contacts.list({
        audienceId,
        limit: 100,
        after: cursor,
      }),
    );

    subscribers.push(...page.data);
    cursor = page.has_more ? page.data.at(-1)?.id : undefined;
    if (page.has_more && !cursor) break;
  } while (cursor);

  return subscribers;
}

/**
 * Adds a subscriber from the administrator dashboard.
 *
 * @param input Subscriber email and optional name fields.
 * @returns The created contact data.
 * @throws If the user is not an admin, the input is invalid, or Resend fails.
 */
export async function add(input: SubscriberForm) {
  await requireAdmin();
  return createContact(input);
}

/**
 * Deletes a subscriber from the configured Resend audience.
 *
 * @param id Resend contact ID.
 * @returns The deleted contact data.
 * @throws If the user is not an admin, the ID is invalid, or Resend fails.
 */
export async function remove(id: string) {
  await requireAdmin();
  const contactId = SubscriberIdSchema.parse(id);
  return unwrap(
    await resend.contacts.remove({
      id: contactId,
      audienceId: getAudienceId(),
    }),
  );
}

/**
 * Validates subscriber details and creates a Resend contact.
 *
 * @param input Subscriber email and optional name fields.
 * @returns The created contact data.
 * @throws If the input is invalid or Resend fails.
 */
async function createContact(input: SubscriberForm) {
  const subscriber = SubscriberSchema.parse(input);
  return unwrap(
    await resend.contacts.create({
      audienceId: getAudienceId(),
      email: subscriber.email,
      firstName: subscriber.firstName || undefined,
      lastName: subscriber.lastName || undefined,
    }),
  );
}

/**
 * Signs up a subscriber through the public newsletter form.
 *
 * @param input Subscriber email and optional name fields.
 * @returns The created contact data.
 * @throws If the input is invalid or Resend fails.
 */
export async function create(input: SubscriberForm) {
  return createContact(input);
}
