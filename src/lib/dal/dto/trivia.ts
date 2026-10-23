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

/**
 * A function that updates various aspects of a trivia question when it gets answered.
 * The asked portion is incremented, the correct portion is incremented if it was answered correctly.
 * The difficulty is also updated based on the % of how often the question is answered correctly
 * @param id The id of the question to be updated
 * @param correct Whether the question was answered correctly or not. 1 for correct, 0 for incorrect
 * @returns
 */
export async function questionAnswered(id: string, correct: number) {
  try {
    const question = await prisma.trivia.findUnique({
      where: {
        id: id,
      },
    });

    let difficultyLevel = "Unknown";
    if (question != null && question.asked > 9) {
      if (((question.correct + correct) / (question.asked + 1)) * 100 < 11)
        difficultyLevel = "Extreme";
      else if (((question.correct + correct) / (question.asked + 1)) * 100 < 51)
        difficultyLevel = "Hard";
      else if (((question.correct + correct) / (question.asked + 1)) * 100 < 76)
        difficultyLevel = "Medium";
      else if (((question.correct + correct) / (question.asked + 1)) * 100 < 91)
        difficultyLevel = "Easy";
      else if (((question.correct + correct) / (question.asked + 1)) * 100 > 91)
        difficultyLevel = "Very Easy";
    }

    await prisma.trivia.update({
      where: {
        id: id,
      },
      data: {
        correct: (question?.correct || 0) + correct,
        asked: (question?.asked || 0) + 1,
        difficulty: difficultyLevel,
      },
    });
    return { error: null, success: true };
  } catch (e) {
    console.log("Error");
    return { error: "Failed to update stats", success: false };
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
    difficulty: "Unknown",
    correct: 0,
    asked: 0,
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
