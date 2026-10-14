import { describe, expect, it } from "vitest";

import { capitalize } from "./formatting";

describe("capitalize", () => {
  it("capitalizes the first character", () => {
    expect(capitalize("reddit")).toBe("Reddit");
  });

  it("preserves the rest of the value", () => {
    expect(capitalize("gOOGLE News")).toBe("GOOGLE News");
  });

  it("returns an empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });
});
