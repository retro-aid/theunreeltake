import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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

  revalidatePath("/dashboard/trivia");
}

export async function deleteQuestion(id : string){
  try{
      const deleteUser = await prisma.trivia.delete({
        where: {id},
      });
    revalidatePath("/dashboard/trivia");
    return {data: deleteQuestion, error: "none"};
  } catch(e){
    console.error("Database Error: ", e);
    return {data: null, error: "Question not found"};
  }
}