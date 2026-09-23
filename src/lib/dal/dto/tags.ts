import "server-only";
import prisma from "@/lib/prisma"

export async function updateTag(
    id: number,
    displayName: string,
    type: string
) {
    return prisma.tag.update({
        where: {id}, 
        data: {displayName, type}
    });
}