"use server";

import {
  createSubscriber,
  deleteSubscriber,
  getSubscriber,
  listSubscribers,
  updateSubscriber,
  type ListSubscribersOptions,
} from "@/lib/dal/dto/subscribers";
import type {
  CreateSubscriberInput,
  UpdateSubscriberInput,
} from "@/lib/schemas/subscriber-schemas";

/**
 * Lists subscribers using the requested paging and filtering options.
 * @param options - Optional pagination, search, and sorting criteria.
 * @returns The subscriber page and its total count.
 */
export async function listSubscribersAction(
  options?: ListSubscribersOptions,
) {
  return listSubscribers(options);
}

/**
 * Retrieves one subscriber by identifier.
 * @param id - The subscriber identifier.
 * @returns The subscriber record or null if unavailable.
 */
export async function getSubscriberAction(id: string) {
  return getSubscriber(id);
}

/**
 * Creates a subscriber using administrator supplied details.
 * @param input - Validated subscriber fields.
 * @returns The created subscriber or a safe error result.
 */
export async function createSubscriberAction(input: CreateSubscriberInput) {
  return createSubscriber(input);
}

/**
 * Updates a subscriber's editable fields.
 * @param id - The subscriber identifier.
 * @param input - Fields to update.
 * @returns The updated subscriber or a safe error result.
 */
export async function updateSubscriberAction(
  id: string,
  input: UpdateSubscriberInput,
) {
  return updateSubscriber(id, input);
}

/**
 * Deletes a subscriber by identifier.
 * @param id - The subscriber identifier.
 * @returns Whether the deletion succeeded.
 */
export async function deleteSubscriberAction(id: string) {
  return deleteSubscriber(id);
}
