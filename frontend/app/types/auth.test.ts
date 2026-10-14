import { describe, expect, it } from "vitest";

import { TokenResponseSchema } from "./auth";

describe("TokenResponseSchema", () => {
  it("accepts a complete token response", () => {
    const result = TokenResponseSchema.safeParse({
      access_token: "token",
      token_type: "bearer",
      user_id: "user-123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a response missing a required token field", () => {
    const result = TokenResponseSchema.safeParse({
      access_token: "token",
      token_type: "bearer",
    });

    expect(result.success).toBe(false);
  });
});
