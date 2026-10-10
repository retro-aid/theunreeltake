import z from "zod";

export const TriviaQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string(),
});