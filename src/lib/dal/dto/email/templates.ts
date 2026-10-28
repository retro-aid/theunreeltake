import "server-only";
import { requireAdmin } from "@/lib/dal/utils";
import {
  EmailTemplateSchema,
  TemplateIdSchema,
  type EmailTemplateForm,
  type TemplateVariableForm,
} from "@/lib/schemas/email/templates-schemas";
import { resend, unwrap } from "./resend";

/**
 * Makes sure no other template currently uses this name.
 *
 * @remarks
 * Resend allows duplicate names, so this checks the current names itself.
 * Names are compared ignoring case, so "Welcome" and "welcome" count as the
 * same name.
 *
 * @param name - The template name to check.
 * @param id - The ID of the template being updated, so it doesn't match itself.
 * @throws If another template already has the name.
 */
async function assertNameIsAvailable(name: string, id?: string) {
  const { data } = unwrap(await resend.templates.list({ limit: 100 }));
  const taken = data.some(
    (t) => t.name.toLowerCase() === name.toLowerCase() && t.id !== id,
  );

  if (taken) throw new Error("A template with that name already exists");
}

/**
 * Publishes a template, explaining that it was still saved if publishing fails.
 *
 * @remarks
 * Create and update save the template before publishing it, so a failed
 * publish still leaves a draft. Saying so stops the admin from retrying a
 * create and hitting the duplicate-name error for their own draft.
 *
 * @param id - The Resend ID of the template to publish.
 * @throws If Resend fails to publish the template.
 */
async function publishTemplate(id: string) {
  const { error } = await resend.templates.publish(id);

  if (error)
    throw new Error(
      `The template was saved as a draft, but publishing failed: ${error.message}`,
    );
}

/**
 * Retrieves every email templates stored in Resend.
 *
 *@remarks
 *Each items only includes the ID, name, status, and dates. Resend's list
 *doesn't return the subject or HTML. Use this for the templates table, and
 *{@link get} to load one template's full content
 * @returns A promise resolving to the templates' ID, name, status, and dates.
 * @throws If the user is not an admin or the Resend request fails.
 */
export async function list() {
  await requireAdmin();

  return unwrap(await resend.templates.list({ limit: 100 })).data;
}

/**
 * Retrieves a single email template by its ID.
 *
 * @remarks
 * Use this to load a template into the editor. To list all templates, use
 * {@link list}. That returns a summary without the subject or
 * HTML.
 * Resend returns each variable's fallback as `fallback_value`, but create and
 * update expect `fallbackValue`. The variables are converted here so the UI
 * can send them straight back to {@link update} without losing fallbacks.
 *
 * @param id - The Resend ID of the template.
 * @returns A promise resolving to the template and its content .
 * @throws If the user is not an admin or no template exists.
 */
export async function get(id: string) {
  await requireAdmin();

  const template = unwrap(
    await resend.templates.get(TemplateIdSchema.parse(id)),
  );
  const variables = (template.variables ?? []).map(
    (v) =>
      ({
        key: v.key,
        type: v.type,
        fallbackValue: v.fallback_value,
      }) as TemplateVariableForm,
  );

  return { ...template, variables };
}

/**
 * Creates a new email template in Resend and publishes it when publish is true.
 *
 * @param template - The name, subject, HTML content of the template, variables,
 * and publish.
 * @returns A promise resolving to the new template's ID.
 * @throws If the user is not an admin, the input is invalid, or the name is taken.
 */
export async function create(template: EmailTemplateForm) {
  await requireAdmin();

  const { publish, ...fields } = EmailTemplateSchema.parse(template);
  await assertNameIsAvailable(fields.name);

  const { id } = unwrap(await resend.templates.create(fields));
  if (publish) await publishTemplate(id);

  return { id };
}

/**
 * Updates an existing email template and publishes when publish is true.
 *
 * @remarks 'variables' replaces the template's whole variable list, so send every
 * variable that the template should keep. An empty array removes all of them.
 * @param id - the ID of the template to update.
 * @param template - The new name, subject, HTML content, variables, and publish.
 * @returns A promise resolving to the ID.
 * @throws If the user is not an admin, the input is invalid, the name is taken, or Resend fails.
 */
export async function update(id: string, template: EmailTemplateForm) {
  await requireAdmin();

  const templateId = TemplateIdSchema.parse(id);
  const { publish, ...fields } = EmailTemplateSchema.parse(template);
  await assertNameIsAvailable(fields.name, templateId);

  unwrap(await resend.templates.update(templateId, fields));
  if (publish) await publishTemplate(templateId);

  return { id: templateId };
}

/**
 * Deletes an email template by its ID.
 *
 * @param id - The ID of the template to delete.
 * @returns the deleted template's ID.
 * @throws If the user is not an admin or Resend fails.
 */
export async function remove(id: string) {
  await requireAdmin();

  return unwrap(await resend.templates.remove(TemplateIdSchema.parse(id)));
}
