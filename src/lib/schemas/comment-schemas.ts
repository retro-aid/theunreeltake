import z from "zod";

export const AnonymousCommentFormSchema = z.object({
  username: z
    .string()
    .max(64, "Username must be less than 64 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$|/,
      "Username may contain letters, numbers, underscores and hyphens"
    )
    .nullable(),
  email: z.string().optional(),
  message: z.string().nonempty().max(500)
});

export type AnonymousCommentForm = z.infer<typeof AnonymousCommentFormSchema>;