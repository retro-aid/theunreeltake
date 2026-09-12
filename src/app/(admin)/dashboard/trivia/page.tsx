import { TriviaTable } from "@/components/trivia";
import { getAllQuestionsAction } from "@/lib/actions/trivia-actions";

export default async function DashboardTriviaPage() {
  
  const questions = await getAllQuestionsAction()

  return(
    <TriviaTable data = {questions}/>
  );  
}