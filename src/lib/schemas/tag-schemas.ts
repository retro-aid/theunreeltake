import * as z from "zod";
import { AllowedTagType } from "@/lib/constants";

export const CreateTagSchema = z.object({
  name: z
    .string()
    .min(3, "Display name must be at least 3 characters.")
    .max(128, "Display name must be less than 128 characters."),
  type: z.enum(AllowedTagType),
});

export type CreateTagForm = z.infer<typeof CreateTagSchema>;
