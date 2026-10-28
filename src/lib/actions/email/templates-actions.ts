"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import * as email from "@/lib/dal/dto/email";
import type { EmailTemplateForm } from "@/lib/schemas/email/templates-schemas";

/**
 * Runs a create/update/delete, refreshes the email pages, and turns errors
 * into a result that the UI can show.
 *
 * @param verb - The action name used in the log message (e.g. "create").
 * @param mutation - The DAL call to run.
 * @returns `{ error: null, success: true }` or `{ error: string, success: false }`.
 */
async function runMutation(verb: string, mutation: () => Promise<unknown>) {
  try {
    await mutation();
    return { error: null, success: true };
  } catch (error) {
    console.error(`Failed to ${verb} email template:`, error);
    return { error: getErrorMessage(error), success: false };
  } finally {
    revalidatePath("/dashboard/email", "layout");
  }
}

/**
 * Picks the error message to show the user for a failed mutation.
 *
 * @remarks
 * Only admins can use these actions, so error messages from the DAL and
 * Resend (like a taken name) are shown as-is to explain what went wrong.
 *
 * @param error - The error thrown by the DAL.
 * @returns The validation message, the error's message, or a generic fallback.
 */
function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0].message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

/**
 * Server action wrapper for {@link email.templates.list}.
 */
export async function list() {
  return email.templates.list();
}

/**
 * Server action wrapper for {@link email.templates.get}.
 *
 * @param id - The Resend ID of the template.
 */
export async function get(id: string) {
  return email.templates.get(id);
}

/**
 * Server action wrapper for {@link email.templates.create}.
 *
 * @param template - The name, subject, and HTML content of the template.
 */
export async function create(template: EmailTemplateForm) {
  return runMutation("create", () => email.templates.create(template));
}

/**
 * Server action wrapper for {@link email.templates.update}.
 *
 * @param id - The Resend ID of the template to update.
 * @param template - The new name, subject, and HTML content.
 */
export async function update(id: string, template: EmailTemplateForm) {
  return runMutation("update", () => email.templates.update(id, template));
}

/**
 * Server action wrapper for {@link email.templates.remove}.
 *
 * @param id - The Resend ID of the template to delete.
 */
export async function remove(id: string) {
  return runMutation("delete", () => email.templates.remove(id));
}
