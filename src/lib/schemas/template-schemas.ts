import z from "zod";

export const CreatePostTemplateSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title is too long"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(150, "Description is too long"),
    pageContent: z
        .string()
        .min(10, "Content must be at least 10 characters long"),
});