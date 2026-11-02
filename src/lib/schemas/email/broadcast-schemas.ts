import * as z from "zod";
import { resendFrom } from "@/lib/dal/dto/email/resend";
import { PaginationSchema } from "@/lib/schemas/email/util-schemas";

export type CreateBroadcastFormInput = z.input<typeof CreateBroadcastSchema>;
export type ListBroadcastFormInput = z.input<typeof ListBroadcastSchema>;

/**
 * Validates the create broadcast options passed to Resend
 *
 * @param segmentId - The segment that this broadcast should be sent out to
 * @param from - The email that the broadcast will be sent from
 * @param subject - The subject for this broadcast
 * @param html - The email message content for this broadcast
 * @param scheduledAt - The {@link Date} that this email will be sent at. Must be formatted as ISO string
 */
export const CreateBroadcastSchema = z.object({
  segmentId: z.string(),
  from: z.string().nonempty().default(resendFrom),
  subject: z.string(),
  html: z.string(),
  scheduledAt: z.iso.datetime().default(() => new Date().toISOString()),
});

/**
 * Validates the list broadcast options passed to Resend
 *
 * @remarks
 * Uses the default list pagination schema
 */
export const ListBroadcastSchema = PaginationSchema;
