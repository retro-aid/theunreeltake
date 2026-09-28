"use server";

import {getMediaRequest, getPendingRequestCount} from "@/lib/dal/dto/media-requests";

export async function getMediaRequestAction(id: string) {
  return getMediaRequest(id);
}

export async function getPendingRequestCountAction() {
  return getPendingRequestCount();
}