import prisma from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { applyBalanceChange } from "@/lib/services/user-service";

async function assertAdmin(adminId: number) {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });

  if (!admin?.isAdmin) {
    throw new AppError("Admin access required.", 403, "FORBIDDEN");
  }

  return admin;
}

export async function creditUser(
  adminId: number,
  targetUserId: number,
  amount: number,
  reason?: string,
) {
  await assertAdmin(adminId);

  return prisma.$transaction(async (tx) => {
    const result = await applyBalanceChange(tx, {
      userId: targetUserId,
      amount,
      type: "CREDIT",
      description: reason?.trim() || "Admin credit",
    });

    await tx.auditLog.create({
      data: {
        adminId,
        targetUserId,
        action: "CREDIT",
        amount: Math.abs(amount),
        reason: reason?.trim() || null,
      },
    });

    return result;
  });
}

export async function debitUser(
  adminId: number,
  targetUserId: number,
  amount: number,
  reason?: string,
) {
  await assertAdmin(adminId);

  return prisma.$transaction(async (tx) => {
    const result = await applyBalanceChange(tx, {
      userId: targetUserId,
      amount,
      type: "DEBIT",
      description: reason?.trim() || "Admin debit",
    });

    await tx.auditLog.create({
      data: {
        adminId,
        targetUserId,
        action: "DEBIT",
        amount: Math.abs(amount),
        reason: reason?.trim() || null,
      },
    });

    return result;
  });
}

export async function getAuditLog(page = 1, limit = 25) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      include: {
        admin: true,
        target: true,
      },
    }),
    prisma.auditLog.count(),
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    pages: Math.ceil(total / safeLimit),
  };
}
