import { beforeEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";
import { revalidatePath } from "next/cache";
import { AppError, toResult } from "@/lib/errors";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/**
 * Tests for returning the standard result instead of throwing
 *
 * Checks:
 *    Returns the data when the function succeeds
 *    Validation errors become a 400 with the first issue's message
 *    AppErrors keep their message and status
 *    Unexpected errors become a generic 500
 *    Refreshes the given pages whether the function succeeds or fails
 *    Doesn't refresh anything when no page is given
 */
describe("toResult", () => {
  it("returns the data when the function succeeds", async () => {
    expect(await toResult(async () => "ok")).toStrictEqual({
      data: "ok",
      error: null,
    });
  });

  it.each([
    [
      "a validation error",
      () => z.string().min(1, "Name is required").parse(""),
      { message: "Name is required", status: 400 },
    ],
    [
      "an AppError",
      () => {
        throw new AppError("Forbidden", 403);
      },
      { message: "Forbidden", status: 403 },
    ],
    [
      "an unexpected error",
      () => {
        throw new Error("connect ECONNREFUSED 10.0.0.1");
      },
      { message: "Something went wrong", status: 500 },
    ],
  ])("turns %s into the standard error", async (_case, fn, error) => {
    expect(await toResult(async () => fn())).toStrictEqual({
      data: null,
      error,
    });
  });

  it.each([
    ["succeeds", async () => "ok"],
    [
      "fails",
      async () => {
        throw new AppError("Rate limit exceeded", 429);
      },
    ],
  ])("refreshes the given pages when the function %s", async (_case, fn) => {
    await toResult(fn, "/dashboard/email");

    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/email", "layout");
  });

  it("doesn't refresh anything when no page is given", async () => {
    await toResult(async () => "ok");

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
