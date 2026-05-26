import { NextRequest, NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api";
import { getAuditLog } from "@/lib/services/admin-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "25");
    const audit = await getAuditLog(page, limit);

    return NextResponse.json(audit);
  } catch (error) {
    return errorResponse(error);
  }
}
