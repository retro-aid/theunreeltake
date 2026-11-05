"use server";

import {
  getTotalViews,
  getRecentUserReviews,
  getTotalActiveUsers,
} from "@/lib/dal/dto/analytics";
import {
  getGADevices,
  getGALocations,
  getGAOverview,
  getGAPostStats,
} from "@/lib/dal/dto/google-analytics";
import type { GARangeInput } from "@/lib/schemas/analytics-schemas";

export async function getTotalViewsAction() {
  return getTotalViews();
}

export async function getRecentUserReviewsAction(limit: number) {
  return getRecentUserReviews(limit);
}

export async function getTotalActiveUsersAction(): Promise<number> {
  return getTotalActiveUsers();
}

export async function getGAOverviewAction(range?: GARangeInput) {
  return getGAOverview(range);
}

export async function getGAPostStatsAction(range?: GARangeInput) {
  return getGAPostStats(range);
}

export async function getGADevicesAction(range?: GARangeInput) {
  return getGADevices(range);
}

export async function getGALocationsAction(range?: GARangeInput) {
  return getGALocations(range);
}
