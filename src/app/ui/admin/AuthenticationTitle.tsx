"use client";

import {
  Anchor,
  Button,
  Container,
  Group, LoadingOverlay,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Text,
  Center,
  Flex,
} from '@mantine/core';
import {useForm} from "@mantine/form";
import {zod4Resolver} from "mantine-form-zod-resolver";
import {LoginForm, LoginFormSchema} from "@/lib/schemas";
import {authClient} from "@/lib/auth-client";
import {useState} from "react";
import Link from "next/link";
import Image from 'next/image'



export function AuthenticationTitle() {

  const [errorMessage, setErrorMessage] = useState("");

  const loginForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: ""
    },
    validate: zod4Resolver(LoginFormSchema)
  });

  const handleSignIn = async (formData: LoginForm) => {

    setErrorMessage("");

    const { error } = await authClient.signIn.email({...formData, rememberMe: true, callbackURL: "/dashboard"});

    if(error)
      setErrorMessage(error.message ?? "An unknown error occurred");

  }

  return (
    <Flex mih={"100vh"}
      w = "100%"
			pos= "relative"
      align="center"
      justify="center"
      style={{
        overflow: "hidden",
				backgroundImage: 'url(/img/admission.jpg)',
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
				backgroundPosition: "center"
      }}>
			<Image
				src={"/img/white_logo_transparent_background.png"}
				width={3050}
				height = {1138}
				placeholder='blur'
				blurDataURL='/img/white_logo_transparent_background.png'
				alt = "Unreel Take"
				loading = {"eager"}
				style={{
					position: "absolute",
					width: 180,
					height:"auto",
					top: 30,
					left: 25,
				}}
			/>
			
			<Container w= "100%"
				maw={480}
				px = {25}>	
				
				<Paper withBorder shadow="md" p={45} mt={10} radius={"md"} pos={"relative"}>
					<Title ta="center"
						style={{
							fontSize: 42,
							lineHeight: 1.1,
							marginBottom: 55,
						}}>
							Welcome back!
						</Title>
					<LoadingOverlay visible={loginForm.submitting} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }}/>

					{errorMessage ? <Text c={"red"}>{errorMessage}</Text> : null }

					<form onSubmit={loginForm.onSubmit(handleSignIn)}>

						<TextInput
							size='lg'
							label={"Email"}
							placeholder={"Email"}
							radius={"lg"}
							key={"email"}
							{...loginForm.getInputProps("email")}
						/>

						<PasswordInput
							size='lg'
							label={"Password"}
							placeholder={"Your password"}
							mt={"lg"}
							radius={"md"}
							key={"password"}
							{...loginForm.getInputProps("password")}
						/>

						<Group justify="space-between" mt="lg">

							<Anchor
								size={"md"}
								href={"/reset-password"}
								c="dark"
							>
								Forgot password?
							</Anchor>

						</Group>

						<Button fullWidth size = "lg" mt={"xl"} radius={"md"} type={"submit"} color="dark">
							Sign in
						</Button>

					</form>
				</Paper>

				<Center m={"lg"}>
					<Anchor component={Link} href={"/"} c={"white"}
						style={{
							padding: "10px 24px",
							borderRadius: "999px",
							border: "1px solid white",
							display: "inline-block"
						}}
					>
						Back to Home
					</Anchor>
				</Center>

			</Container>

    {/* - Can insert picture or branding for the login page here*/}
    </Flex>
  );
}