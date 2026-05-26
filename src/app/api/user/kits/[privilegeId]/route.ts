import { NextResponse } from "next/server";
import { errorResponse, requireSession } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { getKitCooldowns } from "@/lib/services/kit-service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ privilegeId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { privilegeId } = await context.params;
    const id = Number(privilegeId);

    if (!Number.isInteger(id)) {
      throw new AppError("Invalid privilege id.", 400, "INVALID_PRIVILEGE_ID");
    }

    const kits = await getKitCooldowns(session.id, id);
    return NextResponse.json({ kits });
  } catch (error) {
    return errorResponse(error);
  }
}
