"use server";

import {
  getMediaRequest,
  getPendingRequestCount,
  submitRequestForm,
  deleteRequest,
  replyToRequest,
  getMediaRequests,
} from "@/lib/dal/dto/media-requests";
import { RequestFormSchema } from "../schemas/media-request-schemas";

/**
 * Retrieves a media request by its ID.
 *
 * @param id - The unique identifier of the media request.
 * @returns The requested media request.
 */
export async function getMediaRequestAction(id: string) {
  return getMediaRequest(id);
}
/**
 * Retrieves the number of pending media requests.
 *
 * @returns The total count of pending requests.
 */
export async function getPendingRequestCountAction() {
  return getPendingRequestCount();
}

/**
 *
 * Validates the provided data against the request form schema before
 * submitting it. Throws an error if the data is invalid or the submission
 * fails.
 *
 * @param data - The unvalidated media request form data.
 * @returns The result of the media request submission.
 * @throws {Error} If the form data is invalid or submission fails.
 */
export async function submitRequestFormAction(data: unknown) {
  const result = RequestFormSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid media request form data");
  }
  const response = await submitRequestForm(result.data);

  if (!response.success) {
    throw new Error(response.e ?? "Failed to submit media request");
  }

  return response;
}

/**
 * Deletes a media request by its ID.
 *
 * @param id - The unique identifier of the media request to delete.
 * @returns The result of the deletion operation.
 */
export async function deleteRequestAction(id: string) {
  return deleteRequest(id);
}

/**
 * Sends a reply to a media request.
 *
 * @param id - The unique identifier of the media request to reply to.
 * @param message - The reply message to send.
 * @returns The result of the reply operation.
 */

export async function replyToRequestAction(id: string, message: string) {
  return replyToRequest(id, message);
}

/**
 * Retrieves a paginated list of media requests with optional filtering and sorting.
 *
 * @param options - The pagination, search, type, and sorting options.
 * @param options.page - The page number to retrieve. Defaults to 1.
 * @param options.limit - The maximum number of requests per page. Defaults to 12.
 * @param options.search - The search term used to filter requests. Defaults to an empty string.
 * @param options.type - The media type used to filter requests. Defaults to an empty string.
 * @param options.sort - The sorting option to apply. Defaults to an empty string.
 * @returns The filtered and paginated media requests.
 */

export async function getMediaRequestsAction({
  page = 1,
  limit = 12,
  search = "",
  type = "",
  sort = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  sort?: string;
}) {
  return await getMediaRequests({
    page,
    limit,
    search,
    type,
    sort,
  });
}
