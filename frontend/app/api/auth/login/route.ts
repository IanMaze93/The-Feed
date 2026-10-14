import { cookies } from "next/headers";

import { backendPost } from "@/app/lib/server/routes";
import { TokenResponseSchema } from "@/app/types/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const data = TokenResponseSchema.parse(
    await backendPost("auth/login", body, false)
  );

  const cookieStore = await cookies();

  cookieStore.set("access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return Response.json(data, {
    status: 200,
  });
}
