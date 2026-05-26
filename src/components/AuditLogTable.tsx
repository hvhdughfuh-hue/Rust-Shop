"use client";

import { useCallback, useEffect, useState } from "react";
import { FileClock, RefreshCw } from "lucide-react";
import { formatCredits } from "@/lib/constants";
import { useToast } from "@/components/Toast";

interface AuditItem {
  id: number;
  action: string;
  amount: number | null;
  reason: string | null;
  createdAt: string;
  admin: {
    username: string;
  };
  target: {
    username: string;
  };
}

export function AuditLogTable({ refreshKey }: { refreshKey: number }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/audit?limit=25");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load audit log.");
      }

      setItems(data.items);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to load audit log.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit, refreshKey]);

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/80">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <FileClock className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-bold text-zinc-100">
              Audit log
            </h2>
            <p className="text-sm text-zinc-500">Latest admin balance actions</p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadAudit}
          className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:text-zinc-100"
          aria-label="Refresh audit log"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-800 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Loading audit log
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No admin actions yet
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800/80 last:border-0">
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{item.admin.username}</td>
                  <td className="px-4 py-3 text-zinc-200">{item.target.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                        item.action === "CREDIT"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                          : "border-red-500/30 bg-red-500/10 text-red-200"
                      }`}
                    >
                      {item.action}{" "}
                      {typeof item.amount === "number"
                        ? formatCredits(item.amount)
                        : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {item.reason || "No reason"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
