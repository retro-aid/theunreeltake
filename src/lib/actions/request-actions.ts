"use server";
import {
  deleteRequest,
  replyToRequest,
  getMediaRequests,
} from "@/lib/dal/dto/requests";

//wrapper functions for the dto functions
export async function deleteRequestAction(id: string) {
  return deleteRequest(id);
}

export async function replyToRequestAction(id: string, message: string) {
  return replyToRequest(id, message);
}

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
