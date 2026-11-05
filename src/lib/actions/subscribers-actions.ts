"use server";

import * as email from "@/lib/dal/dto/email";
import { toResult } from "@/lib/errors";
import type { SubscriberForm } from "@/lib/schemas/subscriber-schemas";

/**
 * Server action wrapper for {@link email.subscribers.list}.
 *
 * @returns The subscribers in the standard `{ data, error }` shape.
 */
export async function list() {
  return toResult(() => email.subscribers.list());
}

/**
 * Server action wrapper for {@link email.subscribers.add}.
 *
 * @param subscriber Subscriber email and optional name fields.
 * @returns The created contact in the standard `{ data, error }` shape.
 */
export async function add(subscriber: SubscriberForm) {
  return toResult(() => email.subscribers.add(subscriber));
}

/**
 * Server action wrapper for {@link email.subscribers.create}.
 *
 * @param subscriber Subscriber email and optional name fields.
 * @returns The created contact in the standard `{ data, error }` shape.
 */
export async function create(subscriber: SubscriberForm) {
  return toResult(() => email.subscribers.create(subscriber));
}

/**
 * Server action wrapper for {@link email.subscribers.remove}.
 *
 * @param id Resend contact ID.
 * @returns The deleted contact in the standard `{ data, error }` shape.
 */
export async function remove(id: string) {
  return toResult(() => email.subscribers.remove(id));
}
