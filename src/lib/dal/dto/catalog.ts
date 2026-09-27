'use server';

import prisma from "@/lib/prisma";

export async function getTags() {

    const result = await prisma.tag.findMany();
    return result;
}