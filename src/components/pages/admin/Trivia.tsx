import { getAllQuestionsAction } from "@/lib/actions/trivia-actions";

export default async function DashboardTriviaPage()
{
    const data = await getAllQuestionsAction();
}