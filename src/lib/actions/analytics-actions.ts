"use server";

import { getTotalViews, getRecentUserReviews } from "../dal/dto/analytics";

export async function getTotalViewsAction() {
  return getTotalViews();
}

export async function getRecentUserReviewsAction(limit: number) {
  return getRecentUserReviews(limit);
}
