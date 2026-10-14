import { NextRequest, NextResponse } from "next/server";

import { backendPut } from "@/app/lib/server/routes";

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { userId } = await params;
    const body = await request.json();

    const response = await backendPut(`users/${userId}/topics`, body);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to update topics:", error);

    return NextResponse.json(
      {
        detail: "Failed to update topics",
      },
      {
        status: 500,
      }
    );
  }
}
