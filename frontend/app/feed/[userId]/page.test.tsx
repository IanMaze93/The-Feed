import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { backendGet } from "@/app/lib/server/routes";

import Feed from "./page";

vi.mock("@/app/lib/server/routes", () => ({
  backendGet: vi.fn(),
}));

describe("Feed page", () => {
  it("loads the user's stories and renders newest stories first", async () => {
    vi.mocked(backendGet).mockResolvedValue({
      stories: [
        {
          topic: "Technology",
          entries: [
            {
              _id: "older-story",
              pointer_id: "pointer-1",
              title: "Older story",
              link: "https://example.com/older",
              source: "reddit",
              published_at: "2026-09-10T12:00:00.000Z",
            },
            {
              _id: "newer-story",
              pointer_id: "pointer-2",
              title: "Newer story",
              link: "https://example.com/newer",
              source: "google",
              published_at: "2026-09-11T12:00:00.000Z",
            },
          ],
        },
      ],
    });

    const page = await Feed({
      params: Promise.resolve({ userId: "user-123" }),
    });
    const markup = renderToStaticMarkup(page);

    expect(backendGet).toHaveBeenCalledWith("users/user-123/stories");
    expect(markup.indexOf("Newer story")).toBeLessThan(
      markup.indexOf("Older story")
    );
    expect(markup).toContain('href="https://example.com/newer"');
    expect(markup).toContain('href="/topics/user-123"');
    expect(markup).toContain("bg-green-900");
  });
});
