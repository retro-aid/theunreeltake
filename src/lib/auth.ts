import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { admin, magicLink } from "better-auth/plugins";
import {
  sendMagicLinkEmail,
  sendPasswordWasResetEmail,
  sendResetPasswordEmail,
} from "@/lib/emailer";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "https://theunreeltake-preview.vercel.app",
    "https://theunreeltake.vercel.app",
  ],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      void sendResetPasswordEmail({ emailTo: user.email, url: url });
    },
    onPasswordReset: async ({ user }) => {
      void sendPasswordWasResetEmail(user);
    },
  },
  plugins: [
    admin(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        void sendMagicLinkEmail({ emailTo: email, url: url });
      },
    }),
    nextCookies(),
  ],
});

export type SessionData = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;
