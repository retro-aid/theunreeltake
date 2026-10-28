"use server";

import { revalidatePath } from "next/cache";
import * as email from "@/lib/dal/dto/email";
import { toResult } from "@/lib/errors";
import type { EmailTemplateForm } from "@/lib/schemas/email/templates-schemas";

/**
 * Runs a create/update/delete, returns the standard result, and refreshes
 * the email pages.
 *
 * @remarks
 * The pages are refreshed even when the mutation fails, because a failed
 * publish still saves a draft that should show up in the list.
 *
 * @param mutation - The DAL call to run.
 * @returns The DAL call's result in the standard `{ data, error }` shape.
 */
async function runMutation<T>(mutation: () => Promise<T>) {
  const result = await toResult(mutation);
  revalidatePath("/dashboard/email", "layout");
  return result;
}

/**
 * Server action wrapper for {@link email.templates.list}.
 */
export async function list() {
  return toResult(() => email.templates.list());
}

/**
 * Server action wrapper for {@link email.templates.get}.
 *
 * @param id - The Resend ID of the template.
 */
export async function get(id: string) {
  return toResult(() => email.templates.get(id));
}

/**
 * Server action wrapper for {@link email.templates.create}.
 *
 * @param template - The name, subject, HTML content, variables, and whether
 * to publish the template.
 */
export async function create(template: EmailTemplateForm) {
  return runMutation(() => email.templates.create(template));
}

/**
 * Server action wrapper for {@link email.templates.update}.
 *
 * @param id - The Resend ID of the template to update.
 * @param template - The new name, subject, HTML content, variables, and
 * whether to publish the changes.
 */
export async function update(id: string, template: EmailTemplateForm) {
  return runMutation(() => email.templates.update(id, template));
}

/**
 * Server action wrapper for {@link email.templates.remove}.
 *
 * @param id - The Resend ID of the template to delete.
 */
export async function remove(id: string) {
  return runMutation(() => email.templates.remove(id));
}
