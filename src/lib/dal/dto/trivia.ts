import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import "server-only";

export async function getAllQuestions() {
  return prisma.trivia.findMany();
}

/**
 * A function that queries all the published questions from the trivia database and selects one to return
 * @returns A random question from the trivia table if successful, null if unsuccessful
 */
export async function getRandomQuestion() {
  try {
    const questions = await prisma.trivia.findMany({
      where: { published: true },
    });
    const chosenNum = Math.floor(Math.random() * questions.length);
    return questions[chosenNum];
  } catch (e) {
    return null;
  }
}

export async function createTriviaQuestion(
  question: string,
  answer: string,
  category: string,
) {
  const data = {
    id: crypto.randomUUID(),
    question: question,
    answer: answer,
    category: category,
    difficulty: "Medium",
    type: "Fill in the blank",
    sucrate: "50%",
    published: false,
  };

  await prisma.trivia.create({
    data: data,
  });

  revalidatePath("/dashboard/trivia");
}

export async function deleteQuestion(id: string) {
  try {
    const deleteUser = await prisma.trivia.delete({
      where: { id },
    });
    revalidatePath("/dashboard/trivia");
    return { data: deleteUser, error: "none" };
  } catch (e) {
    console.error("Database Error: ", e);
    return { data: null, error: "Question not found" };
  }
}

export async function updateQuestion(
  id: string,
  question: string,
  answer: string,
  category: string,
) {
  try {
    await prisma.trivia.update({
      where: {
        id: id,
      },
      data: {
        question: question,
        answer: answer,
        category: category,
      },
    });

    revalidatePath("/dashboard/trivia");
    console.log("success");
    return { error: null, success: true };
  } catch (error) {
    console.log("oops");
    return { error: "Failed to update question", success: false };
  }
}

export async function publishQuestion(id: string) {
  try {
    await prisma.trivia.update({
      where: {
        id: id,
      },
      data: {
        published: true,
      },
    });

    revalidatePath("/dashboard/trivia");
    console.log("success");
    return { error: null, success: true };
  } catch (error) {
    console.log("oops");
    return { error: "Failed to publish question", success: false };
  }
}
