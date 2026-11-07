"use server";

import * as email from "@/lib/dal/dto/email";
import { toResult } from "@/lib/errors";
import type { AutomationInputDTO } from "@/lib/schemas/email/automations-schemas";

const EMAIL_PAGES = "/dashboard/email";

/** Server action for {@link email.automations.list}. */
export async function list() {
  return toResult(() => email.automations.list());
}

/** Server action for {@link email.automations.get}. */
export async function get(id: string) {
  return toResult(() => email.automations.get(id));
}

/** Server action for {@link email.automations.update}. */
export async function update(id: string, automation: AutomationInputDTO) {
  return toResult(() => email.automations.update(id, automation), EMAIL_PAGES);
}
