import { z } from "zod";
import { StorySchema } from "./stories";

export const TopicStoriesSchema = z.object({
  topic: z.string(),
  entries: z.array(StorySchema),
});

export type TopicStories = z.infer<typeof TopicStoriesSchema>;

export const AllTopicStoriesResponseSchema = z.object({
  stories: z.array(TopicStoriesSchema),
});

export type AllTopicStoriesResponse = z.infer<
  typeof AllTopicStoriesResponseSchema
>;
