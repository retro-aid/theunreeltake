import * as z from "zod";

/**
 * The fields every mailing list schema shares.
 */
const MailingListSchema = z.object({
  name: z.string(),
});

/**
 * Checks a mailing list before it's saved.
 */
export const MailingListInputSchema = MailingListSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
});

/**
 * Makes sure the mailing list ID isn't blank.
 */
export const MailingListIdInputSchema = z
  .string()
  .trim()
  .min(1, "Mailing list ID is required");

/**
 * Checks who's being added to or removed from a mailing list.
 */
export const MailingListMemberInputSchema = z.object({
  mailingListId: MailingListIdInputSchema,
  email: z.string().trim().pipe(z.email("Enter a valid email")),
});

/**
 * One row in the mailing lists list.
 */
export const MailingListOutputSchema = MailingListSchema.extend({
  id: z.string(),
});

/**
 * One person on a mailing list.
 */
export const MailingListSubscriberOutputSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  unsubscribed: z.boolean(),
});

/**
 * One mailing list with everyone on it, for the detail view.
 */
export const MailingListDetailOutputSchema = MailingListOutputSchema.extend({
  subscribers: z.array(MailingListSubscriberOutputSchema),
});

/**
 * What create, update, delete, and adding or removing someone send back.
 */
export const MailingListIdOutputSchema = z.object({ id: z.string() });

/** What create and update accept. */
export type MailingListInputDTO = z.input<typeof MailingListInputSchema>;
/** Who to add to or remove from which list. */
export type MailingListMemberInputDTO = z.input<
  typeof MailingListMemberInputSchema
>;
/** One row in the mailing lists list. */
export type MailingListOutputDTO = z.output<typeof MailingListOutputSchema>;
/** One mailing list with everyone on it. */
export type MailingListDetailOutputDTO = z.output<
  typeof MailingListDetailOutputSchema
>;
/** The `{ id }` that changes return. */
export type MailingListIdOutputDTO = z.output<typeof MailingListIdOutputSchema>;
