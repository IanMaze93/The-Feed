import { z } from "zod";

export const StorySchema = z.object({
  _id: z.string(),
  pointer_id: z.string(),
  title: z.string(),
  link: z.string(),
  source: z.string(),
  published_at: z.string(),
});

export type Story = z.infer<typeof StorySchema>;
