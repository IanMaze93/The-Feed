import { describe, expect, it, vi } from "vitest";

import { backendGet } from "@/app/lib/server/routes";

import Topics from "./page";

vi.mock("@/app/lib/server/routes", () => ({
  backendGet: vi.fn(),
}));

describe("Topics page", () => {
  it("hydrates topic pointers before passing them to the editor", async () => {
    vi.mocked(backendGet)
      .mockResolvedValueOnce({
        topics: [
          {
            _id: "topic-1",
            userId: "user-123",
            topic: "Technology",
            pointers: ["pointer-1", "pointer-2"],
          },
        ],
      })
      .mockResolvedValueOnce({
        _id: "pointer-1",
        url: "https://reddit.com/r/technology",
        feed_type: "reddit",
      })
      .mockResolvedValueOnce({
        _id: "pointer-2",
        url: "https://news.google.com/technology",
        feed_type: "google",
      });

    const page = await Topics({
      params: Promise.resolve({ userId: "user-123" }),
    });
    const editor = page.props.children[1];

    expect(backendGet).toHaveBeenNthCalledWith(1, "users/user-123/topics");
    expect(backendGet).toHaveBeenNthCalledWith(
      2,
      "users/user-123/pointers/pointer-1"
    );
    expect(backendGet).toHaveBeenNthCalledWith(
      3,
      "users/user-123/pointers/pointer-2"
    );
    expect(editor.props).toMatchObject({
      userId: "user-123",
      initialTopics: [
        {
          _id: "topic-1",
          topic: "Technology",
          pointers: [
            {
              _id: "pointer-1",
              url: "https://reddit.com/r/technology",
              feed_type: "reddit",
            },
            {
              _id: "pointer-2",
              url: "https://news.google.com/technology",
              feed_type: "google",
            },
          ],
        },
      ],
    });
  });
});
