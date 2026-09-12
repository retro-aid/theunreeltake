"use server"

import { getAllQuestions } from "../dal/dto/trivia"

export async function getAllQuestionsAction()
{
    return getAllQuestions();
}