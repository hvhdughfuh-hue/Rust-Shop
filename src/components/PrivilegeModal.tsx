"use client";

import { X, PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";
import type { PrivilegeDefinition } from "@/lib/constants";
import { formatCredits, formatUsd } from "@/lib/constants";

interface PrivilegeModalProps {
  privilege: PrivilegeDefinition;
  open: boolean;
  onClose: () => void;
}

export function PrivilegeModal({ privilege, open, onClose }: PrivilegeModalProps) {
  const [kits, setKits] = useState<Array<{ name: string; label: string; description?: string; items: string[] }>>([]);

  useEffect(() => {
    if (!open) return;

    async function load() {
      try {
        const names = privilege.kitNames.join(",");
        const res = await fetch(`/api/kits?names=${encodeURIComponent(names)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load kits");
        setKits(data.kits ?? []);
      } catch (err) {
        setKits([]);
      }
    }

    load();
  }, [open, privilege.kitNames]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-[92vw] sm:max-w-4xl overflow-y-auto rounded-lg border border-white/10 bg-[#101318] shadow-2xl shadow-black/60">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#101318]/95 p-5 backdrop-blur">
          <div>
            <p className="text-sm text-zinc-500">{privilege.tagline}</p>
            <h2 className={`font-heading text-2xl sm:text-3xl font-bold ${privilege.accentClass}`}>
              {privilege.label}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {formatUsd(privilege.usdPrice)} · {formatCredits(privilege.price)} · доступ на 5 дней
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-zinc-800 text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100"
            aria-label="Закрыть детали"
            title="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          {kits.map((kit) => (
            <section key={kit.name} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <PackageOpen className="h-4 w-4 text-orange-400" />
                <h3 className="font-heading text-xl font-bold text-zinc-100">{kit.label}</h3>
              </div>
              <p className="mb-3 text-sm text-zinc-400">{kit.description}</p>
              <div className="flex flex-wrap gap-2">
                {kit.items.map((item) => (
                  <span key={item} className="rounded-md border border-white/10 bg-[#15191f] px-2 py-1 text-xs text-zinc-300">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
