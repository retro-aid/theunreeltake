import * as z from "zod";
import { AllowedTagType } from "@/lib/constants";

export const CreateTagSchema = z.object({
  name: z
    .string()
    .min(3, "Display name must be at least 3 characters.")
    .max(128, "Display name must be less than 128 characters."),
  type: z.enum(AllowedTagType),
});

/**
 * Checks that a tag ID is a positive whole number.
 *
 * @remarks
 * Server actions can be called with anything, so the DAL runs IDs through this
 * before hitting the database.
 */
export const TagIdSchema = z.number().int().positive();

export type CreateTagForm = z.infer<typeof CreateTagSchema>;
