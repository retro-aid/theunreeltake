import 'server-only';
import prisma from "@/lib/prisma";

export async function getPendingRequestCount() {
    return prisma.request.count({
        where: {
            status: "pending"
        }
    });
}