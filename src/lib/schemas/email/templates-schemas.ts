import * as z from "zod";

const RESERVED_VARIABLE_KEYS = [
  "FIRST_NAME",
  "LAST_NAME",
  "EMAIL",
  "RESEND_UNSUBSCRIBE_URL",
  "contact",
  "this",
];

const variableKey = z
  .string()
  .trim()
  .min(1, "Variable key is required")
  .refine(
    (key) => !RESERVED_VARIABLE_KEYS.includes(key),
    "That variable name is reserved by Resend",
  );

/**
 * Validates one template variable: a placeholder like `{{{NAME}}}` in the
 * HTML that gets filled in when the email is sent
 *
 * @remarks
 * Tha fallback value is used when no value is given at send time
 */
export const TemplateVariableSchema = z.discriminatedUnion("type", [
  z.object({
    key: variableKey,
    type: z.literal("string"),
    fallbackValue: z.string().nullable().optional(),
  }),
  z.object({
    key: variableKey,
    type: z.literal("number"),
    fallbackValue: z.number().nullable().optional(),
  }),
]);

/**
 * Validates the fields of an email template before it is sent to Resend.
 */
export const EmailTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject is too long"),
  html: z.string().min(1, "Content is required"),
  variables: z
    .array(TemplateVariableSchema)
    .max(50, "A template can have at most 50 variables")
    .refine(
      (variables) =>
        new Set(variables.map((v) => v.key)).size === variables.length,
      "Variable keys must be unique",
    )
    .optional(),
  publish: z.boolean(),
});

/**
 * Checks that a template ID isn't empty.
 *
 * @remarks
 * An empty ID would call Resend's list endpoint instead of a single template.
 */
export const TemplateIdSchema = z
  .string()
  .trim()
  .min(1, "Template ID is required");

export type EmailTemplateForm = z.infer<typeof EmailTemplateSchema>;
export type TemplateVariableForm = z.infer<typeof TemplateVariableSchema>;
