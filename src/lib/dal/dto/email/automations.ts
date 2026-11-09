import "server-only";
import type {
  AutomationResponseStep,
  AutomationStep,
  ConditionRule,
  ContactUpdateStepConfig,
  DelayStepConfig,
  GetAutomationResponseSuccess,
  SendEmailStepConfig,
  UpdateAutomationOptions,
} from "resend";
import { requireAdmin } from "@/lib/dal/utils";
import { AppError } from "@/lib/errors";
import {
  AUTOMATION_EVENTS,
  AutomationIdInputSchema,
  AutomationIdOutputSchema,
  AutomationInputSchema,
  AutomationOutputSchema,
  type AutomationEvent,
  type AutomationIdOutputDTO,
  type AutomationInputDTO,
  type AutomationOutputDTO,
} from "@/lib/schemas/email/automations-schemas";
import { resend, unwrap } from "./resend";

/**
 * Creates any of our events that don't exist in Resend yet, so they can be
 * picked as an automation's trigger.
 *
 * @remarks
 * Each event lists the template variables it sends, so they show up in
 * Resend when building an automation.
 *
 * @throws If Resend has a problem.
 */
async function ensureEvents() {
  const existing = unwrap(await resend.events.list({ limit: 100 })).data.map(
    (event) => event.name,
  );

  for (const [name, variables] of Object.entries(AUTOMATION_EVENTS)) {
    if (existing.includes(name)) continue;

    unwrap(
      await resend.events.create({
        name,
        schema: Object.fromEntries(variables.map((key) => [key, "string"])),
      }),
    );
  }
}

/**
 * The event an automation's trigger listens for, if it's one of ours.
 *
 * @param automation - The automation from Resend.
 * @returns The event name, or null if it isn't one of ours.
 */
function linkedEvent(automation: GetAutomationResponseSuccess) {
  const trigger = automation.steps.find((step) => step.type === "trigger");
  // Resend sends this back as event_name, not eventName.
  const eventName = trigger?.config.event_name as string | undefined;

  return eventName && eventName in AUTOMATION_EVENTS
    ? (eventName as AutomationEvent)
    : null;
}

/**
 * Finds the automation that's turned on and linked to one of our events.
 *
 * @remarks
 * No admin check, since this runs when visitors and writers do things on the
 * site. If more than one is linked, the first one Resend lists is used.
 *
 * @param event - The event to look for.
 * @returns The automation, or null if none is on and linked to it.
 * @throws If Resend has a problem.
 */
export async function findLinked(event: AutomationEvent) {
  const automations = unwrap(
    await resend.automations.list({ status: "enabled", limit: 100 }),
  );

  for (const { id } of automations.data) {
    const automation = unwrap(await resend.automations.get(id));
    if (linkedEvent(automation) === event) return automation;
  }

  return null;
}

/**
 * Turns a step from Resend back into the format Resend accepts when saving.
 *
 * @remarks
 * Resend sends steps back in snake_case but only accepts camelCase, so an
 * automation built in the Resend dashboard has to be converted before it can
 * be saved again. This keeps every step exactly as it was.
 *
 * @param step - A step from Resend.
 * @returns The same step, ready to save.
 */
function toRequestStep({
  key,
  type,
  config,
}: AutomationResponseStep): AutomationStep {
  switch (type) {
    case "trigger":
      return { key, type, config: { eventName: config.event_name as string } };
    case "delay":
      return { key, type, config: config as unknown as DelayStepConfig };
    case "send_email":
      return {
        key,
        type,
        config: {
          template: config.template as SendEmailStepConfig["template"],
          subject: (config.subject as string | null) ?? undefined,
          from: (config.from as string | null) ?? undefined,
          replyTo: (config.reply_to as string | null) ?? undefined,
        },
      };
    case "wait_for_event":
      return {
        key,
        type,
        config: {
          eventName: config.event_name as string,
          timeout: (config.timeout as string | null) ?? undefined,
          filterRule: (config.filter_rule as ConditionRule | null) ?? undefined,
        },
      };
    case "condition":
      return { key, type, config: config as unknown as ConditionRule };
    case "contact_update":
      return {
        key,
        type,
        config: {
          firstName: config.first_name as ContactUpdateStepConfig["firstName"],
          lastName: config.last_name as ContactUpdateStepConfig["lastName"],
          unsubscribed:
            config.unsubscribed as ContactUpdateStepConfig["unsubscribed"],
          properties:
            config.properties as ContactUpdateStepConfig["properties"],
        },
      };
    case "contact_delete":
      return { key, type, config: {} };
    case "add_to_segment":
      return { key, type, config: { segmentId: config.segment_id as string } };
  }
}

/**
 * Turns an automation from Resend into what the settings page shows.
 *
 * @param automation - The automation from Resend.
 * @returns Its ID, name, linked event, and whether it's on.
 */
function toOutput(automation: GetAutomationResponseSuccess) {
  return AutomationOutputSchema.parse({
    id: automation.id,
    name: automation.name,
    event: linkedEvent(automation),
    enabled: automation.status === "enabled",
  });
}

/**
 * Gets every automation in Resend (up to 100), and makes sure our events
 * exist so they can be linked.
 *
 * @remarks
 * Automations are built in the Resend dashboard, not here. This only shows
 * them so admins can link them to an event and turn them on or off.
 *
 * @returns Each automation's ID, name, linked event, and whether it's on.
 * @throws If you're not an admin or Resend has a problem.
 */
export async function list(): Promise<AutomationOutputDTO[]> {
  await requireAdmin();
  await ensureEvents();

  const automations = unwrap(await resend.automations.list({ limit: 100 }));
  const results: AutomationOutputDTO[] = [];

  for (const { id } of automations.data)
    results.push(toOutput(unwrap(await resend.automations.get(id))));

  return results;
}

/**
 * Gets one automation.
 *
 * @param id - The automation's ID.
 * @returns Its ID, name, linked event, and whether it's on.
 * @throws If you're not an admin or the automation doesn't exist.
 */
export async function get(id: string): Promise<AutomationOutputDTO> {
  await requireAdmin();

  return toOutput(
    unwrap(await resend.automations.get(AutomationIdInputSchema.parse(id))),
  );
}

/**
 * Links an automation to one of our events, turns it on or off, or both.
 *
 * @remarks
 * Only the trigger and on/off change. Everything else in the automation
 * (emails, delays, extra steps) stays exactly how it was built in Resend.
 *
 * @param id - The automation's ID.
 * @param automation - The event to link it to and/or whether it's on.
 * @returns The automation's ID.
 * @throws If you're not an admin, the input is wrong, the automation has no
 * trigger to link, or Resend has a problem.
 */
export async function update(
  id: string,
  automation: AutomationInputDTO,
): Promise<AutomationIdOutputDTO> {
  await requireAdmin();

  const automationId = AutomationIdInputSchema.parse(id);
  const { event, enabled } = AutomationInputSchema.parse(automation);
  const changes: UpdateAutomationOptions = {};

  if (enabled !== undefined) changes.status = enabled ? "enabled" : "disabled";

  if (event) {
    await ensureEvents();
    const current = unwrap(await resend.automations.get(automationId));

    if (!current.steps.some((step) => step.type === "trigger"))
      throw new AppError("This automation has no trigger to link", 400);

    changes.steps = current.steps.map((step) =>
      step.type === "trigger"
        ? { key: step.key, type: "trigger", config: { eventName: event } }
        : toRequestStep(step),
    );
    changes.connections = current.connections;
  }

  return AutomationIdOutputSchema.parse(
    unwrap(await resend.automations.update(automationId, changes)),
  );
}
