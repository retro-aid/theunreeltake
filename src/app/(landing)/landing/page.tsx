import LandingPage from "@/components/pages/home/LandingPage";
import { getRandomQuestionAction } from "@/lib/actions/trivia-actions";

const question = await getRandomQuestionAction();
const Page = () => <LandingPage question={question} />;

export default Page;
