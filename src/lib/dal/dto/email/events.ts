import "server-only";
import { after } from "next/server";
import type { GetAutomationResponseSuccess, Segment } from "resend";
import {
  AUTOMATION_EVENTS,
  type AutomationEvent,
} from "@/lib/schemas/email/automations-schemas";
import { findLinked } from "./automations";
import { resend, resendFrom, unwrap } from "./resend";

const appUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

/** The mailing list that gets new post emails. */
export const NEWSLETTER_LIST_NAME = "Newsletter";

type EventPayload<E extends AutomationEvent> = Record<
  (typeof AUTOMATION_EVENTS)[E][number],
  string | null | undefined
>;

/**
 * Sends an event to Resend, which runs every automation linked to it. Errors
 * are logged instead of thrown, so a failed email never stops anything from
 * saving.
 *
 * @param event - The event.
 * @param email - Who gets the email.
 * @param payload - The template variables. Blank ones are left out so the
 * template's fallback is used.
 */
async function send<E extends AutomationEvent>(
  event: E,
  email: string,
  payload: EventPayload<E>,
) {
  try {
    unwrap(
      await resend.events.send({
        event,
        email,
        payload: Object.fromEntries(
          Object.entries(payload).filter(([, value]) => value),
        ),
      }),
    );
  } catch (error) {
    console.error(`Failed to send the "${event}" event:`, error);
  }
}

/**
 * Finds the mailing list with a given name, ignoring case.
 *
 * @param name - The list's name.
 * @returns The list's ID, or null if there's no list with that name.
 * @throws If Resend has a problem.
 */
async function findListId(name: string) {
  const lists: Segment[] = [];
  let cursor: string | undefined;

  do {
    const page = unwrap(
      await resend.segments.list({ limit: 100, after: cursor }),
    );
    lists.push(...page.data);
    cursor = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (cursor);

  return (
    lists.find((list) => list.name.toLowerCase() === name.toLowerCase())?.id ??
    null
  );
}

/**
 * Fills in a template's `{{{KEY}}}` placeholders.
 *
 * @remarks
 * Broadcasts don't fill in template variables, so we do it here. Values we
 * don't have use the template's fallback. Resend's own ones, like
 * `{{{RESEND_UNSUBSCRIBE_URL}}}`, are left for Resend.
 *
 * @param text - The template's subject or HTML.
 * @param values - The variables to fill in.
 * @returns The text with the placeholders filled in.
 */
function fillTemplate(text: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (filled, [key, value]) => filled.replaceAll(`{{{${key}}}}`, value),
    text,
  );
}

/**
 * How long the automation waits before sending, as a broadcast schedule.
 *
 * @param automation - The new post automation.
 * @returns Something like "in 1 hour", or undefined to send right away.
 */
function scheduledAt(automation: GetAutomationResponseSuccess) {
  const delay = automation.steps.find((step) => step.type === "delay");
  const duration = delay?.config.duration as string | undefined;

  return duration ? `in ${duration}` : undefined;
}

/**
 * Emails the Newsletter list about a new post, as one broadcast.
 *
 * @remarks
 * Uses the template from the automation that's on and linked to
 * "unreeltake.new_post", and its delay if it has one. Turning that
 * automation off stops these emails. If there's no such automation or no
 * Newsletter list, nothing is sent.
 *
 * Runs after the response is sent, so publishing doesn't wait on Resend.
 * Errors are logged instead of thrown.
 *
 * @param post - The post's title and slug.
 */
export function postPublished(post: { title: string; slug: string }) {
  const values = {
    POST_TITLE: post.title,
    POST_URL: `${appUrl}/blog/${post.slug}`,
  };

  try {
    after(async () => {
      try {
        const automation = await findLinked("unreeltake.new_post");
        if (!automation) return;

        const step = automation.steps.find((s) => s.type === "send_email");
        const templateId = (step?.config.template as { id?: string })?.id;
        const segmentId = await findListId(NEWSLETTER_LIST_NAME);

        if (!templateId || !segmentId) {
          console.error(
            `Skipped the new post email: no template on the automation or no "${NEWSLETTER_LIST_NAME}" list.`,
          );
          return;
        }

        const template = unwrap(await resend.templates.get(templateId));
        const fallbacks = Object.fromEntries(
          (template.variables ?? []).map((v) => [
            v.key,
            String(v.fallback_value ?? ""),
          ]),
        );
        const filled = { ...fallbacks, ...values };

        unwrap(
          await resend.broadcasts.create({
            segmentId,
            from: template.from ?? resendFrom,
            subject: fillTemplate(
              template.subject ?? `New post: ${post.title}`,
              filled,
            ),
            html: fillTemplate(template.html, filled),
            name: `New post: ${post.title}`,
            send: true,
            scheduledAt: scheduledAt(automation),
          }),
        );
      } catch (error) {
        console.error("Failed to send the new post email:", error);
      }
    });
  } catch (error) {
    console.error("Failed to schedule the new post email:", error);
  }
}

/**
 * Tells someone their comment got a reply.
 *
 * @param reply - The commenter's email and name, the post, and the reply.
 */
export async function commentReplied(reply: {
  email: string;
  name: string | null;
  postTitle: string;
  postSlug: string;
  message: string;
}) {
  await send("unreeltake.comment_reply", reply.email, {
    NAME: reply.name,
    POST_TITLE: reply.postTitle,
    POST_URL: `${appUrl}/blog/${reply.postSlug}`,
    REPLY: reply.message,
  });
}

/**
 * Thanks someone for their request.
 *
 * @param request - Their email, name, and requested title.
 */
export async function requestSubmitted(request: {
  email: string;
  name: string | null;
  title: string;
}) {
  await send("unreeltake.request_made", request.email, {
    NAME: request.name,
    TITLE: request.title,
  });
}
