import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin } from "@/lib/dal/utils";
import * as email from "@/lib/dal/dto/email";

vi.mock(import("server-only"), () => {
  return {};
});
vi.mock(import("@/lib/dal/utils"), () => ({ requireAdmin: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));

const { automations, events } = vi.hoisted(() => ({
  automations: {
    list: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
  },
  events: { list: vi.fn(), create: vi.fn() },
}));
vi.mock("resend", () => ({
  Resend: class {
    automations = automations;
    events = events;
  },
}));

/** Builds a successful Resend response. */
const ok = (data: unknown) => ({ data, error: null });

/** Builds a failed Resend response. */
const fail = (message: string, statusCode = 500) => ({
  data: null,
  error: { message, statusCode },
});

const allEvents = [
  { name: "unreeltake.new_post" },
  { name: "unreeltake.comment_reply" },
  { name: "unreeltake.request_made" },
];

beforeEach(() => {
  vi.resetAllMocks();
  events.list.mockResolvedValue(ok({ data: allEvents, has_more: false }));
});

const id = "automation-id";

/**
 * Builds an automation the way Resend sends it back. Configs are snake_case.
 */
const fromResend = (eventName: string, status = "enabled") => ({
  object: "automation",
  id,
  name: "Thanks for your request",
  status,
  steps: [
    { key: "trigger", type: "trigger", config: { event_name: eventName } },
    { key: "wait", type: "delay", config: { duration: "1 hour" } },
    {
      key: "email",
      type: "send_email",
      config: {
        template: { id: "template-id" },
        subject: null,
        from: "us@example.com",
        reply_to: "help@example.com",
      },
    },
    {
      key: "tag",
      type: "add_to_segment",
      config: { segment_id: "segment-id" },
    },
  ],
  connections: [
    { from: "trigger", to: "wait", type: "default" },
    { from: "wait", to: "email", type: "default" },
    { from: "email", to: "tag", type: "default" },
  ],
});

/**
 * Tests that every function blocks non-admins
 *
 * Checks:
 *    Rejects with the auth error
 *    Never calls Resend
 */
describe("admin access", () => {
  it.each([
    ["list", () => email.automations.list()],
    ["get", () => email.automations.get(id)],
    ["update", () => email.automations.update(id, { enabled: true })],
  ] as const)(
    "%s rejects non-admins without calling Resend",
    async (method, call) => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Forbidden"));

      await expect(call()).rejects.toThrow("Forbidden");
      expect(automations[method]).not.toHaveBeenCalled();
    },
  );
});

/**
 * Tests for listing automations
 *
 * Checks:
 *    Returns each automation's ID, name, linked event, and on/off
 *    Shows an automation that isn't linked to one of our events as null
 *    Creates our events when they're missing, with their variables
 *    Doesn't create events that already exist
 */
describe("list", () => {
  it("returns each automation's ID, name, linked event, and on/off", async () => {
    automations.list.mockResolvedValueOnce(
      ok({ data: [{ id }], has_more: false }),
    );
    automations.get.mockResolvedValueOnce(
      ok(fromResend("unreeltake.request_made")),
    );

    expect(await email.automations.list()).toStrictEqual([
      {
        id,
        name: "Thanks for your request",
        event: "unreeltake.request_made",
        enabled: true,
      },
    ]);
    expect(automations.list).toHaveBeenCalledWith({ limit: 100 });
  });

  it("shows an automation that isn't linked to one of our events as null", async () => {
    automations.list.mockResolvedValueOnce(
      ok({ data: [{ id }], has_more: false }),
    );
    automations.get.mockResolvedValueOnce(
      ok(fromResend("something.else", "disabled")),
    );

    const [result] = await email.automations.list();

    expect(result.event).toBeNull();
    expect(result.enabled).toBe(false);
  });

  it("creates our events when they're missing, with their variables", async () => {
    events.list.mockResolvedValueOnce(
      ok({ data: [{ name: "unreeltake.new_post" }], has_more: false }),
    );
    events.create.mockResolvedValue(ok({ object: "event", id: "event-id" }));
    automations.list.mockResolvedValueOnce(ok({ data: [], has_more: false }));

    await email.automations.list();

    expect(events.create).toHaveBeenCalledTimes(2);
    expect(events.create).toHaveBeenCalledWith({
      name: "unreeltake.request_made",
      schema: { NAME: "string", TITLE: "string" },
    });
  });

  it("doesn't create events that already exist", async () => {
    automations.list.mockResolvedValueOnce(ok({ data: [], has_more: false }));

    await email.automations.list();

    expect(events.create).not.toHaveBeenCalled();
  });
});

/**
 * Tests for loading one automation
 *
 * Checks:
 *    Returns the automation's linked event and on/off
 *    Rejects a blank ID without calling Resend
 *    Rejects with Resend's message and status when it doesn't exist
 */
describe("get", () => {
  it("returns the automation's linked event and on/off", async () => {
    automations.get.mockResolvedValueOnce(
      ok(fromResend("unreeltake.comment_reply")),
    );

    expect(await email.automations.get(id)).toStrictEqual({
      id,
      name: "Thanks for your request",
      event: "unreeltake.comment_reply",
      enabled: true,
    });
  });

  it("rejects a blank ID without calling Resend", async () => {
    await expect(email.automations.get(" ")).rejects.toThrow(
      "Automation ID is required",
    );
    expect(automations.get).not.toHaveBeenCalled();
  });

  it("rejects with Resend's message and status when it doesn't exist", async () => {
    automations.get.mockResolvedValueOnce(fail("Automation not found", 404));

    await expect(email.automations.get(id)).rejects.toMatchObject({
      message: "Automation not found",
      status: 404,
    });
  });
});

/**
 * Tests for linking an automation and turning it on or off
 *
 * Checks:
 *    Turns an automation on or off without touching its steps
 *    Links it to an event and keeps every other step exactly the same
 *    Rejects an automation with no trigger to link
 *    Rejects an event that isn't one of ours, or nothing to update
 */
describe("update", () => {
  it("turns an automation on or off without touching its steps", async () => {
    automations.update.mockResolvedValueOnce(ok({ object: "automation", id }));

    const result = await email.automations.update(id, { enabled: false });

    expect(result).toStrictEqual({ id });
    expect(automations.update).toHaveBeenCalledWith(id, {
      status: "disabled",
    });
    expect(automations.get).not.toHaveBeenCalled();
  });

  it("links it to an event and keeps every other step exactly the same", async () => {
    automations.get.mockResolvedValueOnce(ok(fromResend("old.event")));
    automations.update.mockResolvedValueOnce(ok({ object: "automation", id }));

    await email.automations.update(id, {
      event: "unreeltake.new_post",
      enabled: true,
    });

    expect(automations.update).toHaveBeenCalledWith(id, {
      status: "enabled",
      steps: [
        {
          key: "trigger",
          type: "trigger",
          config: { eventName: "unreeltake.new_post" },
        },
        { key: "wait", type: "delay", config: { duration: "1 hour" } },
        {
          key: "email",
          type: "send_email",
          config: {
            template: { id: "template-id" },
            subject: undefined,
            from: "us@example.com",
            replyTo: "help@example.com",
          },
        },
        {
          key: "tag",
          type: "add_to_segment",
          config: { segmentId: "segment-id" },
        },
      ],
      connections: fromResend("old.event").connections,
    });
  });

  it("rejects an automation with no trigger to link", async () => {
    automations.get.mockResolvedValueOnce(
      ok({ ...fromResend("old.event"), steps: [], connections: [] }),
    );

    await expect(
      email.automations.update(id, { event: "unreeltake.new_post" }),
    ).rejects.toMatchObject({ status: 400 });
    expect(automations.update).not.toHaveBeenCalled();
  });

  it.each([
    ["an event that isn't one of ours", { event: "post.deleted" }],
    ["nothing to update", {}],
  ])("rejects %s", async (_case, input) => {
    await expect(
      email.automations.update(id, input as never),
    ).rejects.toThrow();
    expect(automations.update).not.toHaveBeenCalled();
  });
});

/**
 * Tests for finding the automation linked to an event
 *
 * Checks:
 *    Returns the automation that's on and linked to the event
 *    Returns null when none is linked
 *    Only looks at automations that are on, without an admin check
 */
describe("findLinked", () => {
  it("returns the automation that's on and linked to the event", async () => {
    automations.list.mockResolvedValueOnce(
      ok({ data: [{ id: "a" }, { id: "b" }], has_more: false }),
    );
    automations.get
      .mockResolvedValueOnce(ok(fromResend("unreeltake.request_made")))
      .mockResolvedValueOnce(
        ok({ ...fromResend("unreeltake.new_post"), id: "b" }),
      );

    const result = await email.automations.findLinked("unreeltake.new_post");

    expect(result?.id).toBe("b");
  });

  it("returns null when none is linked", async () => {
    automations.list.mockResolvedValueOnce(
      ok({ data: [{ id }], has_more: false }),
    );
    automations.get.mockResolvedValueOnce(
      ok(fromResend("unreeltake.request_made")),
    );

    expect(
      await email.automations.findLinked("unreeltake.new_post"),
    ).toBeNull();
  });

  it("only looks at automations that are on, without an admin check", async () => {
    automations.list.mockResolvedValueOnce(ok({ data: [], has_more: false }));

    await email.automations.findLinked("unreeltake.new_post");

    expect(automations.list).toHaveBeenCalledWith({
      status: "enabled",
      limit: 100,
    });
    expect(requireAdmin).not.toHaveBeenCalled();
  });
});
