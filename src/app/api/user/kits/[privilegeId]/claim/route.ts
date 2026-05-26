import { NextResponse } from "next/server";
import { errorResponse, readJson, requireSession } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { claimKit } from "@/lib/services/kit-service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ privilegeId: string }>;
};

interface ClaimBody {
  kitName?: unknown;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { privilegeId } = await context.params;
    const id = Number(privilegeId);

    if (!Number.isInteger(id)) {
      throw new AppError("Invalid privilege id.", 400, "INVALID_PRIVILEGE_ID");
    }

    const body = await readJson<ClaimBody>(request);

    if (typeof body.kitName !== "string") {
      throw new AppError("Kit name is required.", 400, "MISSING_KIT");
    }

    const result = await claimKit(session.id, id, body.kitName);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
