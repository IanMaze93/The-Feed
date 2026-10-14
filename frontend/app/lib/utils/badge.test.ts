import { describe, expect, it } from "vitest";

import { getBadgeColor } from "./badge";

describe("getBadgeColor", () => {
  it("returns the Reddit badge color", () => {
    expect(getBadgeColor("reddit")).toBe("bg-red-900");
  });

  it("returns the Google News badge color", () => {
    expect(getBadgeColor("google")).toBe("bg-green-900");
  });

  it("returns the fallback badge color for unknown sources", () => {
    expect(getBadgeColor("rss")).toBe("bg-gray-900");
  });
});
