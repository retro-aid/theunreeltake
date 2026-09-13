import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Box, Flex, Title, Divider, Text, Stack, Checkbox, Avatar, Button, Paper} from "@mantine/core";
import { ChangePassword } from "@/app/ui/admin/forms/ChangePassword";
import { ChangeUsername } from "@/app/ui/admin/forms/ChangeUsername";


export default async function DashboardSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  

  if (!session) redirect("/login");

  return (
    <Box
			maw="2000"
			w = "100%"
			px = "md"
			py = "lg"
		>
      <Title order={2} mb="md">
        Account Settings
      </Title>

			<Text c = "dimmed" mb = "sm">
				Manage your account and account info
			</Text>

      <Divider mb="40"/>
			<Paper
				withBorder
				radius = "md"
				p = "xl"
				styles={{
					root:{
						background: "linear-gradient(#ece9e6	, #ffffff )",
					}
				}}
				>
				<Box mb={40}>
					<Title order={4}>
						Account Info
					</Title>
					<Text c = "dimmed" mb = "xl">
						Edit your account information
					</Text>
						<Flex 
							align={{base: "stretch", sm:" center"}}
							direction={{base: "column", sm: "row"}}
							gap = "lg"
							mb = "30"
						>
							<Avatar
								variant={"light"}
								src={session?.user.image}
								radius={"xl"}
								size={100}
								style={{
									boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
								}}
							></Avatar>
							<Flex gap="sm" direction={{base: "column", sm: "row"}}>
								<Button 
									radius = "md"
									color = "black"
									style={{
										boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
									}}
								>
									Upload an Image
								</Button>
								<Button 
									radius = "md"
									color = "red"
									style={{
										boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
									}}
								>
									Delete
								</Button>          
							</Flex>
						</Flex>
					<Title order={5} mb="xs">
						Email Address
					</Title>

					<Text mb="lg">
						testuser@domain.com
					</Text>

				<Paper
							withBorder
							radius = "md"
							p = "xl"
							shadow="sm"
							w = "100%"
							maw={1000}
							styles={{
								root:{
									background: "linear-gradient(#ece9e1	, #f0ede7 )",
								}
							}}
						>
							<ChangePassword/>
							<ChangeUsername/>
				</Paper>
				</Box>
				<Paper
					withBorder
					radius="md"
					p = "xl"
					shadow="sm"
					w = "100%"
					maw={1000}
					styles={{
								root:{
									background: "linear-gradient(#f0ede7	, #ffffff )",
								}
					}}
					>
					<Stack gap="md">
						<Title order={5}>
							Permissions
						</Title>

						<Checkbox size="sm" label="Enable ...." />
						<Checkbox size="sm" label="Enable ...." />
						<Checkbox size="sm" label="Enable ...." />
					</Stack>
				</Paper>
				<Title mt="lg" order={5} mb="xs">Delete Account</Title>
				<Text size ="sm" mb="sm">Deleting your account will permanently remove all data!</Text>
				<Button fw={1000} color="red">I want to delete my account</Button>
			</Paper>
		</Box>	
  );
}