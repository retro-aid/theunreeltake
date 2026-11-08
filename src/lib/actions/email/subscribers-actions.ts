"use server";

import * as email from "@/lib/dal/dto/email";
import { toResult } from "@/lib/errors";
import type {
  CreateSubscriberInputDTO,
  ListSubscribersInputDTO,
  RemoveSubscriberInputDTO,
} from "@/lib/schemas/email/subscriber-schemas";

/**
 * Server action wrapper for {@link email.subscribers.list}.
 *
 * @returns The subscribers in the standard `{ data, error }` shape.
 */
export async function list(params: ListSubscribersInputDTO) {
  return toResult(() => email.subscribers.list(params));
}

/**
 * Server action wrapper for {@link email.subscribers.create}.
 *
 * @param params Subscriber email and optional name fields.
 * @returns The created contact in the standard `{ data, error }` shape.
 */
export async function create(params: CreateSubscriberInputDTO) {
  return toResult(() => email.subscribers.create(params));
}

/**
 * Server action wrapper for {@link email.subscribers.remove}.
 *
 * @param params.id Resend contact ID.
 * @returns The deleted contact in the standard `{ data, error }` shape.
 */
export async function remove(params: RemoveSubscriberInputDTO) {
  return toResult(() => email.subscribers.remove(params));
}
