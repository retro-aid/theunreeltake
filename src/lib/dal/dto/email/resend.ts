import "server-only";
import { Resend } from "resend";
import { AppError } from "@/lib/errors";

/**
 * Shared resend client used by every email feature.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * The default reply from address to be used if not specified
 */
export const resendFrom = process.env.RESEND_FROM ?? "";

/**
 * Returns the data from a resend response, or throws its error.
 *
 * @remarks
 * The error keeps Resend's status code, so
 * the UI can tell what kind of failure it was.
 *
 * @param response - The object returned by a Resend call
 * @returns The response data.
 * @throws An {@link AppError} with Resend's message and status code
 */
export function unwrap<T>(
  response:
    | { data: T; error: null }
    | { data: null; error: { message: string; statusCode: number | null } },
) {
  if (response.error)
    throw new AppError(
      response.error.message,
      response.error.statusCode ?? 500,
    );

  return response.data;
}
