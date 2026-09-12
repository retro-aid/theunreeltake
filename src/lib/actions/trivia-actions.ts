"use server"

import { createTriviaQuestion, deleteQuestion, getAllQuestions } from "../dal/dto/trivia"

export async function getAllQuestionsAction()
{
    return getAllQuestions();
}

export async function createTriviaQuestionAction(question: string, answer: string, category: string)
{
    return createTriviaQuestion(question, answer, category);
}

export async function deleteQuestionAction(id: string)
{
    return deleteQuestion(id);
}