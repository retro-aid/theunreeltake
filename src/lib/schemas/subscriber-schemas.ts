import z from "zod";

/** Input fields accepted when creating a subscriber. */
export const CreateSubscriberSchema = z.object({
  firstName: z.string().trim().max(100).optional().nullable(),
  lastName: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().pipe(z.email()),
});

/** Editable subscriber fields accepted by the update operation. */
export const UpdateSubscriberSchema = z
  .object({
    firstName: z.string().trim().max(100).optional().nullable(),
    lastName: z.string().trim().max(100).optional().nullable(),
    email: z.string().trim().pipe(z.email()).optional(),
  })
  .refine((subscriber) => Object.keys(subscriber).length > 0, {
    message: "At least one subscriber field must be provided.",
  });

export type CreateSubscriberInput = z.infer<typeof CreateSubscriberSchema>;
export type UpdateSubscriberInput = z.infer<typeof UpdateSubscriberSchema>;
