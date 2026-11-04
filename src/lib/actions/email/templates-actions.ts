"use server";

import * as email from "@/lib/dal/dto/email";
import { toResult } from "@/lib/errors";
import type { EmailTemplateForm } from "@/lib/schemas/email/templates-schemas";

const EMAIL_PAGES = "/dashboard/email";

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
  return toResult(() => email.templates.create(template), EMAIL_PAGES);
}

/**
 * Server action wrapper for {@link email.templates.update}.
 *
 * @param id - The Resend ID of the template to update.
 * @param template - The new name, subject, HTML content, variables, and
 * whether to publish the changes.
 */
export async function update(id: string, template: EmailTemplateForm) {
  return toResult(() => email.templates.update(id, template), EMAIL_PAGES);
}

/**
 * Server action wrapper for {@link email.templates.remove}.
 *
 * @param id - The Resend ID of the template to delete.
 */
export async function remove(id: string) {
  return toResult(() => email.templates.remove(id), EMAIL_PAGES);
}
