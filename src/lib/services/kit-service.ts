import prisma from "@/lib/db/prisma";
import {
  KIT_COOLDOWN_HOURS,
  KIT_NAMES,
  KITS,
  addHours,
  isKitName,
} from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { getPrivilegeWithKits } from "@/lib/services/privilege-service";

export async function getAllKits() {
  const kits = await prisma.kit.findMany({ include: { items: true }, orderBy: { id: "asc" } as any });
  return kits.map((k) => ({
    id: k.id,
    name: k.name,
    label: k.label,
    description: k.description,
    visible: k.visible,
    items: k.items.map((it) => it.name),
    createdAt: k.createdAt,
    updatedAt: k.updatedAt,
  }));
}

export async function getKitByName(name: string) {
  const k = await prisma.kit.findUnique({ where: { name }, include: { items: true } });
  if (!k) return null;
  return {
    id: k.id,
    name: k.name,
    label: k.label,
    description: k.description,
    visible: k.visible,
    items: k.items.map((it) => it.name),
    createdAt: k.createdAt,
    updatedAt: k.updatedAt,
  };
}

export async function createKit(params: { name: string; label: string; description?: string; items: string[]; visible?: boolean }) {
  const { name, label, description, items, visible = true } = params;

  const kit = await prisma.kit.create({
    data: {
      name,
      label,
      description: description ?? null,
      visible,
      items: { create: items.map((name) => ({ name })) },
    },
    include: { items: true },
  });

  return {
    id: kit.id,
    name: kit.name,
    label: kit.label,
    description: kit.description,
    visible: kit.visible,
    items: kit.items.map((it) => it.name),
  };
}

export async function updateKit(params: { name: string; label?: string; description?: string | null; items?: string[]; visible?: boolean }) {
  const { name, label, description, items, visible } = params;

  const existing = await prisma.kit.findUnique({ where: { name } });
  if (!existing) return null;

  // replace items if provided
  if (Array.isArray(items)) {
    await prisma.kitItem.deleteMany({ where: { kitId: existing.id } });
  }

  const updated = await prisma.kit.update({
    where: { name },
    data: {
      label: label ?? existing.label,
      description: description ?? existing.description,
      visible: typeof visible === "boolean" ? visible : existing.visible,
      items: items ? { create: items.map((name) => ({ name })) } : undefined,
    },
    include: { items: true },
  });

  return {
    id: updated.id,
    name: updated.name,
    label: updated.label,
    description: updated.description,
    visible: updated.visible,
    items: updated.items.map((it) => it.name),
  };
}

export async function deleteKit(name: string) {
  const existing = await prisma.kit.findUnique({ where: { name } });
  if (!existing) return null;

  await prisma.kitItem.deleteMany({ where: { kitId: existing.id } });
  await prisma.kit.delete({ where: { name } });
  return { ok: true };
}

export async function claimKit(
  userId: number,
  privilegeId: number,
  kitName: string,
) {
  if (!isKitName(kitName)) {
    throw new AppError("Unknown kit.", 400, "INVALID_KIT");
  }

  const privilege = await getPrivilegeWithKits(privilegeId, userId);
  const now = new Date();

  if (privilege.expiresAt <= now) {
    throw new AppError("Privilege has expired.", 400, "PRIVILEGE_EXPIRED");
  }

  const latestClaim = await prisma.kitClaim.findFirst({
    where: { privilegeId, kitName },
    orderBy: { claimedAt: "desc" },
  });

  if (latestClaim) {
    const nextAvailableAt = addHours(latestClaim.claimedAt, KIT_COOLDOWN_HOURS);

    if (nextAvailableAt > now) {
      throw new AppError(
        "Kit is still on cooldown.",
        400,
        "KIT_ON_COOLDOWN",
      );
    }
  }

  const claim = await prisma.kitClaim.create({
    data: {
      privilegeId,
      kitName,
      claimedAt: now,
    },
  });

  return {
    claim,
    nextAvailableAt: addHours(now, KIT_COOLDOWN_HOURS),
  };
}

export async function getKitCooldowns(userId: number, privilegeId: number) {
  const privilege = await getPrivilegeWithKits(privilegeId, userId);
  const now = new Date();

  return KIT_NAMES.map((kitName) => {
    const latestClaim =
      privilege.kitClaims.find((claim) => claim.kitName === kitName) ?? null;
    const nextAvailableAt = latestClaim
      ? addHours(latestClaim.claimedAt, KIT_COOLDOWN_HOURS)
      : now;
    const canClaim = privilege.expiresAt > now && nextAvailableAt <= now;

    return {
      ...KITS[kitName],
      canClaim,
      lastClaimedAt: latestClaim?.claimedAt.toISOString() ?? null,
      nextAvailableAt: nextAvailableAt.toISOString(),
      secondsRemaining: Math.max(
        0,
        Math.ceil((nextAvailableAt.getTime() - now.getTime()) / 1000),
      ),
    };
  });
}
