import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import {
  getMediaRequests,
  replyToRequest,
  deleteRequest,
} from "@/lib/dal/dto/media-requests";

vi.mock(import("server-only"), () => {
  return {};
});
vi.mock(import("@/lib/prisma"));
const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: sendMock,
    };
  },
}));
/**
 * Tests the getMediaRequests function, including successful retrieval,
 * filtering, searching, sorting, pagination, default parameters, and
 * database error handling.
 */
describe("getMediaRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that media requests and their total count are returned
   * successfully when the database query succeeds.
   */
  it("returns requests and the total count", async () => {
    const requests = [
      {
        id: "1",
        email: "test@example.com",
        title: "The owl house",
        type: "TV Series",
        name: "My name",
        message: "hoot hoot",
        status: "pending",
      },
    ];
    vi.mocked(prisma.request.findMany).mockResolvedValue(requests as never);
    vi.mocked(prisma.request.count).mockResolvedValue(1);
    const result = await getMediaRequests({});

    expect(result).toEqual({
      success: true,
      data: requests,
      total: 1,
    });
  });
  /**
   * Verifies that search terms, media type filters, sorting options,
   * and pagination parameters are passed correctly to Prisma.
   */
  it("applies search, type, sorting, and pagination", async () => {
    vi.mocked(prisma.request.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.request.count).mockResolvedValue(0);
    await getMediaRequests({
      page: 2,
      limit: 10,
      search: "The owl house",
      type: "TV Series",
      sort: "title",
    });

    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: {
        type: "TV Series",
        OR: [
          {
            title: {
              contains: "The owl house",
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: "The owl house",
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: "The owl house",
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        title: "asc",
      },
      skip: 10,
      take: 10,
    });
  });
  /**
   * Verifies that an empty search term uses the default pagination
   * and sorting options without applying a search filter.
   */
  it("handles empty search with default parameters", async () => {
    vi.mocked(prisma.request.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.request.count).mockResolvedValue(0);

    const result = await getMediaRequests({
      search: "",
    });
    expect(result).toEqual({
      success: true,
      data: [],
      total: 0,
    });
    expect(prisma.request.findMany).toHaveBeenCalledWith({
      where: {
        type: undefined,
        OR: undefined,
      },
      orderBy: {
        name: "desc",
      },
      skip: 0,
      take: 12,
    });
  });
  /**
   * Verifies that a database error produces a failure result
   * containing an empty request list and a total count of zero.
   */
  it("returns a failure when the database throws an error", async () => {
    vi.mocked(prisma.request.findMany).mockRejectedValue(
      new Error("Database error"),
    );
    const result = await getMediaRequests({});

    expect(result).toEqual({
      success: false,
      data: [],
      total: 0,
    });
  });
});
/**
 * Tests the replyToRequest function, including successful email delivery,
 * request status updates, missing requests, email service failures,
 * and empty message validation.
 */
describe("replyToRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that a reply email is sent to the requester and the request
   * status is updated to "replied" after successful email delivery.
   */
  it("sends an email and marks the request as replied", async () => {
    const request = {
      id: "1",
      email: "test@example.com",
      title: "The owl house",
    };
    vi.mocked(prisma.request.findUnique).mockResolvedValue(request as never);
    sendMock.mockResolvedValue({
      data: {
        id: "1",
      },
      error: null,
    });
    vi.mocked(prisma.request.update).mockResolvedValue({
      ...request,
      status: "replied",
    } as never);
    await replyToRequest("1", "Request heard");

    expect(sendMock).toHaveBeenCalledWith({
      from: "you@yourdomain.com",
      to: "test@example.com",
      subject: "Re: The owl house",
      text: "Request heard",
    });
    expect(prisma.request.update).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
      data: {
        status: "replied",
      },
    });
  });

  /**
   * Verifies that replying to a nonexistent request throws an error
   * without sending an email or updating the database.
   */
  it("throws an error when the request does not exist", async () => {
    vi.mocked(prisma.request.findUnique).mockResolvedValue(null);

    await expect(replyToRequest("missing-id", "Hello")).rejects.toThrow(
      "Request not found",
    );

    expect(sendMock).not.toHaveBeenCalled();
    expect(prisma.request.update).not.toHaveBeenCalled();
  });

  /**
   * Verifies that an email service failure is propagated and the
   * request status is not updated.
   */
  it("throws an error when the email service fails", async () => {
    const request = {
      id: "1",
      email: "john@example.com",
      title: "Batman",
    };
    vi.mocked(prisma.request.findUnique).mockResolvedValue(request as never);

    sendMock.mockRejectedValue(new Error("Email service failed"));
    await expect(replyToRequest("1", "Hello")).rejects.toThrow(
      "Email service failed",
    );

    expect(prisma.request.update).not.toHaveBeenCalled();
  });

  /**
   * Verifies that a message containing only whitespace is rejected
   * before the request is retrieved or any external operations occur.
   */
  it("rejects an empty message", async () => {
    await expect(replyToRequest("1", "   ")).rejects.toThrow(
      "Message cannot be empty",
    );

    expect(prisma.request.findUnique).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
    expect(prisma.request.update).not.toHaveBeenCalled();
  });
});
/**
 * Tests the deleteRequest function, including successful deletion,
 * database failure handling, and validation of the request ID.
 */
describe("deleteRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the specified request is deleted and a successful
   * result is returned.
   */
  it("deletes the request successfully", async () => {
    vi.mocked(prisma.request.delete).mockResolvedValue({
      id: "1",
    } as never);
    const result = await deleteRequest("1");

    expect(prisma.request.delete).toHaveBeenCalledWith({
      where: {
        id: "1",
      },
    });
    expect(result).toEqual({
      success: true,
    });
  });
  /**
   * Verifies that a database deletion failure throws an error.
   */
  it("throws an error when deletion fails", async () => {
    vi.mocked(prisma.request.delete).mockRejectedValue(
      new Error("Database error"),
    );
    await expect(deleteRequest("1")).rejects.toThrow("Delete failed");
  });

  /**
   * Verifies that an empty or whitespace-only request ID is rejected
   * without attempting to delete a database record.
   */
  it("rejects an empty request ID", async () => {
    await expect(deleteRequest("   ")).rejects.toThrow(
      "Request ID cannot be empty",
    );

    expect(prisma.request.delete).not.toHaveBeenCalled();
  });
});
