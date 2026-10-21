import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Hoist storage variables so they exist before static imports evaluate
 * At first, I put all the import first at the top, but after running it, it failed a test of not accessing magic link
 * Its because it executed before the modules are initialized so thats why its in the hoisted and then the imports goes next
 * And it seems to work
 */
const { capturedConfigs } = vi.hoisted(() => ({
  capturedConfigs: {
    betterAuth: null as any,
    magicLink: null as any,
  },
}));

vi.mock("better-auth", () => ({
  betterAuth: vi.fn().mockImplementation((config) => {
    capturedConfigs.betterAuth = config;
    return {
      $Infer: {
        Session: {} as any,
      },
    };
  }),
}));

vi.mock("better-auth/adapters/prisma", () => ({
  prismaAdapter: vi.fn().mockImplementation((prismaClient, options) => ({
    prismaClient,
    ...options,
  })),
}));

vi.mock("@/lib/prisma", () => ({
  default: { _isPrismaClient: true },
}));

vi.mock("better-auth/plugins", () => ({
  admin: vi.fn().mockReturnValue({ id: "admin-plugin" }),
  magicLink: vi.fn().mockImplementation((config) => {
    capturedConfigs.magicLink = config;
    return { id: "magic-link-plugin", config };
  }),
}));

vi.mock("better-auth/next-js", () => ({
  nextCookies: vi.fn().mockReturnValue({ id: "next-cookies-plugin" }),
}));

vi.mock("@/lib/emailer", () => ({
  sendMagicLinkEmail: vi.fn(),
  sendPasswordWasResetEmail: vi.fn(),
  sendResetPasswordEmail: vi.fn(),
}));

import {
  sendMagicLinkEmail,
  sendPasswordWasResetEmail,
  sendResetPasswordEmail,
} from "@/lib/emailer";
import "@/lib/auth";

/**
 * URT-399: Implement unit testing for authentication
 * - Using Vitest as a framework for testing, this .ts tests the authentication to ensure
 *       the authentication works as intended
 * - Using imports from auth.ts, it test the authentication such as password resets
 * - Make sure the authentication is worked as intended for like login, etc.
 */
describe("auth.ts Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * URT-399 Implementation: Unit tests for the `emailAndPassword.sendResetPassword` callback function.
   *
   * Verifies data forwarding to `sendResetPasswordEmail`, resilience against unhandled
   * promise rejections via the `void` operator, and handling of URL and user payload edge cases.
   *
   * @param
   *  - payload object from BetterAuth
   *  - user requesting password recovery and inputs users registered email and one time reset link with verification
   * @returns
   *  - passes the authentication
   */
  describe("emailAndPassword.sendResetPassword", () => {
    it("calls sendResetPasswordEmail with correct email and url payload", async () => {
      vi.mocked(sendResetPasswordEmail).mockResolvedValueOnce(undefined as any);

      const callback =
        capturedConfigs.betterAuth.emailAndPassword.sendResetPassword;
      await callback({
        user: { email: "user@example.com" },
        url: "https://theunreeltake.vercel.app/reset-password?token=xyz",
      });

      expect(sendResetPasswordEmail).toHaveBeenCalledTimes(1);
      expect(sendResetPasswordEmail).toHaveBeenCalledWith({
        emailTo: "user@example.com",
        url: "https://theunreeltake.vercel.app/reset-password?token=xyz",
      });
    });

    it("handles underlying mailer failure without throwing an unhandled rejection", async () => {
      vi.mocked(sendResetPasswordEmail).mockRejectedValueOnce(
        new Error("SMTP server connection timeout"),
      );

      const callback =
        capturedConfigs.betterAuth.emailAndPassword.sendResetPassword;

      await expect(
        callback({
          user: { email: "user@example.com" },
          url: "https://theunreeltake.vercel.app/reset-password",
        }),
      ).resolves.toBeUndefined();

      expect(sendResetPasswordEmail).toHaveBeenCalledTimes(1);
    });

    it("handles edge case when url contains query strings, fragments, and special characters", async () => {
      vi.mocked(sendResetPasswordEmail).mockResolvedValueOnce(undefined as any);

      const complexUrl =
        "https://theunreeltake.vercel.app/reset?token=abc-123&redirect=%2Fdashboard#step2";
      const callback =
        capturedConfigs.betterAuth.emailAndPassword.sendResetPassword;

      await callback({
        user: { email: "user@example.com" },
        url: complexUrl,
      });

      expect(sendResetPasswordEmail).toHaveBeenCalledWith({
        emailTo: "user@example.com",
        url: complexUrl,
      });
    });

    it("handles edge case when user payload includes extra properties along with email", async () => {
      vi.mocked(sendResetPasswordEmail).mockResolvedValueOnce(undefined as any);

      const callback =
        capturedConfigs.betterAuth.emailAndPassword.sendResetPassword;
      await callback({
        user: {
          email: "admin@example.com",
          id: "usr_999",
          role: "admin",
          emailVerified: true,
        },
        url: "https://theunreeltake.vercel.app/reset",
      });

      expect(sendResetPasswordEmail).toHaveBeenCalledWith({
        emailTo: "admin@example.com",
        url: "https://theunreeltake.vercel.app/reset",
      });
    });
  });

  /**
   * URT-399 Implementation: Unit tests for the `emailAndPassword.onPasswordReset` callback function.
   *
   * Verifies data dispatch to `sendPasswordWasResetEmail`, graceful non-blocking failure
   * handling on emailer exceptions, and tolerance of incomplete or metadata-heavy user objects.
   *
   * @param
   *  - password modified, user's email, optional display name of user
   * @returns
   *  - resolves when the confirmation notification is complete
   */
  describe("emailAndPassword.onPasswordReset", () => {
    it("calls sendPasswordWasResetEmail passing the user object", async () => {
      vi.mocked(sendPasswordWasResetEmail).mockResolvedValueOnce(
        undefined as any,
      );

      const callback =
        capturedConfigs.betterAuth.emailAndPassword.onPasswordReset;
      const userPayload = { email: "user@example.com", name: "Alex" };

      await callback({ user: userPayload });

      expect(sendPasswordWasResetEmail).toHaveBeenCalledTimes(1);
      expect(sendPasswordWasResetEmail).toHaveBeenCalledWith(userPayload);
    });

    it("handles emailer failure gracefully without crashing the process", async () => {
      vi.mocked(sendPasswordWasResetEmail).mockRejectedValueOnce(
        new Error("Rate limit exceeded"),
      );

      const callback =
        capturedConfigs.betterAuth.emailAndPassword.onPasswordReset;

      await expect(
        callback({ user: { email: "user@example.com", name: "Alex" } }),
      ).resolves.toBeUndefined();

      expect(sendPasswordWasResetEmail).toHaveBeenCalledTimes(1);
    });

    it("handles edge case when user object is minimal (only email, no name)", async () => {
      vi.mocked(sendPasswordWasResetEmail).mockResolvedValueOnce(
        undefined as any,
      );

      const callback =
        capturedConfigs.betterAuth.emailAndPassword.onPasswordReset;
      const minimalUser = { email: "minimal@example.com" };

      await callback({ user: minimalUser });

      expect(sendPasswordWasResetEmail).toHaveBeenCalledWith(minimalUser);
    });

    it("handles edge case with extra nested metadata on user object", async () => {
      vi.mocked(sendPasswordWasResetEmail).mockResolvedValueOnce(
        undefined as any,
      );

      const callback =
        capturedConfigs.betterAuth.emailAndPassword.onPasswordReset;
      const userWithMetadata = {
        email: "member@example.com",
        name: "Jordan",
        createdAt: new Date("2026-01-01"),
        metadata: { tier: "premium", active: true },
      };

      await callback({ user: userWithMetadata });

      expect(sendPasswordWasResetEmail).toHaveBeenCalledWith(userWithMetadata);
    });
  });

  /**
   * URT-399 Implementation: Unit tests for the `magicLink.sendMagicLink` plugin callback function.
   *
   * Verifies delivery to `sendMagicLinkEmail`, error bubbling suppression via `void`,
   * and handling of complex query strings, redirections, and subdomain-based email addresses.
   *
   * @param
   *  - destination of the email for login, authenticated magic link redirect URL
   * @returns
   *  - resolves when the magic link displatch is finish
   */
  describe("magicLink.sendMagicLink", () => {
    it("calls sendMagicLinkEmail with destination email and url", async () => {
      vi.mocked(sendMagicLinkEmail).mockResolvedValueOnce(undefined as any);

      const callback = capturedConfigs.magicLink.sendMagicLink;
      await callback({
        email: "member@example.com",
        url: "https://theunreeltake.vercel.app/magic?token=xyz",
      });

      expect(sendMagicLinkEmail).toHaveBeenCalledTimes(1);
      expect(sendMagicLinkEmail).toHaveBeenCalledWith({
        emailTo: "member@example.com",
        url: "https://theunreeltake.vercel.app/magic?token=xyz",
      });
    });

    it("handles network or dispatch errors without raising an unhandled exception", async () => {
      vi.mocked(sendMagicLinkEmail).mockRejectedValueOnce(
        new Error("Network connection dropped"),
      );

      const callback = capturedConfigs.magicLink.sendMagicLink;

      await expect(
        callback({
          email: "member@example.com",
          url: "https://theunreeltake.vercel.app/magic?token=xyz",
        }),
      ).resolves.toBeUndefined();

      expect(sendMagicLinkEmail).toHaveBeenCalledTimes(1);
    });

    it("handles edge case when magic link contains complex callback parameters", async () => {
      vi.mocked(sendMagicLinkEmail).mockResolvedValueOnce(undefined as any);

      const callback = capturedConfigs.magicLink.sendMagicLink;
      const destinationUrl =
        "https://theunreeltake.vercel.app/auth/verify?token=tok_987&callbackUrl=%2Fadmin%2Fposts";

      await callback({
        email: "writer@example.com",
        url: destinationUrl,
      });

      expect(sendMagicLinkEmail).toHaveBeenCalledWith({
        emailTo: "writer@example.com",
        url: destinationUrl,
      });
    });

    it("handles edge case with subdomain-formatted recipient email", async () => {
      vi.mocked(sendMagicLinkEmail).mockResolvedValueOnce(undefined as any);

      const callback = capturedConfigs.magicLink.sendMagicLink;
      await callback({
        email: "editor@staff.theunreeltake.com",
        url: "https://theunreeltake.vercel.app/magic",
      });

      expect(sendMagicLinkEmail).toHaveBeenCalledWith({
        emailTo: "editor@staff.theunreeltake.com",
        url: "https://theunreeltake.vercel.app/magic",
      });
    });
  });

  /**
   * URT-399 Implementation: Unit tests for verifying static `betterAuth` configuration setup.
   *
   * Validates database adapter assignment with PostgreSQL provider,
   * trusted origins whitelist, and correct plugin registrations (admin, magicLink, nextCookies).
   *
   * @param
   *  - captureBetterAuthConfig, its database, the origin URL, plugins
   * @returns
   *  - asserts init structure and properties
   */
  describe("betterAuth initialization options", () => {
    it("configures PostgreSQL database adapter with Prisma client", () => {
      expect(capturedConfigs.betterAuth.database).toEqual(
        expect.objectContaining({
          provider: "postgresql",
        }),
      );
    });

    it("whitelists all required trusted origins", () => {
      expect(capturedConfigs.betterAuth.trustedOrigins).toEqual([
        "http://localhost:3000",
        "https://theunreeltake-preview.vercel.app",
        "https://theunreeltake.vercel.app",
      ]);
    });

    it("enables emailAndPassword and registers admin, magicLink, and nextCookies plugins", () => {
      expect(capturedConfigs.betterAuth.emailAndPassword.enabled).toBe(true);
      expect(capturedConfigs.betterAuth.plugins).toHaveLength(3);
    });
  });
});
