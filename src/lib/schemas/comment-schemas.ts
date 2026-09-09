import z from "zod";

export const AnonymousCommentFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(64, "Username must be less than 64 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username may contain letters, numbers, underscores and hyphens"
    )
    .optional(),
  email: z.string().optional(),
  message: z.string().nonempty().max(500)
});

export type AnonymousCommentForm = z.infer<typeof AnonymousCommentFormSchema>;