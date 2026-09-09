import {Button, Card, Group, Text, Title} from "@mantine/core";

export function DashboardCard() {

  return (
    <Card withBorder>

      <Title order={3}>Name of Blog Post</Title>
      <Text size={"sm"}>User Name: anonymous-user-1234</Text>
      <Text size={"sm"}>User Email: johndoe@somedomain.com</Text>
      <Text size={"sm"}>User ID: abdfeg-hijklm-nopqrs</Text>

      <Card.Section p={"md"}>
        <Title order={5}>Message</Title>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga libero nesciunt non officia officiis praesentium quis recusandae vitae? Debitis deserunt dolorum eius eum necessitatibus nobis perferendis veritatis? Enim iste, nihil?
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto maxime obcaecati quae quis ut veritatis. Ab animi assumenda mollitia nam nihil odit placeat quae ratione? A ipsa maxime ut veritatis?
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti enim eveniet, explicabo fuga fugit illum ipsa iste iure nemo nostrum provident quod reiciendis vel vitae voluptatem? Alias consectetur dignissimos maxime.
        </Text>
      </Card.Section>

      <Group gap={"sm"}>
        <Button miw={100}>View Post</Button>
        <Button miw={100} color={"green"}>Reply</Button>
        <Button miw={100} color={"red"}>Delete</Button>
      </Group>

    </Card>
  );

}