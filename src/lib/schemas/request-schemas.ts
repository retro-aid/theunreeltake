import z from "zod";
import {
  maxTextInputLength,
  maxTextAreaLength,
} from "@/lib/constants";


export type RequestForm = z.infer<typeof RequestFormSchema>;

export const RequestFormSchema = z.object({
  name: z.string().max(maxTextInputLength).optional(),
  email: z.email({ error: "Invalid Email" }).nonempty({ error: "Required" }),
  title: z.string().max(maxTextInputLength).nonempty({ error: "Required" }),
  mediaType: z.string().nonempty("Required"),
  message: z.string().max(maxTextAreaLength).optional(),
});