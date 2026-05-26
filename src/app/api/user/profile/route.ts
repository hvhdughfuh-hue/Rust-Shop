import { NextResponse } from "next/server";
import { errorResponse, requireSession } from "@/lib/api";
import prisma from "@/lib/db/prisma";
import { getPrivilegeDefinition } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession();
    const [user, activePrivileges, transactions] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.id } }),
      prisma.activePrivilege.findMany({
        where: {
          userId: session.id,
          expiresAt: { gt: new Date() },
        },
        orderBy: { expiresAt: "asc" },
      }),
      prisma.transaction.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      user,
      activePrivileges: activePrivileges.map((privilege) => ({
        ...privilege,
        definition: getPrivilegeDefinition(privilege.tier),
      })),
      transactions,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
