import { NextResponse } from "next/server";
import { errorResponse, readJson, requireSession } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { purchasePrivilege } from "@/lib/services/privilege-service";

export const runtime = "nodejs";

interface PurchaseBody {
  tier?: unknown;
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await readJson<PurchaseBody>(request);

    if (typeof body.tier !== "string") {
      throw new AppError("Tier is required.", 400, "MISSING_TIER");
    }

    const result = await purchasePrivilege(session.id, body.tier);

    return NextResponse.json({
      ok: true,
      privilege: result.privilege,
      user: {
        balance: result.user.balance,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
