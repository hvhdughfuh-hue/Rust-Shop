import { NextRequest, NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { ensureMockUsers, getAllUsers } from "@/lib/services/user-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await ensureMockUsers();

    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const users = await getAllUsers(search);

    return NextResponse.json({ users });
  } catch (error) {
    return errorResponse(error);
  }
}
