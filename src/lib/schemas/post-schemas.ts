import z from "zod";

export const CreatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Only lowercase letters, numbers, and dashes allowed",
    ),
  posterUrl: z.httpUrl("Invalid Url").nullable().or(z.literal("")),
  imageUrls: z.array(z.httpUrl("Invalid Url").or(z.literal(""))).max(2),
  mediaTagId: z.array(z.string()).default([]),
  pageContent: z
    .string()
    .min(10, "Content must be at least 10 characters long"),
});