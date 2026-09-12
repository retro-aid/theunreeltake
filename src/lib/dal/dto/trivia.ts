import prisma from "@/lib/prisma";
import "server-only"

export async function getAllQuestions()
{
    return prisma.trivia.findMany();
}