import "server-only";
import type { Contact } from "resend";
import { requireAdmin } from "@/lib/dal/utils";
import {
  SubscriberIdSchema,
  SubscriberSchema,
  type SubscriberForm,
} from "@/lib/schemas/subscriber-schemas";
import { resend } from "./resend";

type ContactListResponse = Awaited<ReturnType<typeof resend.contacts.list>>;

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
 * @returns Resend's response containing all available subscriber contacts.
 * @throws If the user is not an admin or the audience is not configured.
 */
export async function list(): Promise<ContactListResponse> {
  await requireAdmin();
  const audienceId = getAudienceId();
  const subscribers: Contact[] = [];
  let cursor: string | undefined;
  let headers: ContactListResponse["headers"] = null;
  let hasMore = false;

  do {
    const response = await resend.contacts.list({
      audienceId,
      limit: 100,
      after: cursor,
    });
    if (response.error) return response;

    headers = response.headers;
    subscribers.push(...response.data.data);
    hasMore = response.data.has_more;
    cursor = response.data.has_more
      ? response.data.data.at(-1)?.id
      : undefined;
    if (response.data.has_more && !cursor) {
      break;
    }
  } while (cursor);

  return {
    data: { object: "list", data: subscribers, has_more: hasMore },
    error: null,
    headers,
  };
}

/**
 * Adds a subscriber from the administrator dashboard.
 *
 * @param input Subscriber email and optional name fields.
 * @returns Resend's contact creation response.
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
 * @returns Resend's contact deletion response.
 * @throws If the user is not an admin, the ID is invalid, or Resend fails.
 */
export async function remove(id: string) {
  await requireAdmin();
  const contactId = SubscriberIdSchema.parse(id);
  return resend.contacts.remove({
    id: contactId,
    audienceId: getAudienceId(),
  });
}

/**
 * Validates subscriber details and creates a Resend contact.
 *
 * @param input Subscriber email and optional name fields.
 * @returns Resend's contact creation response.
 * @throws If the input is invalid or Resend fails.
 */
async function createContact(input: SubscriberForm) {
  const subscriber = SubscriberSchema.parse(input);
  return resend.contacts.create({
    audienceId: getAudienceId(),
    email: subscriber.email,
    firstName: subscriber.firstName || undefined,
    lastName: subscriber.lastName || undefined,
  });
}

/**
 * Signs up a subscriber through the public newsletter form.
 *
 * @param input Subscriber email and optional name fields.
 * @returns Resend's contact creation response.
 * @throws If the input is invalid or Resend fails.
 */
export async function create(input: SubscriberForm) {
  return createContact(input);
}
