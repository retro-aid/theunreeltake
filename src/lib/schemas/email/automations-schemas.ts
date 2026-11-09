import * as z from "zod";

/**
 * The events our app sends to Resend, and the template variables each one
 * includes. An automation runs when it's linked to one of these events.
 */
export const AUTOMATION_EVENTS = {
  "unreeltake.new_post": ["POST_TITLE", "POST_URL"],
  "unreeltake.comment_reply": ["NAME", "POST_TITLE", "POST_URL", "REPLY"],
  "unreeltake.request_made": ["NAME", "TITLE"],
} as const;

/** One of the event names above, like "unreeltake.new_post". */
export type AutomationEvent = keyof typeof AUTOMATION_EVENTS;

const EVENT_NAMES = Object.keys(AUTOMATION_EVENTS) as [
  AutomationEvent,
  ...AutomationEvent[],
];

/**
 * The fields every automation schema shares.
 */
const AutomationSchema = z.object({
  event: z.enum(EVENT_NAMES),
  enabled: z.boolean(),
});

/**
 * Checks the changes an admin can make: which event the automation is linked
 * to, and whether it's on. Leave a field out to keep it the same.
 */
export const AutomationInputSchema = AutomationSchema.partial().refine(
  ({ event, enabled }) => event !== undefined || enabled !== undefined,
  "Nothing to update",
);

/**
 * Makes sure the automation ID isn't blank.
 */
export const AutomationIdInputSchema = z
  .string()
  .trim()
  .min(1, "Automation ID is required");

/**
 * One automation from Resend. `event` is null when it isn't linked to one of
 * our events.
 */
export const AutomationOutputSchema = AutomationSchema.extend({
  id: z.string(),
  name: z.string(),
  event: z.enum(EVENT_NAMES).nullable(),
});

/**
 * What update sends back.
 */
export const AutomationIdOutputSchema = z.object({ id: z.string() });

/** What update accepts. */
export type AutomationInputDTO = z.input<typeof AutomationInputSchema>;
/** One automation, as {@link AutomationOutputSchema} returns it. */
export type AutomationOutputDTO = z.output<typeof AutomationOutputSchema>;
/** The `{ id }` that update returns. */
export type AutomationIdOutputDTO = z.output<typeof AutomationIdOutputSchema>;
