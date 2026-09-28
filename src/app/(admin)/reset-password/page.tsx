import { ResetPassword } from "@/app/ui/admin/forms/ResetPassword";
import { ForgotPassword } from "@/app/ui/admin/forms/ForgotPassword";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [_: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  if (params.error) {
    const error: string = params.error as string;

    return <h3>{error}</h3>;
  }

  if (params.token) {
    const tok = params.token as string;

    return <ResetPassword token={tok} />;
  }

  return <ForgotPassword />;
}
