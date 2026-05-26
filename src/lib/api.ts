import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";
import { AppError } from "@/lib/errors";

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    throw new AppError("Authentication required.", 401, "UNAUTHORIZED");
  }

  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession();

  if (!session.isAdmin) {
    throw new AppError("Admin access required.", 403, "FORBIDDEN");
  }

  return session;
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: "Unexpected server error.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError("Invalid JSON body.", 400, "INVALID_JSON");
  }
}
