"use server";

import {getMediaRequest} from "@/lib/dal/dto/media-requests";

export async function getMediaRequestAction(id: string) {
  return getMediaRequest(id);
}