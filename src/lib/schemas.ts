
import * as z from "zod";

import {
  AllowedMediaType,
  maxTextInputLength,
  maxTextAreaLength, AllowedTagType
} from "@/lib/constants";

export type CatalogItem = z.infer<typeof CatalogItemSchema>;
export type RequestForm = z.infer<typeof RequestFormSchema>;
export type LoginForm = z.infer<typeof LoginFormSchema>;
export type CreateUserForm = z.infer<typeof CreateUserSchema>;
export type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;
export type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;
export type InviteUserForm = z.infer<typeof InviteUserSchema>;
export type RegisterUserForm = z.infer<typeof RegisterUserSchema>;
export type CreateTagFom = z.infer<typeof CreateTagSchema>;

const httpUrl = z.url({
  protocol: /^https?$/,
  hostname: z.regexes.hostname
});

export const CatalogItemSchema = z.object({
  author: z.string().default("Unknown Author"),
  datePosted: z.date().default(new Date()),
  slug: z.string().default(""),
  title: z.string().default(""),
  rating: z.number().positive().default(0),
  releaseYear: z.string().default(""),
  posterUrl: httpUrl.default(""),
  mediaType: z.string().default(AllowedMediaType.Book)
});

export const CreateUserSchema = z.object({
  name: z
    .string()
    .max(maxTextInputLength, `Max of ${maxTextInputLength} characters allowed`)
    .min(3, "Must be at least 3 characters")
    .nonempty("Required"),
  email: z.email().nonempty("Required"),
  password: z
    .string()
    .refine((val) => /[^a-zA-Z0-9]/.test(val), "Must contain one special character")
    .refine((val) => /[0-9]/.test(val), "Must contain one number")
    .refine((val) => /[A-Z]/.test(val), "Must contain one uppercase letter")
    .min(8, "Must be at least 8 characters")
    .nonempty("Required")
});

export const RequestFormSchema = z.object({
  name: z.string().max(maxTextInputLength).optional(),
  email: z.email({ error: "Invalid Email" }).nonempty({ error: "Required" }),
  title: z.string().max(maxTextInputLength).nonempty({ error: "Required" }),
  mediaType: z.string().nonempty("Required"),
  message: z.string().max(maxTextAreaLength).optional()
});

export const LoginFormSchema = z.object({
  email: z.email({ error: "Invalid email"}).nonempty({ error: "Required" }),
  password: z.string().nonempty({ error: "Required" })
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().nonempty({ error: "Required" }),
  newPassword: z.string().nonempty({ error: "Required" }),
});

export const ForgotPasswordSchema = LoginFormSchema.pick({
  email: true
});

export const ResetPasswordSchema = LoginFormSchema.pick({
  password: true,
});

export const RegisterUserSchema = CreateUserSchema.extend({
  confirmPassword: z.string().nonempty("Required")
}).superRefine(({ confirmPassword, password }, ctx) => {
  if(confirmPassword !== password) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords must match",
      path: ["confirmPassword"]
    });
  }
});

// Validates the email input in the InviteUserModal
export const InviteUserSchema = z.object({
  email: z.email({ error: "Invalid email address"})
    .trim()
    .toLowerCase()
    .min(1, { message: "Required" })
    .max(255, { message: "Email is too long" })
});

export const ChangeUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(128, "Username must be less than 128 characters")
    .regex(
      /^[a-zA-Z0-9_-\s]+$/,
      "Username can only contain letters, spaces, numbers, underscores, and hyphens"
    ),
});

export type ChangeUsernameForm = z.infer<typeof ChangeUsernameSchema>;

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and dashes allowed"),
  posterUrl: z
    .httpUrl("Invalid Url")
    .nullable()
    .or(z.literal("")),
  mediaTagId: z
    .number()
    .min(1, "Required"),
  pageContent: z
    .string()
    .min(10, "Content must be at least 10 characters long"),
});

export const CreateTagSchema = z.object({
  name: z
    .string()
    .min(3, "Display name must be at least 3 characters.")
    .max(128, "Display name must be less than 128 characters."),
  type: z.enum(AllowedTagType)
})

export const EditUserSchema = z.object({
  name: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(128, "Username must be less than 128 characters")
    .regex(
      /^[a-zA-Z0-9_\- ]+$/,
      "Username can only contain letters, numbers, underscores, spaces and hyphens"
    ),
  role: z
    .enum(["Admin", "User"])
})