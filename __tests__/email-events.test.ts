import { beforeEach, describe, expect, it, vi } from "vitest";
import { after } from "next/server";
import * as email from "@/lib/dal/dto/email";

vi.mock(import("server-only"), () => {
  return {};
});
vi.mock("next/server", () => ({ after: vi.fn() }));

const { events, segments, automations, templates, broadcasts } = vi.hoisted(
  () => ({
    events: { send: vi.fn() },
    segments: { list: vi.fn() },
    automations: { list: vi.fn(), get: vi.fn() },
    templates: { get: vi.fn() },
    broadcasts: { create: vi.fn() },
  }),
);
vi.mock("resend", () => ({
  Resend: class {
    events = events;
    segments = segments;
    automations = automations;
    templates = templates;
    broadcasts = broadcasts;
  },
}));

/** Builds a successful Resend response. */
const ok = (data: unknown) => ({ data, error: null });

/** Builds a failed Resend response. */
const fail = (message: string) => ({
  data: null,
  error: { message, statusCode: 500 },
});

/** Runs the work that `postPublished` scheduled with `after`. */
const runAfter = () =>
  (vi.mocked(after).mock.calls[0][0] as () => Promise<void>)();

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  events.send.mockResolvedValue(ok({ event: "sent" }));
});

/**
 * Tests for the comment reply event
 *
 * Checks:
 *    Sends the event to the original commenter with the post and reply
 *    Leaves out an empty name so the template's fallback is used
 *    Doesn't throw when Resend fails
 */
describe("commentReplied", () => {
  const reply = {
    email: "fan@example.com",
    name: "Sam",
    postTitle: "Alien: Romulus",
    postSlug: "alien-romulus",
    message: "Thanks for reading!",
  };

  it("sends the event to the original commenter with the post and reply", async () => {
    await email.events.commentReplied(reply);

    expect(events.send).toHaveBeenCalledWith({
      event: "unreeltake.comment_reply",
      email: "fan@example.com",
      payload: {
        NAME: "Sam",
        POST_TITLE: "Alien: Romulus",
        POST_URL: expect.stringMatching(/\/blog\/alien-romulus$/),
        REPLY: "Thanks for reading!",
      },
    });
  });

  it("leaves out an empty name so the template's fallback is used", async () => {
    await email.events.commentReplied({ ...reply, name: null });

    expect(events.send.mock.calls[0][0].payload).not.toHaveProperty("NAME");
  });

  it("doesn't throw when Resend fails", async () => {
    events.send.mockResolvedValueOnce(fail("Rate limit exceeded"));

    await expect(email.events.commentReplied(reply)).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});

/**
 * Tests for the request thank-you event
 *
 * Checks:
 *    Sends the event to the person who made the request
 *    Doesn't throw when the request to Resend itself fails
 */
describe("requestSubmitted", () => {
  const request = { email: "fan@example.com", name: "Sam", title: "Dune" };

  it("sends the event to the person who made the request", async () => {
    await email.events.requestSubmitted(request);

    expect(events.send).toHaveBeenCalledWith({
      event: "unreeltake.request_made",
      email: "fan@example.com",
      payload: { NAME: "Sam", TITLE: "Dune" },
    });
  });

  it("doesn't throw when the request to Resend itself fails", async () => {
    events.send.mockRejectedValueOnce(new Error("fetch failed"));

    await expect(
      email.events.requestSubmitted(request),
    ).resolves.toBeUndefined();
  });
});

/**
 * Tests for the new post email
 *
 * Checks:
 *    Sends one broadcast to the Newsletter list with the template filled in
 *    Uses the automation's delay as the broadcast's schedule
 *    Does nothing when no new post automation is on
 *    Skips it when there's no Newsletter list
 *    Doesn't throw when Resend fails
 *    Doesn't throw when the email can't be scheduled
 */
describe("postPublished", () => {
  const post = { title: "Alien: Romulus", slug: "alien-romulus" };

  /** Builds a page of results the way Resend's list endpoints return them. */
  const page = (data: unknown[]) =>
    ok({ object: "list", data, has_more: false });

  /** A new post automation, the way Resend sends it back. */
  const newPostAutomation = (extraSteps: unknown[] = []) => ({
    id: "automation-id",
    name: "New post",
    status: "enabled",
    steps: [
      {
        key: "trigger",
        type: "trigger",
        config: { event_name: "unreeltake.new_post" },
      },
      ...extraSteps,
      {
        key: "email",
        type: "send_email",
        config: { template: { id: "template-id" } },
      },
    ],
    connections: [],
  });

  /** Sets up Resend with a linked automation, a template, and the lists. */
  const setUp = (automation = newPostAutomation()) => {
    automations.list.mockResolvedValueOnce(page([{ id: "automation-id" }]));
    automations.get.mockResolvedValueOnce(ok(automation));
    segments.list.mockResolvedValueOnce(
      page([
        { id: "movies-id", name: "Movie Reviews" },
        { id: "news-id", name: "newsletter" },
      ]),
    );
    templates.get.mockResolvedValueOnce(
      ok({
        subject: "New review: {{{POST_TITLE}}}",
        html: "<p>{{{POST_TITLE}}} {{{POST_URL}}} {{{AUTHOR}}} {{{RESEND_UNSUBSCRIBE_URL}}}</p>",
        from: null,
        variables: [
          { key: "AUTHOR", type: "string", fallback_value: "our team" },
        ],
      }),
    );
    broadcasts.create.mockResolvedValueOnce(ok({ id: "broadcast-id" }));
  };

  it("sends one broadcast to the Newsletter list with the template filled in", async () => {
    setUp();

    email.events.postPublished(post);
    await runAfter();

    expect(automations.list).toHaveBeenCalledWith({
      status: "enabled",
      limit: 100,
    });
    expect(broadcasts.create).toHaveBeenCalledTimes(1);
    expect(broadcasts.create).toHaveBeenCalledWith({
      segmentId: "news-id",
      from: expect.any(String),
      subject: "New review: Alien: Romulus",
      html: expect.stringMatching(
        /^<p>Alien: Romulus \S+\/blog\/alien-romulus our team \{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}<\/p>$/,
      ),
      name: "New post: Alien: Romulus",
      send: true,
      scheduledAt: undefined,
    });
    expect(events.send).not.toHaveBeenCalled();
  });

  it("uses the automation's delay as the broadcast's schedule", async () => {
    setUp(
      newPostAutomation([
        { key: "wait", type: "delay", config: { duration: "2 hours" } },
      ]),
    );

    email.events.postPublished(post);
    await runAfter();

    expect(broadcasts.create).toHaveBeenCalledWith(
      expect.objectContaining({ scheduledAt: "in 2 hours" }),
    );
  });

  it("does nothing when no new post automation is on", async () => {
    automations.list.mockResolvedValueOnce(page([]));

    email.events.postPublished(post);
    await runAfter();

    expect(broadcasts.create).not.toHaveBeenCalled();
  });

  it("skips it when there's no Newsletter list", async () => {
    setUp();
    segments.list.mockReset();
    segments.list.mockResolvedValueOnce(
      page([{ id: "movies-id", name: "Movie Reviews" }]),
    );

    email.events.postPublished(post);
    await runAfter();

    expect(broadcasts.create).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("doesn't throw when Resend fails", async () => {
    automations.list.mockResolvedValueOnce(fail("Rate limit exceeded"));

    email.events.postPublished(post);

    await expect(runAfter()).resolves.toBeUndefined();
    expect(broadcasts.create).not.toHaveBeenCalled();
  });

  it("doesn't throw when the email can't be scheduled", () => {
    vi.mocked(after).mockImplementationOnce(() => {
      throw new Error("`after` was called outside a request scope");
    });

    expect(() => email.events.postPublished(post)).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });
});
