import { beforeEach, vi, describe, it, expect, afterEach } from "vitest";
import { requireAdmin } from "@/lib/dal/utils";
import type {
  ListBroadcastFormInput,
  CreateBroadcastFormInput,
} from "@/lib/schemas/email/broadcast-schemas";
import * as emailBroadcast from "@/lib/dal/dto/email/broadcast";

vi.mock(import("server-only"), () => {
  return {};
});

vi.mock(import("@/lib/dal/utils"), () => ({ requireAdmin: vi.fn() }));

const { broadcasts } = vi.hoisted(() => ({
  broadcasts: {
    list: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("resend", () => ({
  Resend: class {
    broadcasts = broadcasts;
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

const ok = (data: unknown) => ({ data, error: null });

/** Builds a failed Resend response. */
const fail = (message: string) => ({ data: null, error: { message } });

/**
 * Tests that every function blocks non-admins
 *
 * Checks:
 *    Rejects with the auth error
 *    Never calls Resend
 */
describe("admin access", () => {
  const mockList: ListBroadcastFormInput = { paginateOption: "none" };
  const mockCreate: CreateBroadcastFormInput = {
    html: "",
    segmentId: "",
    subject: "",
  };

  it.each([
    ["list", () => emailBroadcast.list(mockList)],
    ["create", () => emailBroadcast.create(mockCreate)],
  ] as const)(
    "%s rejects non-admins without calling Resend",
    async (method, call) => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Forbidden"));

      await expect(call()).rejects.toThrow("Forbidden");
      expect(broadcasts[method]).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["list", () => emailBroadcast.list(mockList)],
    ["create", () => emailBroadcast.create(mockCreate)],
  ] as const)("%s returns a success response", async (method, call) => {
    const mockSuccess = ok({ data: [], has_more: false });

    broadcasts[method].mockResolvedValueOnce(mockSuccess);

    await expect(call()).resolves.toEqual(mockSuccess);
  });

  it.each([
    ["list", () => emailBroadcast.list(mockList)],
    ["create", () => emailBroadcast.create(mockCreate)],
  ] as const)("%s returns an error response", async (method, call) => {
    const mockFail = fail("Failed");

    broadcasts[method].mockResolvedValueOnce(mockFail);

    await expect(call()).resolves.toEqual(mockFail);
  });
});

describe("list", () => {
  const mockListNone: ListBroadcastFormInput = { paginateOption: "none" };
  const mockListBefore: ListBroadcastFormInput = {
    paginateOption: "before",
    before: "id",
  };
  const mockListAfter: ListBroadcastFormInput = {
    paginateOption: "after",
    after: "id",
  };

  it("queries for 25 items by default", async () => {
    await emailBroadcast.list(mockListNone);

    expect(broadcasts.list).toHaveBeenCalledWith({ limit: 25 });
  });

  it("queries for before and NOT after", async () => {
    await emailBroadcast.list(mockListBefore);

    expect(broadcasts.list).toHaveBeenCalledWith({
      before: "id",
      limit: 25,
      after: undefined,
    });
  });

  it("queries for after and NOT before", async () => {
    await emailBroadcast.list(mockListAfter);

    expect(broadcasts.list).toHaveBeenCalledWith({
      before: undefined,
      limit: 25,
      after: "id",
    });
  });

  it("applies a custom limit when given", async () => {
    await emailBroadcast.list({ limit: 10, paginateOption: "none" });

    expect(broadcasts.list).toHaveBeenCalledWith({ limit: 10 });
  });
});

describe("create", () => {
  const fakeNow = new Date(1900, 1, 1);

  const mockCreateInput: CreateBroadcastFormInput = {
    html: "",
    segmentId: "",
    subject: "",
    from: process.env.RESEND_FROM,
    scheduledAt: fakeNow.toISOString(),
  };

  const mockCreateOutput = {
    ...mockCreateInput,
    send: true,
  };

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(fakeNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to now if a scheduledAt is not passed", async () => {
    // Copy object and set scheduledAt to undefined
    const input = { ...mockCreateInput, scheduledAt: undefined };

    await emailBroadcast.create(input);

    expect(broadcasts.create).toHaveBeenCalledWith(mockCreateOutput);
  });

  it("defaults to env variable if from is not passed", async () => {
    // Copy object and set from to undefined
    const input = { ...mockCreateInput, from: undefined };

    await emailBroadcast.create(input);

    expect(broadcasts.create).toHaveBeenCalledWith(mockCreateOutput);
  });

  it("applies all required parameters to Resend API", async () => {
    await emailBroadcast.create(mockCreateInput);

    expect(broadcasts.create).toHaveBeenCalledWith(mockCreateOutput);
  });
});
