import Banner from "@/components/common/banner";
import { backendGet } from "@/app/lib/server/routes";

import EditTopicsForm from "./form";

type Pointer = {
  _id: string;
  url: string;
  feed_type: string;
};

type TopicResponse = {
  _id: string;
  userId: string;
  topic: string;
  pointers: string[];
};

type Topic = {
  _id: string;
  userId: string;
  topic: string;
  pointers: Pointer[];
};

type TopicsResponse = {
  topics: TopicResponse[];
};

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function Topics({ params }: Props) {
  const { userId } = await params;

  const data = await backendGet<TopicsResponse>(`users/${userId}/topics`);

  const topics: Topic[] = await Promise.all(
    data.topics.map(async (topic) => {
      const pointers: Pointer[] = await Promise.all(
        topic.pointers.map((pointerId) =>
          backendGet<Pointer>(`users/${userId}/pointers/${pointerId}`)
        )
      );

      return {
        ...topic,
        pointers,
      };
    })
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Banner />

      <EditTopicsForm userId={userId} initialTopics={topics} />
    </div>
  );
}
