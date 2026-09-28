import "server-only";

import { Resend } from "resend";
import { User } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);
const resendFrom: string =
  process.env.RESEND_FROM ?? "noreply.theunreeltake@resend.dev";
const appUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export async function sendResetPasswordEmail({
  emailTo,
  url,
}: {
  emailTo: string;
  url: string;
}) {
  await resend.emails.send({
    from: resendFrom,
    to: emailTo,
    subject: "Reset your password",
    text: `Click the link to reset your password: ${url}`,
  });
}

export async function sendPasswordWasResetEmail(
  user: Pick<User, "email" | "name">,
) {
  await resend.emails.send({
    from: resendFrom,
    to: user.email,
    subject: "Password Reset",
    text: `Hello, ${user.name}. Your password has been reset. If this wasn't you, please contact your administrator.`,
  });
}

export async function sendMagicLinkEmail({
  emailTo,
  url,
}: {
  emailTo: string;
  url: string;
}) {
  await resend.emails.send({
    from: resendFrom,
    to: emailTo,
    subject: "Sign into your account",
    text: `Click the link to sign into your account on The UnReel Take: ${url}`,
  });
}

export async function sendInvitationEmail(emailTo: string, token: string) {
  const inviteLink = `${appUrl}/register?token=${token}`;

  await resend.emails.send({
    from: resendFrom,
    to: emailTo,
    subject: "You have been invited to join the UnReel Take",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to The UnReel Take!</h2>
        <p>You have been invited to join the admin team as a new writer.</p>
        <br/>
        <a href="${inviteLink}" style="padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; display: inline-block;">
          Create Your Account
        </a>
      </div>
    `,
  });
}
