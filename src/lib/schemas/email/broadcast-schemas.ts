import * as z from "zod";
import { resendFrom } from "@/lib/dal/dto/email/resend";
import { PaginationSchema } from "@/lib/schemas/email/util-schemas";

export type CreateBroadcastInputDTO = z.input<
  typeof CreateBroadcastInputSchema
>;
export type CreateBroadcastOutputDTO = z.output<
  typeof CreateBroadcastOutputSchema
>;
export type ListBroadcastInputDTO = z.input<typeof ListBroadcastInputSchema>;
export type ListBroadcastItemDTO = z.output<typeof ListBroadcastItemSchema>;
export type ListBroadcastOutputDTO = z.output<typeof ListBroadcastOutputSchema>;

/**
 * Validates the create broadcast options passed to Resend
 *
 * @param segmentId - The segment that this broadcast should be sent out to
 * @param from - The email that the broadcast will be sent from
 * @param subject - The subject for this broadcast
 * @param html - The email message content for this broadcast
 * @param scheduledAt - The {@link Date} that this email will be sent at. Must be formatted as ISO string
 */
export const CreateBroadcastInputSchema = z.object({
  segmentId: z.string(),
  from: z.string().nonempty().default(resendFrom),
  subject: z.string(),
  html: z.string(),
  scheduledAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export const CreateBroadcastOutputSchema = z.object({
  id: z.string(),
});

export const ListBroadcastInputSchema = PaginationSchema;

export const ListBroadcastItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  segment_id: z.string().nullable(),
  status: z.literal(["draft", "sent", "scheduled", "queued", "canceled"]),
  created_at: z.string(),
  scheduled_at: z.string().nullable(),
  sent_at: z.string().nullable(),
});

export const ListBroadcastOutputSchema = z.object({
  has_more: z.boolean(),
  data: z.array(ListBroadcastItemSchema),
});
