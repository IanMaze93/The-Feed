import { describe, expect, it } from "vitest";

import { StorySchema } from "./stories";

describe("StorySchema", () => {
  it("accepts a complete story", () => {
    const result = StorySchema.safeParse({
      _id: "story-1",
      pointer_id: "pointer-1",
      title: "A useful story",
      link: "https://example.com/story",
      source: "reddit",
      published_at: "2026-09-11T12:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a story with a missing required field", () => {
    const result = StorySchema.safeParse({
      _id: "story-1",
      pointer_id: "pointer-1",
      title: "A useful story",
      source: "reddit",
      published_at: "2026-09-11T12:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });
});
