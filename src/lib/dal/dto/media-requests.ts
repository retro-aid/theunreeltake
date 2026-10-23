import "server-only";
import prisma from "@/lib/prisma";
import { Request } from "@/generated/prisma/client";
import { RequestForm } from "@/lib/schemas/media-request-schemas";
import { Resend } from "resend";
import { RequestStatus } from "@/generated/prisma/enums";
import {
  RequestWhereInput,
  RequestOrderByWithRelationInput,
} from "@/generated/prisma/models/Request";

type MediaRequestPrefillDTO = Pick<Request, "id" | "type" | "title">;
/**
 * Retrieves the information needed to prefill a media request form.
 *
 * @param id - The unique identifier of the media request.
 * @returns The request ID, media type, and title.
 */
export async function getMediaRequest(id: string) {
  return prisma.request.findUnique({
    where: { id: id },
    select: { id: true, type: true, title: true },
  }) as Promise<MediaRequestPrefillDTO>;
}

/**
 * Counts the amount of reviews with the status pending
 *
 * @returns The total number of pending requests
 */
export async function getPendingRequestCount() {
  return prisma.request.count({
    where: {
      status: "pending",
    },
  });
}
/**
 * Creates a new media request in the database.
 *
 * Uses the provided form data to create a request, defaulting an omitted
 * message to an empty string and an omitted name to null.
 *
 * @param data - The validated media request form data.
 * @returns An object indicating whether the submission succeeded and an
 *          error message if it failed.
 */
export async function submitRequestForm(data: RequestForm) {
  try {
    await prisma.request.create({
      data: {
        email: data.email,
        title: data.title,
        message: data.message ?? "",
        type: data.mediaType,
        name: data.name ?? null,
      },
    });
    return { e: null, success: true };
  } catch (e) {
    return { e: "Failed to submit form", success: false };
  }
}

export type RequestDTO = {
  id: string;
  email: string;
  title: string;
  type: string | null;
  name: string | null;
  message: string | null;
  status: RequestStatus;
};

export type GetMediaRequestsDTO = {
  data: RequestDTO[];
  total: number;
};

const REQUEST_ORDER_BY: Record<string, RequestOrderByWithRelationInput> = {
  title: { title: "asc" },
  name: { name: "asc" },
  email: { email: "asc" },
};
/**
 * Retrieves media requests with optional pagination, filtering, and sorting.
 *
 * @param options - The pagination, search, filtering, and sorting options.
 * @param options.page - The page number to retrieve. Defaults to 1.
 * @param options.limit - The maximum number of requests per page. Defaults to 12.
 * @param options.search - The search term used to filter requests. Defaults to an empty string.
 * @param options.type - The media type used to filter requests. Defaults to an empty string.
 * @param options.sort - The field used to sort requests. Defaults to an empty string.
 * @returns An object containing the matching requests and total count, or unsuccessful result if retrieval fails.
 */
export async function getMediaRequests({
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
  try {
    const where: RequestWhereInput = {
      type: type || undefined,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [data, total] = await Promise.all([
      prisma.request.findMany({
        where,
        orderBy: REQUEST_ORDER_BY[sort] ?? { name: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return { success: true, data, total };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] as [], total: 0 };
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);
/**
 * Sends an email reply to a media request and updates its status.
 *
 * Retrieves the request, sends the supplied message to the requester's email
 * address, and marks the request as replied after the email is sent.
 *
 * @param requestId - The unique identifier of the media request.
 * @param message - The message to send to the requester.
 * @returns promise that resolves when the email is sent and the status is updated.
 * @throws {Error} If the request cannot be found or an operation fails.
 */
export async function replyToRequest(requestId: string, message: string) {
  if (!message.trim()) {
    throw new Error("Message cannot be empty");
  }
  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  await resend.emails.send({
    from: "you@yourdomain.com",
    to: request.email,
    subject: `Re: ${request.title}`,
    text: message,
  });

  await prisma.request.update({
    where: { id: requestId },
    data: {
      status: "replied",
    },
  });
}
/**
 * Deletes a media request from the database.
 *
 * @param id - The unique identifier of the media request to delete.
 * @returns An object indicating whether the deletion succeeded.
 * @throws {Error} If the deletion fails.
 */
export async function deleteRequest(id: string) {
  if (!id.trim()) {
    throw new Error("Request ID cannot be empty");
  }
  try {
    await prisma.request.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete failed:", error);
    throw new Error("Delete failed");
  }
}
