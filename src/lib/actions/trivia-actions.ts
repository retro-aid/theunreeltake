"use server";

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
  return createTriviaQuestion(question, answer, category);
}

export async function deleteQuestionAction(id: string) {
  return deleteQuestion(id);
}

export async function updateQuestionAction(
  id: string,
  question: string,
  answer: string,
  category: string,
) {
  return updateQuestion(id, question, answer, category);
}

export async function publishQuestionAction(id: string) {
  return publishQuestion(id);
}
