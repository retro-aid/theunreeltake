import "server-only";
import { Resend } from "resend";

/**
 * Shared resend client used by every email feature.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Returns the data from a resend response, or throws its error.
 *
 * @param response - The object returned by a Resend call
 * @returns The response data.
 * @throws If Resend returned an error
 */
export function unwrap<T>(
  response:
    { data: T; error: null } | { data: null; error: { message: string } },
) {
  if (response.error) throw new Error(response.error.message);

  return response.data;
}
