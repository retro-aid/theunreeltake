"use client";

import {useForm} from "@mantine/form";
import {zod4Resolver} from "mantine-form-zod-resolver";
import {ChangePasswordForm, ChangePasswordSchema} from "@/lib/schemas";
import { notifyPasswordChanged } from "@/lib/actions";
import {authClient} from "@/lib/auth-client";
import {useState} from "react";
import {Box, Button, PasswordInput, Stack, Text, Title} from "@mantine/core";

export function ChangePassword() {

  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const changePasswordForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      currentPassword: "",
      newPassword: ""
    },
    validate: zod4Resolver(ChangePasswordSchema)
  });

  const handleChangePassword = async (formData: ChangePasswordForm) => {

    const { error } = await authClient.changePassword({
      ...formData, 
      revokeOtherSessions: false 
    });
	
    if(error){
      setErrorMessage(error.message ?? "Incorrect current password");
			setTimeout(()=> {
				setErrorMessage("");
			}, 5000)
		}else{
			await notifyPasswordChanged();
			changePasswordForm.reset();
			setSuccess(true);
			setTimeout(()=> {
				setSuccess(false);
			}, 5000)
		}
    
  }

 

  return (
    <Box mb="xl">
      <Title order={4} mb="5">Account Security</Title>
			<Text size = "sm" c = "dimmed" mb = "md">
				Manage your password and username
			</Text>
			{success && (<Text c = "green" size = "sm" mb = "md">
				Password changed successfully!
			</Text>)}
			{errorMessage && (<Text c = "red" size = "sm" mb = "md">
				{errorMessage}
			</Text>)}
			<form onSubmit={
				changePasswordForm.onSubmit(
					handleChangePassword
				)}>
				<Stack gap = "lg">
					<PasswordInput 
						label = "Current password" 
						placeholder="Enter current password" 
						radius = "md" 
						size = "md"
						key = "currentPassword"
						{...changePasswordForm.getInputProps("currentPassword")}
					/>
					
					<PasswordInput 
						label = "New password" 
						placeholder="Enter new password" 
						radius = "md" 
						size = "md"
						key = "newPassword"
						{...changePasswordForm.getInputProps("newPassword")}
					/>
			
					<Button color= "black" type="submit" radius="xl" size="md" w="fit-content" loading={changePasswordForm.submitting}>
						Change Password
					</Button>
      	</Stack>
			</form>
    </Box>
	)
}
