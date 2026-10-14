import { z } from "zod";

export const SignUpPayloadSchema = z.object({
  username: z.string().max(30),
  password: z.string().max(20),
  email: z.string().max(50),
  firstName: z.string().max(30),
  lastName: z.string().max(30),
});

export type SignUpResponse = z.infer<typeof SignUpPayloadSchema>;
