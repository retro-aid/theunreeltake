import prisma from "@/lib/prisma";
import "server-only"

export async function getAllQuestions()
{
    return prisma.trivia.findMany();
}

export async function createTriviaQuestion(question: string, answer: string, category: string) {

  const data = {
    id: crypto.randomUUID(),
    question: question,
    answer: answer,
    category: category,
    difficulty: "Medium",
    type: "Fill in the blank",
    sucrate: "50%",
    published: false
  }

  await prisma.trivia.create({
    data: data
  });
}