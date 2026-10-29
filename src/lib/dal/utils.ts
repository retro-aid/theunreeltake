import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getCurrentSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) throw new Error("Unauthorized");

  return session;
}

/**
 * Gets the current session and makes sure the user is an admin.
 *
 * @returns The current session
 * @throws "Unauthorized" if no one is logged in, "Forbidden" if the user
 * is not an admin.
 */
export async function requireAdmin() {
  const session = await getCurrentSession();

  if (session.user.role !== "admin") throw new Error("Forbidden");

  return session;
}
