import { beforeEach, vi, describe, it, expect, afterEach } from "vitest";
import { requireAdmin } from "@/lib/dal/utils";
import type {
  ListBroadcastInputDTO,
  CreateBroadcastInputDTO,
} from "@/lib/schemas/email/broadcast-schemas";
import * as emailBroadcast from "@/lib/dal/dto/email/broadcast";
import { AppError } from "@/lib/errors";

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

/**
 * Tests that every function blocks non-admins
 *
 * Checks:
 *    Rejects with the auth error
 *    Never calls Resend
 */
describe("admin access", () => {
  const mockList: ListBroadcastInputDTO = { paginateOption: "none" };
  const mockCreate: CreateBroadcastInputDTO = {
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
});

describe("list", () => {
  const resendSuccess = {
    data: { object: "list", data: [], has_more: false },
    error: null,
    headers: null,
  };

  const mockListNone: ListBroadcastInputDTO = { paginateOption: "none" };

  const mockListBefore: ListBroadcastInputDTO = {
    paginateOption: "before",
    before: "id",
  };

  const mockListAfter: ListBroadcastInputDTO = {
    paginateOption: "after",
    after: "id",
  };

  beforeEach(() => {
    broadcasts.list.mockResolvedValue(resendSuccess);
  });

  it("returns the correct DTO object", async () => {
    const mockOutput = { data: [], has_more: false };

    broadcasts.list.mockResolvedValueOnce(resendSuccess);

    await expect(emailBroadcast.list(mockListNone)).resolves.toStrictEqual(
      mockOutput,
    );
  });

  it("resolves errors gracefully", async () => {
    const resendFail = {
      data: null,
      error: { message: "A", statusCode: 500, name: "A" },
      headers: null,
    };

    broadcasts.list.mockResolvedValueOnce(resendFail);

    await expect(emailBroadcast.list(mockListNone)).rejects.toThrow(
      new AppError("A", 500),
    );
  });

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
  const resendSuccess = {
    data: { id: "A" },
    error: null,
    headers: null,
  };

  const fakeNow = new Date(1900, 1, 1);

  const mockCreateInput: CreateBroadcastInputDTO = {
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
    broadcasts.create.mockResolvedValue(resendSuccess);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the correct DTO object", async () => {
    const mockOutput = { id: "A" };

    broadcasts.create.mockResolvedValueOnce(resendSuccess);

    await expect(emailBroadcast.create(mockCreateInput)).resolves.toStrictEqual(
      mockOutput,
    );
  });

  it("resolves errors gracefully", async () => {
    const resendFail = {
      data: null,
      error: { message: "A", statusCode: 500, name: "A" },
      headers: null,
    };

    broadcasts.create.mockResolvedValueOnce(resendFail);

    await expect(emailBroadcast.create(mockCreateInput)).rejects.toThrow(
      new AppError("A", 500),
    );
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
