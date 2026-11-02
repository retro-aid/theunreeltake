"use server";

import * as email from "@/lib/dal/dto/email";
import {
  CreateBroadcastFormInput,
  ListBroadcastFormInput,
} from "@/lib/schemas/email/broadcast-schemas";

/**
 * Creates and sends an email broadcast
 *
 * @param formData - The parameters for broadcast creation. See {@link CreateBroadcastSchema}
 */
export async function create(formData: CreateBroadcastFormInput) {
  return email.broadcast.create(formData);
}

/**
 * Gets a list of broadcast items
 *
 * @param limit - The amount of items to get. Default 25
 */
export async function list(limit?: number) {
  const params: ListBroadcastFormInput = {
    limit: limit,
    paginateOption: "none",
  };

  return email.broadcast.list(params);
}

/**
 * Gets the next page of broadcast items
 *
 * @param fromId - The id of the first broadcast item on the current page. Used to get the next page
 * @param limit - The amount of items to get. Default 25
 */
export async function nextPage(fromId: string, limit?: number) {
  const params: ListBroadcastFormInput = {
    limit: limit,
    paginateOption: "after",
    after: fromId,
  };

  return email.broadcast.list(params);
}

/**
 * Gets the previous page of broadcast items
 *
 * @param fromId - The id of the first broadcast item on the current page. Used to get the previous page
 * @param limit - The amount of items to get. Default 25
 */
export async function previousPage(fromId: string, limit?: number) {
  const params: ListBroadcastFormInput = {
    limit: limit,
    paginateOption: "before",
    before: fromId,
  };

  return email.broadcast.list(params);
}
