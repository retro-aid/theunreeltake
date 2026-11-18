import * as z from "zod";
import { PaginationSchema } from "@/lib/schemas/email/util-schemas";
import { ContactListItemSchema } from "@/lib/schemas/email/subscriber-schemas";

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

const MailingListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string(),
});

export const ListMailingListOutputSchema = z.object({
  has_more: z.boolean(),
  data: z.array(MailingListItemSchema),
});

export const ListMailingListContactsInputSchema = z
  .object({
    segmentId: z.string(),
  })
  .and(PaginationSchema);

export const ListMailingListContactsOutputSchema = z.object({
  has_more: z.boolean(),
  data: z.array(ContactListItemSchema),
});

export const CreateMailingListInputSchema = z.object({
  name: z.string().nonempty(),
});

export const CreateMailingListOutputSchema = z.object({
  name: z.string(),
  id: z.string(),
});

export const RemoveMailingListInputSchema = z.string();

export const RemoveMailingListOutputSchema = z.object({
  id: z.string(),
  deleted: z.boolean(),
});

export const ContactToMailingListInputSchema = z.object({
  contactId: z.string().nonempty(),
  segmentId: z.string(),
});

export const AddContactToMailingListOutputSchema = z.object({
  id: z.string(),
});

export const RemoveContactFromMailingListOutputSchema =
  AddContactToMailingListOutputSchema.extend({
    deleted: z.boolean(),
  });

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

export type MailingListItemOutputDTO = z.output<typeof MailingListItemSchema>;

export type ListMailingListInputDTO = z.input<typeof PaginationSchema>;
export type ListMailingListOutputDTO = z.output<
  typeof ListMailingListOutputSchema
>;

export type ListMailingListContactsInputDTO = z.input<
  typeof ListMailingListContactsInputSchema
>;
export type ListMailingListContactOutputDTO = z.output<
  typeof ListMailingListContactsOutputSchema
>;

export type CreateMailingListInputDTO = z.input<
  typeof CreateMailingListInputSchema
>;
export type CreateMailingListOutputDTO = z.output<
  typeof CreateMailingListOutputSchema
>;

export type RemoveMailingListInputDTO = z.input<
  typeof RemoveMailingListInputSchema
>;
export type RemoveMailingListOutputDTO = z.output<
  typeof RemoveMailingListOutputSchema
>;

export type ContactToMailingListInputDTO = z.input<
  typeof ContactToMailingListInputSchema
>;

export type AddContactToMailingListOutputDTO = z.output<
  typeof AddContactToMailingListOutputSchema
>;

export type RemoveContactFromMailingListOutputDTO = z.output<
  typeof RemoveContactFromMailingListOutputSchema
>;
