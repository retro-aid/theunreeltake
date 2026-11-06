import { revalidatePath } from "next/cache";
import * as z from "zod";

/**
 * An error with a status code, for failures we expect (not logged in, not an
 * admin, Resend rejected the request, and so on).
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * The standard result returned by server actions: the data or an error.
 */
export type UnreelResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; status: number } };

/**
 * Runs a function and returns its result as an {@link UnreelResult} instead
 * of throwing.
 *
 * @remarks
 * Validation errors become 400s and {@link AppError}s keep their status.
 * Anything else becomes a generic 500 so internal details aren't shown.
 *
 * @param fn - The function to run, usually a DAL call.
 * @param revalidate - A page to refresh afterwards, even if `fn` fails.
 * @returns `{ data, error: null }`, or `{ data: null, error }` if it threw.
 */
export async function toResult<T>(
  fn: () => Promise<T>,
  revalidate?: string,
): Promise<UnreelResult<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError)
      return {
        data: null,
        error: { message: error.issues[0].message, status: 400 },
      };
    if (error instanceof AppError)
      return {
        data: null,
        error: { message: error.message, status: error.status },
      };
    return {
      data: null,
      error: { message: "Something went wrong", status: 500 },
    };
  } finally {
    if (revalidate) revalidatePath(revalidate, "layout");
  }
}
