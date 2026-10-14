import { describe, expect, it } from "vitest";

import { AllTopicStoriesResponseSchema, TopicStoriesSchema } from "./topics";

describe("TopicStoriesSchema", () => {
  it("accepts a topic with story entries", () => {
    const result = TopicStoriesSchema.safeParse({
      topic: "technology",
      entries: [
        {
          _id: "story-1",
          pointer_id: "pointer-1",
          title: "A useful story",
          link: "https://example.com/story",
          source: "reddit",
          published_at: "2026-09-11T12:00:00.000Z",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe("AllTopicStoriesResponseSchema", () => {
  it("accepts an empty stories collection", () => {
    expect(
      AllTopicStoriesResponseSchema.safeParse({ stories: [] }).success
    ).toBe(true);
  });

  it("rejects malformed nested stories", () => {
    const result = AllTopicStoriesResponseSchema.safeParse({
      stories: [{ topic: "technology", entries: [{ title: "incomplete" }] }],
    });

    expect(result.success).toBe(false);
  });
});
