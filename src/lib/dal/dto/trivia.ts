import prisma from "@/lib/prisma";
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
    if (questions.length === 0) return null;
    const chosenNum = Math.floor(Math.random() * questions.length);
    return questions[chosenNum];
  } catch (error) {
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
    return { error: "Failed to update stats", success: false };
  }
}

export async function createTriviaQuestion(
  question: string,
  answer: string,
  category: string,
) {
  try {
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
    return { error: null, success: true };
  } catch (error) {
    return { error: "Failed to create question", success: false };
  }
}

export async function deleteQuestion(id: string) {
  try {
    await prisma.trivia.delete({
      where: { id },
    });
    return { error: null, success: true };
  } catch (error) {
    return { error: "Failed to delete question", success: false };
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
    return { error: null, success: true };
  } catch (error) {
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
    return { error: null, success: true };
  } catch (error) {
    return { error: "Failed to publish question", success: false };
  }
}
