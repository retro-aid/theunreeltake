"use client";

import {
  ActionIcon,
  Button,
  Center,
  Container,
  Stack, Text,
  TextInput,
  Title, Tooltip, Box, Group, Paper, Image
} from "@mantine/core";

import {useForm} from "@mantine/form";
import {useState} from "react";
import Link from "next/link";
import {ArrowRight, X, XCircle} from "react-bootstrap-icons"; //for the arrow on the guess button and the x on the give up button
import {createTriviaCookie} from "@/lib/actions";

const MAX_ATTEMPTS = 3;

// TODO Query Database
const TEST_QUESTION = "What film won best picture in 2020?";
const TEST_ANSWER = "Parasite";

export default function LandingPage() {

  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = async (formData: typeof triviaForm.values) => {

    const userAnswer = formData.answer.trim().toLowerCase();
    const answer = TEST_ANSWER.trim().toLowerCase();

    if(userAnswer === answer) {
      setIsCorrect(true);
      await createTriviaCookie();
      return;
    }

    triviaForm.reset();
    setAttempts(attempts + 1);

    if((attempts + 1) >= MAX_ATTEMPTS)
      await createTriviaCookie();
  }

  //Handles for the give up scenario instead of the submit/validate form
  //Set the max attempts to 3 so it goes straight to the "thanks for trying" part before proceeding
  const handleGiveUp = async() => {
    setAttempts(MAX_ATTEMPTS);
    await createTriviaCookie();
  };

  const triviaForm = useForm({
    mode: "controlled",
    initialValues: {
      answer: ""
    },
    validate: {
      answer: (value) =>
        (value.length < 3 || value.length > 128) ? "Your answer must be between 3 & 128 characters" : null
    }
  });

  if(attempts >= MAX_ATTEMPTS || isCorrect) {

    return (
      <Container>

        <Center mih={"100vh"}>

          <Stack>

            <Text>
              {isCorrect ? "Correct! You got it!" : "Thanks for trying!"}
            </Text>

            <Link href={"/"}>Click Here to go to Home</Link>

          </Stack>

        </Center>

      </Container>
    );
  }

  return (
    <Container>

      <Center mih={"100vh"}>

      <Paper shadow="xl" radius="lg" p={40} w="100%" maw={620} bg="white">

        <Stack gap="lg" align="center">

        <Center w="100%" h={88} bg="#2B2B2B" style={{borderRadius:12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"}}>
              <Image
                src="/img/white_logo_transparent_background.png"
                alt="Logo"
                h={52}
                w="auto"
                fit="contain"
              />
            </Center>

        {/*Added the main title*/}
        <Stack gap={6} align="center" ta="center">
          <Title order={1} fw={700} fz={36}>
            Welcome!
          </Title>
          <Text fw={500} fz={22} c="dark.7">
            It looks like you're new here
          </Text>
        </Stack>

        {/*Added the intro for first time users */}
        <Text size="sm" ta="center" lh={1.6} px="xs">
          We here at The Unreel Take like to have fun. We don't take ourselves too seriously, but we
          want our reviews to be seen by other fans of movies, not just robots. So we've made a small
          minigame to really put your knowledge to the test! Don't worry about passing it, you will still
          be able to see everything that we have to offer; but indulge us for a second and test your own 
          movie knowledge. We want to see what you're made out of! Who knows, you might even surprise yourself.
        </Text>

        <Box w="100%" maw={740}>
          <Title order={3} ta={"center"} fw={600} fz={18} mb="md">{TEST_QUESTION}</Title>

          <form onSubmit={triviaForm.onSubmit(handleSubmit)}>

            <Stack gap="md" align={"center"}>

              <TextInput
                placeholder={"Type Your Answer Here"}
                w={"100%"}
                rightSection={
                  triviaForm.values.answer !== "" ?
                    <Tooltip label={"Clear answer"}><ActionIcon variant={"transparent"} onClick={triviaForm.reset}><XCircle/></ActionIcon></Tooltip>
                    : null
                }
                {...triviaForm.getInputProps("answer")}
              />

              <Text size="sm" fw={600}>
                  {MAX_ATTEMPTS - attempts} Guesses Remaining
              </Text>

              <Group justify="center" gap="md" w="100%">
                  <Button type="submit" color="blue" radius="sm" w={140} rightSection={<ArrowRight size={14} />} loading={triviaForm.submitting}>
                    Guess
                  </Button>
               {/*added the give up button that when clicked, the attempt tries = 3 and striaght to 
                "thanks fo trying page"*/}   
              <Button type="submit" color="red" radius="sm" w={140} rightSection={<X size={14} />} onClick={handleGiveUp}>
                    Give Up
              </Button>

              </Group>

            </Stack>

          </form>

          </Box>

        </Stack>
        
        </Paper>

      </Center>

    </Container>
  );
}