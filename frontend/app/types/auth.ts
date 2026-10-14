import { z } from "zod";

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  user_id: z.string(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
