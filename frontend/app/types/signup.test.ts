import { describe, expect, it } from "vitest";

import { SignUpPayloadSchema } from "./signup";

describe("SignUpPayloadSchema", () => {
  it("accepts a valid signup payload", () => {
    const result = SignUpPayloadSchema.safeParse({
      username: "reader",
      password: "secret",
      email: "reader@example.com",
      firstName: "Feed",
      lastName: "Reader",
    });

    expect(result.success).toBe(true);
  });

  it("rejects values that exceed field limits", () => {
    const result = SignUpPayloadSchema.safeParse({
      username: "a".repeat(31),
      password: "secret",
      email: "reader@example.com",
      firstName: "Feed",
      lastName: "Reader",
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-string values", () => {
    const result = SignUpPayloadSchema.safeParse({
      username: "reader",
      password: 123456,
      email: "reader@example.com",
      firstName: "Feed",
      lastName: "Reader",
    });

    expect(result.success).toBe(false);
  });
});
