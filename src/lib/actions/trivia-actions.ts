"use server";

import { revalidatePath } from "next/cache";
import {
  createTriviaQuestion,
  deleteQuestion,
  getAllQuestions,
  getRandomQuestion,
  publishQuestion,
  questionAnswered,
  updateQuestion,
} from "../dal/dto/trivia";

export async function getAllQuestionsAction() {
  return getAllQuestions();
}

export async function getRandomQuestionAction() {
  return getRandomQuestion();
}

export async function questionAnsweredAction(id: string, correct: number) {
  return questionAnswered(id, correct);
}

export async function createTriviaQuestionAction(
  question: string,
  answer: string,
  category: string,
) {
  const createdQuestion = await createTriviaQuestion(
    question,
    answer,
    category,
  );
  revalidatePath("/dashboard/trivia");
  return createdQuestion;
}

export async function deleteQuestionAction(id: string) {
  const deleteResult = deleteQuestion(id);
  revalidatePath("/dashboard/trivia");
  return deleteResult;
}

export async function updateQuestionAction(
  id: string,
  question: string,
  answer: string,
  category: string,
) {
  const updateResult = updateQuestion(id, question, answer, category);
  revalidatePath("/dashboard/trivia");
  return updateResult;
}

export async function publishQuestionAction(id: string) {
  const publishResult = publishQuestion(id);
  revalidatePath("/dashboard/trivia");
  return publishResult;
}
