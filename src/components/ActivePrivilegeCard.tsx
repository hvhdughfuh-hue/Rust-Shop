"use client";

import { ShieldCheck } from "lucide-react";
import type { PrivilegeDefinition } from "@/lib/constants";
import { getPrivilegeDefinition } from "@/lib/constants";
import { CountdownTimer } from "@/components/CountdownTimer";
import { KitClaimGrid } from "@/components/KitClaimGrid";

interface ActivePrivilege {
  id: number;
  tier: string;
  activatedAt: string;
  expiresAt: string;
  definition?: PrivilegeDefinition;
}

export function ActivePrivilegeCard({
  privilege,
}: {
  privilege: ActivePrivilege;
}) {
  const definition = privilege.definition ?? getPrivilegeDefinition(privilege.tier);

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-5">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-zinc-500">Active privilege</p>
            <h2
              className={`font-heading text-2xl font-bold ${
                definition?.accentClass ?? "text-zinc-100"
              }`}
            >
              {definition?.label ?? privilege.tier}
            </h2>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <p className="text-xs text-zinc-500">Expires in</p>
          <CountdownTimer targetDate={privilege.expiresAt} />
        </div>
      </div>

      <KitClaimGrid privilegeId={privilege.id} />
    </article>
  );
}
