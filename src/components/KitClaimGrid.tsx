"use client";

import { useCallback, useEffect, useState } from "react";
import { PackageCheck, RefreshCw, Timer } from "lucide-react";
import type { KitDefinition } from "@/lib/constants";
import { KIT_COOLDOWN_HOURS } from "@/lib/constants";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useToast } from "@/components/Toast";

interface KitCooldown extends KitDefinition {
  canClaim: boolean;
  lastClaimedAt: string | null;
  nextAvailableAt: string;
  secondsRemaining: number;
}

export function KitClaimGrid({
  privilegeId,
}: {
  privilegeId: number;
}) {
  const { showToast } = useToast();
  const [kits, setKits] = useState<KitCooldown[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const loadKits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/kits/${privilegeId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load kits.");
      }

      setKits(data.kits);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to load kits.", "error");
    } finally {
      setLoading(false);
    }
  }, [privilegeId, showToast]);

  useEffect(() => {
    loadKits();
  }, [loadKits]);

  async function claim(kitName: string) {
    setClaiming(kitName);

    try {
      const response = await fetch(`/api/user/kits/${privilegeId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitName }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to claim kit.");
      }

      showToast("Kit claimed. Cooldown started.", "success");
      await loadKits();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to claim kit.", "error");
    } finally {
      setClaiming(null);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-lg border border-zinc-800 bg-zinc-900 shimmer-bg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {kits.map((kit) => {
        const progress = kit.canClaim
          ? 100
          : Math.max(
              0,
              100 -
                (kit.secondsRemaining / (KIT_COOLDOWN_HOURS * 60 * 60)) * 100,
            );

        return (
          <section
            key={kit.name}
            className="flex min-h-32 flex-col rounded-lg border border-zinc-800 bg-zinc-950 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-heading text-lg font-bold text-zinc-100">
                  {kit.label}
                </h4>
                <p className="mt-1 max-h-8 overflow-hidden text-xs text-zinc-500">
                  {kit.items.slice(0, 3).join(", ")}
                </p>
              </div>
              {kit.canClaim ? (
                <PackageCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Timer className="h-4 w-4 shrink-0 text-amber-300" />
              )}
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded bg-zinc-800">
              <div
                className={`h-full ${
                  kit.canClaim ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-3">
              {kit.canClaim ? (
                <span className="text-xs font-semibold text-emerald-300">Ready</span>
              ) : (
                <CountdownTimer targetDate={kit.nextAvailableAt} compact />
              )}
              <button
                type="button"
                onClick={() => claim(kit.name)}
                disabled={!kit.canClaim || claiming === kit.name}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-700 px-2 text-xs font-semibold text-zinc-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {claiming === kit.name ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <PackageCheck className="h-3.5 w-3.5" />
                )}
                Claim
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
