import { getRandomQuestionAction } from "@/lib/actions/trivia-actions";
import LandingFunctionality from "./LandingFunctionality";

export default async function LandingPage(){
    const question = await getRandomQuestionAction();

    return <LandingFunctionality question={question} />;
}