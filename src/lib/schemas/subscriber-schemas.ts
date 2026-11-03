import { z } from "zod";

/** Validates subscriber details accepted by Resend. */
export const SubscriberSchema = z.object({
  email: z.email(),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
});

/** Validates a Resend subscriber ID. */
export const SubscriberIdSchema = z
  .string()
  .trim()
  .min(1, "Subscriber ID is required");

export type SubscriberForm = z.infer<typeof SubscriberSchema>;
