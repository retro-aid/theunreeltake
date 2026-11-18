import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { PaginationOptions } from "resend";
import { PaginationOutputDTO } from "@/lib/schemas/email/util-schemas";

export async function getCurrentSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) throw new AppError("Unauthorized", 401);

  return session;
}

/**
 * Gets the current session and makes sure the user is an admin.
 *
 * @returns The current session.
 * @throws "Unauthorized" if no one is logged in, or "Forbidden" if the user
 * is not an admin.
 */
export async function requireAdmin() {
  const session = await getCurrentSession();

  if (session.user.role !== "admin") throw new AppError("Forbidden", 403);

  return session;
}


export function convertToPaginationOptions(paginationObject: PaginationOutputDTO): PaginationOptions {

  const { paginateOption, limit } = paginationObject;

  const options: PaginationOptions = {
    limit: limit
  };

  if (paginateOption === "after") options.after = paginationObject.after;
  else if (paginateOption === "before") options.before = paginationObject.before;

  return options;
}