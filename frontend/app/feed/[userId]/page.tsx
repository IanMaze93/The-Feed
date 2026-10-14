import { backendGet } from "@/app/lib/server/routes";
import { capitalize } from "@/app/lib/utils/formatting";
import { getBadgeColor } from "@/app/lib/utils/badge";

import Link from "next/link";

import Banner from "../../../components/common/banner";

import type { AllTopicStoriesResponse } from "@/app/types/topics";

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function Feed({ params }: Props) {
  const { userId } = await params;

  const data: AllTopicStoriesResponse = await backendGet(
    `users/${userId}/stories`
  );

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <Banner />

      <div className="flex shrink-0 justify-center py-2">
        <Link
          href={`/topics/${userId}`}
          className="rounded-md border border-orange-500 px-4 py-1.5 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-black"
        >
          Edit Topics
        </Link>
      </div>

      <main className="flex min-h-0 flex-1 w-full overflow-hidden">
        <div className="flex min-h-0 flex-1 w-full gap-6 overflow-x-auto px-4 pb-4 pt-1">
          {data.stories.map((topic) => (
            <section
              key={topic.topic}
              className="
                flex
                min-h-0
                basis-full
                shrink-0
                grow-0
                flex-col
                rounded-md
                border-2
                border-[#ff6a00]
                shadow-md
                sm:basis-[calc(50%-0.75rem)]
                lg:basis-[calc(25%-1.125rem)]
              "
            >
              <h2 className="mb-0 border-b-2 border-[#ff6a00] p-4 text-center text-2xl font-bold text-white">
                {topic.topic}
              </h2>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {topic.entries
                  .sort(
                    (a, b) =>
                      new Date(b.published_at).getTime() -
                      new Date(a.published_at).getTime()
                  )
                  .map((story) => (
                    <div
                      key={story._id}
                      className="border-b-2 border-[#ff6a00]"
                    >
                      <a
                        href={story.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-lg text-black dark:text-white"
                      >
                        <h3
                          className={`text-center font-bold ${getBadgeColor(
                            story.source
                          )} text-white`}
                        >
                          {capitalize(story.source)}
                        </h3>

                        <p className="p-4 text-center">{story.title}</p>

                        <p className="p-4 text-center text-sm text-gray-500">
                          {new Date(story.published_at).toLocaleString()}
                        </p>
                      </a>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
