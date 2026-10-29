import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin } from "@/lib/dal/utils";
import * as emailTemplates from "@/lib/dal/dto/email/templates";

vi.mock(import("server-only"), () => {
  return {};
});
vi.mock(import("@/lib/dal/utils"), () => ({ requireAdmin: vi.fn() }));

const { templates } = vi.hoisted(() => ({
  templates: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    publish: vi.fn(),
    remove: vi.fn(),
  },
}));
vi.mock("resend", () => ({
  Resend: class {
    templates = templates;
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  templates.list.mockResolvedValue(ok({ data: [], has_more: false }));
});

const id = "template-id";
const fields = {
  name: "password-reset",
  subject: "Reset your password",
  html: "<p>Click the link</p>",
};

const form = { ...fields, publish: true };
/** Builds a successful Resend response. */
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
  it.each([
    ["list", () => emailTemplates.list()],
    ["get", () => emailTemplates.get(id)],
    ["create", () => emailTemplates.create(form)],
    ["update", () => emailTemplates.update(id, form)],
    ["remove", () => emailTemplates.remove(id)],
  ] as const)(
    "%s rejects non-admins without calling Resend",
    async (method, call) => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Forbidden"));

      await expect(call()).rejects.toThrow("Forbidden");
      expect(templates[method]).not.toHaveBeenCalled();
    },
  );
});

/**
 * Tests that every function taking an ID rejects an empty one
 *
 * Checks:
 *    Rejects a blank ID without calling Resend
 */
describe("empty ID", () => {
  it.each([
    ["get", () => emailTemplates.get(" ")],
    ["update", () => emailTemplates.update(" ", form)],
    ["remove", () => emailTemplates.remove(" ")],
  ] as const)(
    "%s rejects a blank ID without calling Resend",
    async (method, call) => {
      await expect(call()).rejects.toThrow("Template ID is required");
      expect(templates[method]).not.toHaveBeenCalled();
    },
  );
});

/**
 * Tests for fetching all email templates
 *
 * Checks:
 *    Returns the list of templates from Resend
 *    Rejects with Resend's error message
 */
describe("list", () => {
  it("returns the list of templates from Resend", async () => {
    const list = [{ id, name: form.name }];
    templates.list.mockResolvedValueOnce(ok({ data: list, has_more: false }));

    const result = await emailTemplates.list();

    expect(result).toBe(list);
    expect(templates.list).toHaveBeenCalledWith({ limit: 100 });
  });

  it("rejects with Resend's error message", async () => {
    templates.list.mockResolvedValueOnce(fail("Invalid API key"));

    await expect(emailTemplates.list()).rejects.toThrow("Invalid API key");
  });
});

/**
 * Tests for fetching a single email template
 *
 * Checks:
 *    Returns the template by ID
 *    Rejects when the template doesn't exist
 */
describe("get", () => {
  it("returns the template by ID", async () => {
    const template = { id, ...fields, variables: null };
    templates.get.mockResolvedValueOnce(ok(template));

    const result = await emailTemplates.get(id);

    expect(result).toStrictEqual({ ...template, variables: [] });
    expect(templates.get).toHaveBeenCalledWith(id);
  });

  it("converts variables to the shape create and update expect", async () => {
    templates.get.mockResolvedValueOnce(
      ok({
        id,
        ...fields,
        variables: [
          {
            key: "NAME",
            type: "string",
            fallback_value: "there",
            created_at: "2026-10-28",
            updated_at: "2026-10-28",
          },
        ],
      }),
    );

    const result = await emailTemplates.get(id);

    expect(result.variables).toStrictEqual([
      { key: "NAME", type: "string", fallbackValue: "there" },
    ]);
  });

  it("rejects when the template does not exist", async () => {
    templates.get.mockResolvedValueOnce(fail("Template not found"));

    await expect(emailTemplates.get(id)).rejects.toThrow("Template not found");
  });
});

/**
 * Tests for creating an email template
 *
 * Checks:
 *    Creates the template and then publishes it when publish is true
 *    Trims whitespace from the name and subject
 *    Rejects missing fields without calling Resend
 *    Rejects a name another template already uses, ignoring case
 *    Doesn't publish when the create fails
 *    Rejects duplicate, reserved, or too many variables
 *    Explains that the template was saved when publishing fails
 */
describe("create", () => {
  it("creates the template and then publishes it when publish is true", async () => {
    templates.create.mockResolvedValueOnce(ok({ id }));
    templates.publish.mockResolvedValueOnce(ok({ id }));

    const result = await emailTemplates.create(form);

    expect(result).toStrictEqual({ id });
    expect(templates.create).toHaveBeenCalledWith(fields);
    expect(templates.publish).toHaveBeenCalledWith(id);
  });

  it("trims whitespace from the name and subject", async () => {
    templates.create.mockResolvedValueOnce(ok({ id }));
    templates.publish.mockResolvedValueOnce(ok({ id }));

    await emailTemplates.create({
      ...form,
      name: `  ${form.name}  `,
      subject: ` ${form.subject} `,
    });

    expect(templates.create).toHaveBeenCalledWith(fields);
  });

  it("rejects missing fields without calling Resend", async () => {
    await expect(
      emailTemplates.create({ ...form, subject: "" }),
    ).rejects.toThrow();
    expect(templates.create).not.toHaveBeenCalled();
  });

  it("rejects a name another template already uses, ignoring case", async () => {
    templates.list.mockResolvedValueOnce(
      ok({
        data: [{ id: "other-id", name: form.name.toUpperCase() }],
        has_more: false,
      }),
    );

    await expect(emailTemplates.create(form)).rejects.toThrow(
      "A template with that name already exists",
    );
    expect(templates.create).not.toHaveBeenCalled();
  });

  it("saves the template as a draft when publish is false", async () => {
    templates.create.mockResolvedValueOnce(ok({ id }));

    const result = await emailTemplates.create({ ...form, publish: false });

    expect(result).toStrictEqual({ id });
    expect(templates.publish).not.toHaveBeenCalled();
  });

  it("sends the template's variables to Resend", async () => {
    const variables = [
      { key: "NAME", type: "string" as const, fallbackValue: "there" },
    ];
    templates.create.mockResolvedValueOnce(ok({ id }));
    templates.publish.mockResolvedValueOnce(ok({ id }));

    await emailTemplates.create({ ...form, variables });

    expect(templates.create).toHaveBeenCalledWith({ ...fields, variables });
  });

  it("rejects a variable whose fallback doesn't match its type", async () => {
    const variables = [{ key: "COUNT", type: "number", fallbackValue: "ten" }];

    await expect(
      emailTemplates.create({ ...form, variables } as never),
    ).rejects.toThrow();
    expect(templates.create).not.toHaveBeenCalled();
  });

  it.each([
    [
      "duplicate keys",
      [
        { key: "NAME", type: "string" },
        { key: "NAME", type: "string" },
      ],
      "Variable keys must be unique",
    ],
    [
      "a reserved key",
      [{ key: "EMAIL", type: "string" }],
      "That variable name is reserved by Resend",
    ],
    [
      "more than 50 variables",
      Array.from({ length: 51 }, (_, i) => ({
        key: `VAR_${i}`,
        type: "string",
      })),
      "A template can have at most 50 variables",
    ],
  ] as const)(
    "rejects %s without calling Resend",
    async (_case, variables, message) => {
      await expect(
        emailTemplates.create({ ...form, variables } as never),
      ).rejects.toThrow(message);
      expect(templates.create).not.toHaveBeenCalled();
    },
  );

  it("explains that the template was saved when publishing fails", async () => {
    templates.create.mockResolvedValueOnce(ok({ id }));
    templates.publish.mockResolvedValueOnce(fail("Rate limit exceeded"));

    await expect(emailTemplates.create(form)).rejects.toThrow(
      "The template was saved as a draft, but publishing failed: Rate limit exceeded",
    );
  });

  it("does not publish when the create fails", async () => {
    templates.create.mockResolvedValueOnce(fail("Rate limit exceeded"));

    await expect(emailTemplates.create(form)).rejects.toThrow(
      "Rate limit exceeded",
    );
    expect(templates.publish).not.toHaveBeenCalled();
  });
});

/**
 * Tests for updating an email template
 *
 * Checks:
 *    Updates the template and then publishes it when publish is true
 *    Rejects invalid input without calling Resend
 *    Allows a template to keep its own name
 *    Rejects a name another template already uses
 *    Doesn't publish when the update fails
 */
describe("update", () => {
  it("updates the template and then publishes it when publish is true", async () => {
    templates.update.mockResolvedValueOnce(ok({ id }));
    templates.publish.mockResolvedValueOnce(ok({ id }));

    const result = await emailTemplates.update(id, form);

    expect(result).toStrictEqual({ id });
    expect(templates.update).toHaveBeenCalledWith(id, fields);
    expect(templates.publish).toHaveBeenCalledWith(id);
  });

  it("allows a template to keep its own name", async () => {
    templates.list.mockResolvedValueOnce(
      ok({ data: [{ id, name: form.name }], has_more: false }),
    );
    templates.update.mockResolvedValueOnce(ok({ id }));
    templates.publish.mockResolvedValueOnce(ok({ id }));

    await emailTemplates.update(id, form);

    expect(templates.update).toHaveBeenCalledWith(id, fields);
  });

  it("rejects a name another template already uses", async () => {
    templates.list.mockResolvedValueOnce(
      ok({ data: [{ id: "other-id", name: form.name }], has_more: false }),
    );

    await expect(emailTemplates.update(id, form)).rejects.toThrow(
      "A template with that name already exists",
    );
    expect(templates.update).not.toHaveBeenCalled();
  });

  it("rejects invalid input without calling Resend", async () => {
    await expect(
      emailTemplates.update(id, { ...form, name: "" }),
    ).rejects.toThrow();
    expect(templates.update).not.toHaveBeenCalled();
  });

  it("saves the changes as a draft when publish is false", async () => {
    templates.update.mockResolvedValueOnce(ok({ id }));

    const result = await emailTemplates.update(id, { ...form, publish: false });

    expect(result).toStrictEqual({ id });
    expect(templates.update).toHaveBeenCalledWith(id, fields);
    expect(templates.publish).not.toHaveBeenCalled();
  });

  it("does not publish when the update fails", async () => {
    templates.update.mockResolvedValueOnce(fail("Template not found"));

    await expect(emailTemplates.update(id, form)).rejects.toThrow(
      "Template not found",
    );
    expect(templates.publish).not.toHaveBeenCalled();
  });
});

/**
 * Tests for deleting an email template
 *
 * Checks:
 *    Deletes the template by ID
 *    Rejects with Resend's error message
 */
describe("remove", () => {
  it("deletes the template by ID", async () => {
    templates.remove.mockResolvedValueOnce(ok({ id, deleted: true }));

    await emailTemplates.remove(id);

    expect(templates.remove).toHaveBeenCalledWith(id);
  });

  it("rejects with Resend's error message", async () => {
    templates.remove.mockResolvedValueOnce(fail("Template not found"));

    await expect(emailTemplates.remove(id)).rejects.toThrow(
      "Template not found",
    );
  });
});
