"use server"

import { getPendingRequestCount } from "../dal/dto/media-requests"
import { auth } from "../auth";
import { headers } from "next/headers";

export async function getPendingRequestCountAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Unauthorized");
        }

        if (session.user.role !== "admin") {
            throw new Error("Forbidden")
        }

        return getPendingRequestCount();
    } catch (error) {
        console.error("User not authorized:", error);
        return null;
    }
}