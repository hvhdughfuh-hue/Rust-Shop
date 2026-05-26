import { NextResponse } from "next/server";
import { errorResponse, requireSession } from "@/lib/api";
import { getPrivilegeDefinition } from "@/lib/constants";
import { getActivePrivileges } from "@/lib/services/privilege-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession();
    const privileges = await getActivePrivileges(session.id);

    return NextResponse.json({
      privileges: privileges.map((privilege) => ({
        ...privilege,
        definition: getPrivilegeDefinition(privilege.tier),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
