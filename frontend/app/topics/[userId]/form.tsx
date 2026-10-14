"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Pointer = {
  _id?: string;
  url: string;
  feed_type: string;
};

type Topic = {
  _id?: string;
  userId?: string;
  topic: string;
  pointers: Pointer[];
};

type Props = {
  userId: string;
  initialTopics: Topic[];
};

export default function EditTopicsForm({ userId, initialTopics }: Props) {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateTopicName(index: number, value: string) {
    setTopics((current) =>
      current.map((topic, topicIndex) =>
        topicIndex === index
          ? {
              ...topic,
              topic: value,
            }
          : topic
      )
    );
  }

  function addTopic() {
    setTopics((current) => [
      ...current,
      {
        topic: "",
        pointers: [],
      },
    ]);
  }

  function removeTopic(index: number) {
    setTopics((current) =>
      current.filter((_, topicIndex) => topicIndex !== index)
    );
  }

  function addPointer(topicIndex: number) {
    setTopics((current) =>
      current.map((topic, index) =>
        index === topicIndex
          ? {
              ...topic,
              pointers: [
                ...topic.pointers,
                {
                  url: "",
                  feed_type: "reddit",
                },
              ],
            }
          : topic
      )
    );
  }

  function updatePointerUrl(
    topicIndex: number,
    pointerIndex: number,
    value: string
  ) {
    setTopics((current) =>
      current.map((topic, currentTopicIndex) => {
        if (currentTopicIndex !== topicIndex) {
          return topic;
        }

        return {
          ...topic,
          pointers: topic.pointers.map((pointer, currentPointerIndex) =>
            currentPointerIndex === pointerIndex
              ? {
                  ...pointer,
                  url: value,
                }
              : pointer
          ),
        };
      })
    );
  }

  function updatePointerFeedType(
    topicIndex: number,
    pointerIndex: number,
    value: string
  ) {
    setTopics((current) =>
      current.map((topic, currentTopicIndex) => {
        if (currentTopicIndex !== topicIndex) {
          return topic;
        }

        return {
          ...topic,
          pointers: topic.pointers.map((pointer, currentPointerIndex) =>
            currentPointerIndex === pointerIndex
              ? {
                  ...pointer,
                  feed_type: value,
                }
              : pointer
          ),
        };
      })
    );
  }

  function removePointer(topicIndex: number, pointerIndex: number) {
    setTopics((current) =>
      current.map((topic, currentTopicIndex) => {
        if (currentTopicIndex !== topicIndex) {
          return topic;
        }

        return {
          ...topic,
          pointers: topic.pointers.filter(
            (_, currentPointerIndex) => currentPointerIndex !== pointerIndex
          ),
        };
      })
    );
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      setMessage("");

      const payload = {
        topics: topics.map((topic) => ({
          id: topic._id,
          topic: topic.topic,
          pointers: topic.pointers.map((pointer) => ({
            url: pointer.url,
            feed_type: pointer.feed_type,
          })),
        })),
      };

      const response = await fetch(`/api/users/${userId}/topics`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();

        console.error("Failed to save topics:", response.status, errorBody);

        throw new Error("Failed to save topics");
      }

      setMessage("Topics saved.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save topics.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Edit Topics
        </h1>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Manage the topics and pointers shown in your feed.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-orange-500 bg-zinc-950 p-4 mb-5">
        <p className="text-sm font-semibold text-zinc-200">Pointer Examples</p>

        <div className="mt-2 space-y-2 text-sm text-zinc-400">
          <div>
            <span className="font-medium text-orange-400">Reddit:</span>{" "}
            <code className="text-zinc-300">
              https://www.reddit.com/r/news.rss
            </code>
          </div>

          <div>
            <span className="font-medium text-orange-400">Google News:</span>{" "}
            <code className="text-zinc-300">
              https://news.google.com/rss/search?q=news
            </code>
          </div>

          <div>
            <span className="font-medium text-orange-400">Website:</span>{" "}
            <code className="text-zinc-300">https://example.com/rss</code>
          </div>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Add the URL for the subreddit or Google News search you want to
          follow.
        </p>
      </div>

      <div className="space-y-5">
        {topics.map((topic, topicIndex) => (
          <div
            key={topic._id ?? `new-${topicIndex}`}
            className="rounded-xl border border-orange-500 bg-zinc-950 p-5"
          >
            <div className="flex gap-3">
              <input
                value={topic.topic}
                onChange={(event) =>
                  updateTopicName(topicIndex, event.target.value)
                }
                placeholder="Topic name"
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-orange-500"
              />

              <button
                type="button"
                onClick={() => removeTopic(topicIndex)}
                className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
              >
                Delete
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {topic.pointers.map((pointer, pointerIndex) => (
                <div
                  key={pointer._id ?? `${topicIndex}-${pointerIndex}`}
                  className="flex gap-2"
                >
                  <select
                    value={pointer.feed_type}
                    onChange={(event) =>
                      updatePointerFeedType(
                        topicIndex,
                        pointerIndex,
                        event.target.value
                      )
                    }
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="reddit">Reddit</option>

                    <option value="google">Google News</option>

                    <option value="website">Website</option>
                  </select>

                  <input
                    value={pointer.url}
                    onChange={(event) =>
                      updatePointerUrl(
                        topicIndex,
                        pointerIndex,
                        event.target.value
                      )
                    }
                    placeholder="Pointer URL"
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />

                  <button
                    type="button"
                    onClick={() => removePointer(topicIndex, pointerIndex)}
                    className="px-3 text-sm text-zinc-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addPointer(topicIndex)}
              className="mt-4 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-orange-500 hover:text-orange-400"
            >
              + Add Pointer
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={addTopic}
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-orange-500 hover:text-orange-400"
        >
          + Add Topic
        </button>

        <div className="flex items-center gap-4">
          {message && <span className="text-sm text-zinc-400">{message}</span>}

          <button
            type="button"
            onClick={() => router.push(`/feed/${userId}`)}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-orange-500 hover:text-orange-400"
          >
            Back to Feed
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-orange-500 px-5 py-2 font-semibold text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
