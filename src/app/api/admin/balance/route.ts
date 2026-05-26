import { NextResponse } from "next/server";
import { errorResponse, readJson, requireAdmin } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { creditUser, debitUser } from "@/lib/services/admin-service";

export const runtime = "nodejs";

interface BalanceBody {
  userId?: unknown;
  amount?: unknown;
  type?: unknown;
  reason?: unknown;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await readJson<BalanceBody>(request);
    const userId = Number(body.userId);
    const amount = Number(body.amount);

    if (!Number.isInteger(userId)) {
      throw new AppError("User id is required.", 400, "INVALID_USER_ID");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError("Amount must be greater than zero.", 400, "INVALID_AMOUNT");
    }

    if (body.type !== "credit" && body.type !== "debit") {
      throw new AppError("Balance action must be credit or debit.", 400, "INVALID_TYPE");
    }

    const reason = typeof body.reason === "string" ? body.reason : undefined;
    const result =
      body.type === "credit"
        ? await creditUser(admin.id, userId, amount, reason)
        : await debitUser(admin.id, userId, amount, reason);

    return NextResponse.json({
      ok: true,
      user: result.user,
      transaction: result.transaction,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
