import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import type { AuthUser, SessionUser } from "@/lib/auth/types";
import { MOCK_AUTH_USERS } from "@/lib/auth/mock-provider";
import { AppError } from "@/lib/errors";

type TransactionClient = Prisma.TransactionClient;
type BalanceType = "CREDIT" | "DEBIT";

function getAdminSteamIds() {
  return new Set(
    (process.env.ADMIN_STEAM_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

function isAdminSteamId(steamId64: string) {
  return getAdminSteamIds().has(steamId64);
}

export async function findOrCreateUser(authUser: AuthUser): Promise<SessionUser> {
  const user = await prisma.user.upsert({
    where: { steamId64: authUser.steamId64 },
    create: {
      steamId64: authUser.steamId64,
      username: authUser.username,
      avatarUrl: authUser.avatarUrl,
      isAdmin: isAdminSteamId(authUser.steamId64),
    },
    update: {
      username: authUser.username,
      avatarUrl: authUser.avatarUrl,
      isAdmin: isAdminSteamId(authUser.steamId64),
    },
  });

  return {
    id: user.id,
    steamId64: user.steamId64,
    username: user.username,
    avatarUrl: user.avatarUrl,
    balance: user.balance,
    isAdmin: user.isAdmin,
  };
}

export async function ensureMockUsers() {
  if (process.env.AUTH_MODE === "steam") {
    return;
  }

  await Promise.all(MOCK_AUTH_USERS.map((user) => findOrCreateUser(user)));
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserBySteamId(steamId64: string) {
  return prisma.user.findUnique({ where: { steamId64 } });
}

export async function getAllUsers(search?: string) {
  const trimmed = search?.trim();

  return prisma.user.findMany({
    where: trimmed
      ? {
          OR: [
            { username: { contains: trimmed } },
            { steamId64: { contains: trimmed } },
          ],
        }
      : undefined,
    orderBy: [{ isAdmin: "desc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: {
          privileges: true,
          transactions: true,
        },
      },
    },
  });
}

export async function applyBalanceChange(
  tx: TransactionClient,
  params: {
    userId: number;
    amount: number;
    type: BalanceType;
    description: string;
  },
) {
  const normalizedAmount = Math.abs(params.amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new AppError("Amount must be greater than zero.", 400, "INVALID_AMOUNT");
  }

  const user = await tx.user.findUnique({ where: { id: params.userId } });

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  const signedAmount =
    params.type === "CREDIT" ? normalizedAmount : -normalizedAmount;
  const balanceAfter = user.balance + signedAmount;

  if (balanceAfter < 0) {
    throw new AppError("Balance cannot go below zero.", 400, "NEGATIVE_BALANCE");
  }

  const updatedUser = await tx.user.update({
    where: { id: params.userId },
    data: { balance: balanceAfter },
  });

  const transaction = await tx.transaction.create({
    data: {
      userId: params.userId,
      type: params.type,
      amount: signedAmount,
      balanceBefore: user.balance,
      balanceAfter,
      description: params.description,
    },
  });

  return { user: updatedUser, transaction };
}

export async function updateBalance(params: {
  userId: number;
  amount: number;
  type: BalanceType;
  description: string;
}) {
  return prisma.$transaction((tx) => applyBalanceChange(tx, params));
}
