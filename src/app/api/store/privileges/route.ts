import { NextResponse } from "next/server";
import { KITS, PRIVILEGE_DURATION_DAYS, PRIVILEGES } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    durationDays: PRIVILEGE_DURATION_DAYS,
    privileges: PRIVILEGES.map((privilege) => ({
      ...privilege,
      kits: privilege.kitNames.map((kitName) => KITS[kitName]),
    })),
  });
}
