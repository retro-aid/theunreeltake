import "server-only";
import { requireAdmin } from "@/lib/dal/utils";
import { resend, unwrap } from "./resend";
import type { ListContactsOptions } from "resend";
import type {
  ListSubscribersInputDTO,
  ListSubscriberOutputDTO,
  RemoveSubscriberInputDTO,
  RemoveSubscriberOutputDTO,
  CreateSubscriberInputDTO,
  CreateSubscriberOutputDTO,
} from "@/lib/schemas/email/subscriber-schemas";
import {
  ListSubscriberInputSchema,
  ListSubscriberOutputSchema,
  CreateSubscriberInputSchema,
  CreateSubscriberOutputSchema,
  RemoveSubscriberInputSchema,
  RemoveSubscriberOutputSchema,
} from "@/lib/schemas/email/subscriber-schemas";

/**
 * Retrieves every subscriber in the configured Resend segment.
 *
 * @returns All subscriber contacts in the audience.
 * @throws If the user is not an admin, the audience is not configured, or
 * Resend fails.
 */
export async function list(
  params: ListSubscribersInputDTO,
): Promise<ListSubscriberOutputDTO> {
  await requireAdmin();

  //Apply any defaults
  const validatedParams = ListSubscriberInputSchema.parse(params);

  const { paginateOption, limit } = validatedParams;

  const options: ListContactsOptions = {
    limit: limit,
  };

  if (paginateOption === "after") options.after = validatedParams.after;
  else if (paginateOption === "before") options.before = validatedParams.before;

  const resolvedResponse = unwrap(await resend.contacts.list(options));

  return ListSubscriberOutputSchema.parse(resolvedResponse);
}

/**
 * Deletes a subscriber from the configured Resend audience.
 *
 * @param params.id The id of the subscriber to remove
 * @returns The deleted contact data.
 * @throws If the user is not an admin, the ID is invalid, or Resend fails.
 */
export async function remove(
  params: RemoveSubscriberInputDTO,
): Promise<RemoveSubscriberOutputDTO> {
  await requireAdmin();

  const validatedParams = RemoveSubscriberInputSchema.parse(params);

  const resolvedResponse = unwrap(
    await resend.contacts.remove(validatedParams),
  );

  return RemoveSubscriberOutputSchema.parse(resolvedResponse);
}

/**
 * Signs up a subscriber through the public newsletter form.
 *
 * @param params Subscriber email and optional name fields.
 * @returns The created contact data.
 * @throws If the input is invalid or Resend fails.
 */
export async function create(
  params: CreateSubscriberInputDTO,
): Promise<CreateSubscriberOutputDTO> {
  await requireAdmin();

  const validatedParams = CreateSubscriberInputSchema.parse(params);

  const resolvedResponse = unwrap(
    await resend.contacts.create(validatedParams),
  );

  return CreateSubscriberOutputSchema.parse(resolvedResponse);
}
