import { backendPost } from "@/app/lib/server/routes";
import { SignUpPayloadSchema } from "@/app/types/signup";

export async function POST(request: Request) {
  const body = SignUpPayloadSchema.parse(await request.json());

  const data = await backendPost("users", body);

  return new Response(JSON.stringify(data), {
    status: 200,
  });
}
