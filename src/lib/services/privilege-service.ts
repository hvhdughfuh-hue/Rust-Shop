import prisma from "@/lib/db/prisma";
import {
  PRIVILEGE_DURATION_DAYS,
  addDays,
  getPrivilegeDefinition,
  isPrivilegeTier,
} from "@/lib/constants";
import { AppError } from "@/lib/errors";

export async function purchasePrivilege(userId: number, tier: string) {
  if (!isPrivilegeTier(tier)) {
    throw new AppError("Unknown privilege tier.", 400, "INVALID_TIER");
  }

  const privilegeDefinition = getPrivilegeDefinition(tier);

  if (!privilegeDefinition) {
    throw new AppError("Unknown privilege tier.", 400, "INVALID_TIER");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found.", 404, "USER_NOT_FOUND");
    }

    if (user.balance < privilegeDefinition.price) {
      throw new AppError("Insufficient balance.", 400, "INSUFFICIENT_BALANCE");
    }

    const balanceAfter = user.balance - privilegeDefinition.price;
    const now = new Date();

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { balance: balanceAfter },
    });

    const privilege = await tx.activePrivilege.create({
      data: {
        userId,
        tier,
        activatedAt: now,
        expiresAt: addDays(now, PRIVILEGE_DURATION_DAYS),
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        type: "PURCHASE",
        amount: -privilegeDefinition.price,
        balanceBefore: user.balance,
        balanceAfter,
        description: `Purchased ${privilegeDefinition.label} privilege`,
      },
    });

    return { privilege, user: updatedUser };
  });
}

export async function getActivePrivileges(userId: number) {
  return prisma.activePrivilege.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "asc" },
    include: {
      kitClaims: {
        orderBy: { claimedAt: "desc" },
      },
    },
  });
}

export async function getPrivilegeWithKits(privilegeId: number, userId: number) {
  const privilege = await prisma.activePrivilege.findFirst({
    where: {
      id: privilegeId,
      userId,
    },
    include: {
      kitClaims: {
        orderBy: { claimedAt: "desc" },
      },
    },
  });

  if (!privilege) {
    throw new AppError("Privilege not found.", 404, "PRIVILEGE_NOT_FOUND");
  }

  return privilege;
}
