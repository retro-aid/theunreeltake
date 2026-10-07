"use server";

import {
  getTotalViews,
  getRecentUserReviews,
  getTotalActiveUsers,
} from "../dal/dto/analytics";

export async function getTotalViewsAction() {
  return getTotalViews();
}

export async function getRecentUserReviewsAction(limit: number) {
  return getRecentUserReviews(limit);
}

export async function getTotalActiveUsersAction(): Promise<number> {
  return getTotalActiveUsers();
}
