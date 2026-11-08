import { z } from "zod";
import { PaginationSchema } from "@/lib/schemas/email/util-schemas";

export type CreateSubscriberInputDTO = z.input<
  typeof CreateSubscriberInputSchema
>;

export type CreateSubscriberOutputDTO = z.output<
  typeof CreateSubscriberOutputSchema
>;

export type RemoveSubscriberInputDTO = z.input<
  typeof RemoveSubscriberInputSchema
>;

export type RemoveSubscriberOutputDTO = z.output<
  typeof RemoveSubscriberOutputSchema
>;

export type ListSubscribersInputDTO = z.input<typeof ListSubscriberInputSchema>;

export type ListSubscriberOutputDTO = z.output<
  typeof ListSubscriberOutputSchema
>;

const SegmentListItemSchema = z.object({
  id: z.string(),
});

const ContactIdSchema = z.object({
  id: z.string(),
});

const ContactListItemSchema = z.object({
  id: z.string(),
  email: z.email(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  created_at: z.string(),
  unsubscribed: z.boolean(),
});

export const CreateSubscriberInputSchema = z.object({
  email: z.email(),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  segments: z.array(SegmentListItemSchema).optional(),
});

export const CreateSubscriberOutputSchema = ContactIdSchema;

export const RemoveSubscriberInputSchema = ContactIdSchema;

export const RemoveSubscriberOutputSchema = z.object({
  contact: z.string(),
  deleted: z.boolean(),
});

export const ListSubscriberInputSchema = z
  .object({
    segmentId: z.string().optional(),
  })
  .and(PaginationSchema);

export const ListSubscriberOutputSchema = z.object({
  has_more: z.boolean(),
  data: z.array(ContactListItemSchema),
});
