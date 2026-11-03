"use server";

import * as email from "@/lib/dal/dto/email";
import type { SubscriberForm } from "@/lib/schemas/subscriber-schemas";

/**
 * Server action wrapper for {@link email.subscribers.list}.
 *
 * @returns The current Resend contact list response.
 */
export async function list() {
  return email.subscribers.list();
}

/**
 * Server action wrapper for {@link email.subscribers.add}.
 *
 * @param subscriber Subscriber email and optional name fields.
 * @returns Resend's contact creation response.
 */
export async function add(subscriber: SubscriberForm) {
  return email.subscribers.add(subscriber);
}

/**
 * Server action wrapper for {@link email.subscribers.create}.
 *
 * @param subscriber Subscriber email and optional name fields.
 * @returns Resend's contact creation response.
 */
export async function create(subscriber: SubscriberForm) {
  return email.subscribers.create(subscriber);
}

/**
 * Server action wrapper for {@link email.subscribers.remove}.
 *
 * @param id Resend contact ID.
 * @returns Resend's contact deletion response.
 */
export async function remove(id: string) {
  return email.subscribers.remove(id);
}
