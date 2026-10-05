"use server"

import { getRecentUserReviews } from "../dal/dto/reviews";

export async function getRecentUserReviewsAction(limit: number) {
    return getRecentUserReviews(limit);
}