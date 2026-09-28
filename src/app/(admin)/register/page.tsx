import { redirect } from "next/navigation";
import { verifyInvitationToken } from "@/lib/actions";
import { RegisterUser } from "@/app/ui/admin/forms/RegisterUser";
import RegisterError from "@/app/ui/admin/forms/RegisterError";

export default async function AccountRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [_: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const token = (params.token as string) ?? "";

  // TODO Add manual token input
  if (!token) redirect("/");

  const { data, error } = await verifyInvitationToken(token);

  if (error || !data) {
    return <RegisterError errorString={error ?? ""} />;
  }

  return <RegisterUser verificationID={data.id} email={data.value} />;
}
