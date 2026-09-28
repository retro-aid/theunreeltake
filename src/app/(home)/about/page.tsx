"use client";
import {
  AspectRatio,
  Flex,
  Grid,
  Image,
  Paper,
  Stack,
  Text,
  Title,
  Badge,
  Group,
  Container,
} from "@mantine/core";

// Temporary team member's data (could be 4 +- of how many members would be on the team)
const TEAM_MEMBERS = [
  {
    name: "Brandon E.",
    role: "Founder",
    image: "/img/Brandon_E_bio-pic.png",
    bio: "Brandon has reviewed films from every continent, including one screened inside an active volcano in Iceland that he attended by personal invitation of the director. He is fluent in seven languages, none of which he will confirm the names of. Scholars believe his palate for food pairings was developed during a three-year apprenticeship under a reclusive chef who has never been photographed. He once recommended a drink pairing that caused a standing ovation at a dinner party he wasn't even attending. He doesn't watch movies. Movies watch him.",
  },
  {
    name: "Jeremy B.",
    role: "Author",
    image: "/img/Jeremy_B_bio-pic.png",
    bio: "Jeremy has forgotten more movies than most people have seen, and he still remembers all of them. He has walked into every film he has ever watched knowing exactly what kind of experience he was there for, and he has never once been wrong. His snack pairings have caused grown adults to reconsider their entire approach to life. He does not consult reviews before watching something - reviews consult him. Jeremy approaches a movie selection the way a Navy SEAL approaches a mission: with complete guesswork, an ill-defined objective, and absolutely no regrets.",
  },
  {
    name: "Bailey S.",
    role: "Author",
    image: "/img/Bailey_S_bio-pic.png",
    bio: 'Bailey has finished more books than most people have started, a fact she considers unremarkable. She once recommended a reading location so specific and so perfect that the person who followed her advice called it a life-changing afternoon. Literary critics have attempted to categorize her taste and abandoned the effort entirely. She developed her literary instincts during a years-long residency in a library that locals swore was haunted, which she described only as "atmospheric." She has never lent a book and asked for it back; not because she is generous, but because she no longer needs it once it\'s finished.',
  },
  {
    name: "John S.",
    role: "Author",
    image: "/img/John_S_bio-pic.png",
    bio: 'John once finished a 900-page novel overnight because he "wanted to see how it ended." He has strong opinions about every genre category ever created and considers most of them deeply insufficient. On three separate occasions, his drink pairing suggestions have caused people to reconsider their entire relationship with beverages. He was once described by a stranger as "the most prepared person I have ever seen walk into a movie theater." That stranger was a film critic, and they have not reviewed anything since.',
  },
];

export default function AboutPage() {
  return (
    <Container size="lg" py="xl" px={{ base: "md", sm: "xl" }}>
      <Grid columns={12} gap={"xl"}>
        {/*About Section*/}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Title order={1}>About The Unreel Take</Title>
          <Text size={"md"} mb={"xs"}>
            We believe everyone deserves reviews from people who genuinely enjoy
            all genres and don&#39;t have an agenda. No critics. No scores. No
            one tanking a movie because it didn&#39;t align with their politics
            or a book because they didn&#39;t like one character.
          </Text>
          <Text size={"md"}>
            Here&#39;s the thing: quality and experience aren&#39;t the same.
            Have you ever watched a movie everyone calls a disaster, but had the
            best time watching? Or re-read a book ten times just for the vibe,
            while critics called it poorly written? That&#39;s exactly what
            we&#39;re here for. We&#39;re not here to tell you if something is
            good. We&#39;re here to tell you what kind of experience you&#39;re
            in for.
          </Text>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <AspectRatio ratio={16 / 9}>
            <Paper
              shadow={"3px 3px 10px var(--mantine-color-gray-7)"}
              w={"100%"}
              h={"100%"}
              maw={640}
              mah={360}
              bdrs={0}
            >
              <Image
                fit={"cover"}
                w={"100%"}
                h={"100%"}
                maw={640}
                mah={360}
                src={"/img/admission.jpg"}
                alt={"Image Failed to Load"}
              />
            </Paper>
          </AspectRatio>
        </Grid.Col>

        {/*Meet the Team Section*/}
        <Grid.Col span={12} mt="xl">
          <Title order={1} mb="lg">
            Meet the Unreel Team
          </Title>

          <Stack gap="md">
            {TEAM_MEMBERS.map((member, index) => (
              <Paper key={index} withBorder p="md" bdrs={0} shadow={"sm"}>
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  gap="md"
                  align="flex-start"
                >
                  {/* Image Container */}
                  <Paper
                    bg="gray.1"
                    w={{ base: "100%", xs: 180 }}
                    maw={255}
                    h={"100%"}
                    style={{ overflow: "hidden" }}
                    bdrs={0}
                  >
                    <AspectRatio ratio={1}>
                      <Image src={member.image} alt={member.name} />
                    </AspectRatio>
                  </Paper>

                  {/* Details Container */}
                  <Stack gap={4} flex={1}>
                    <Group justify={"space-between"} align="center">
                      <Text fz={"h3"} fw={700} size="xl">
                        {member.name}
                      </Text>
                      <Badge
                        mih={28}
                        variant="light"
                        bdrs={"sm"}
                        color="blue"
                        size="lg"
                      >
                        <Text size={"sm"} fw={"bold"} m={0} mih={10}>
                          {member.role}
                        </Text>
                      </Badge>
                    </Group>

                    <Text size="md" c="gray.7">
                      {member.bio}
                    </Text>
                  </Stack>
                </Flex>
              </Paper>
            ))}
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
