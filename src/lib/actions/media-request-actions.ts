"use server";

import {
  getMediaRequest,
  getPendingRequestCount,
  getTotalViews,
} from "@/lib/dal/dto/media-requests";

export async function getMediaRequestAction(id: string) {
  return getMediaRequest(id);
}

export async function getPendingRequestCountAction() {
  return getPendingRequestCount();
}

export async function getTotalViewsAction() {
  return getTotalViews();
}