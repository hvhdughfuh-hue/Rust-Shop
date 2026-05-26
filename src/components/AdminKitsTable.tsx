"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit, Plus, Trash, Eye, EyeOff, X } from "lucide-react";
import { useToast } from "@/components/Toast";

interface Kit {
  name: string;
  label: string;
  description?: string;
  items: string[];
  visible?: boolean;
}

export function AdminKitsTable() {
  const { showToast } = useToast();
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Kit | null>(null);

  const loadKits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kits", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load kits");
      setKits(data.kits ?? []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to load kits", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadKits();
  }, [loadKits]);

  function openNew() {
    setEditing({ name: "", label: "", description: "", items: [], visible: true });
    setModalOpen(true);
  }

  function openEdit(kit: Kit) {
    setEditing({ ...kit });
    setModalOpen(true);
  }

  async function toggleVisible(kit: Kit) {
    try {
      const res = await fetch("/api/admin/kits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: kit.name, visible: !kit.visible }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to toggle");
      showToast("Updated", "success");
      loadKits();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to toggle kit", "error");
    }
  }

  async function removeKit(kit: Kit) {
    if (!confirm(`Delete kit ${kit.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/kits?name=${encodeURIComponent(kit.name)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete");
      showToast("Deleted", "success");
      loadKits();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to delete kit", "error");
    }
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/80">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
            <Plus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-bold text-zinc-100">Kits</h2>
            <p className="text-sm text-zinc-500">Manage available kits and contents</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openNew} className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 text-sm font-semibold text-amber-200">
            <Plus className="h-4 w-4" /> Add kit
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-800 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Visible</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Loading kits</td>
              </tr>
            ) : kits.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No kits found</td>
              </tr>
            ) : (
              kits.map((kit) => (
                <tr key={kit.name} className="border-b border-zinc-800/80 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{kit.name}</td>
                  <td className="px-4 py-3 text-zinc-200">{kit.label}</td>
                  <td className="px-4 py-3 text-zinc-400">{kit.items.length} items</td>
                  <td className="px-4 py-3">
                    {kit.visible ? <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300"><Eye className="h-3 w-3"/>Visible</span> : <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300"><EyeOff className="h-3 w-3"/>Hidden</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(kit)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-xs text-zinc-200">
                        <Edit className="h-4 w-4"/> Edit
                      </button>
                      <button onClick={() => toggleVisible(kit)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-xs text-zinc-200">
                        {kit.visible ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        Toggle
                      </button>
                      <button onClick={() => removeKit(kit)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs text-red-200">
                        <Trash className="h-4 w-4"/> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && editing ? (
        <KitModal kit={editing} onClose={() => setModalOpen(false)} onSaved={loadKits} setEditing={setEditing} />
      ) : null}
    </section>
  );
}

function KitModal({ kit, onClose, onSaved, setEditing }: { kit: Kit; onClose: () => void; onSaved: () => void; setEditing: (k: Kit | null) => void; }) {
  const { showToast } = useToast();
  const [name, setName] = useState(kit.name);
  const [label, setLabel] = useState(kit.label);
  const [description, setDescription] = useState(kit.description ?? "");
  const [items, setItems] = useState<string[]>((kit.items || []).slice());
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function moveItem(from: number, to: number) {
    const arr = items.slice();
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setItems(arr);
  }

  function onDragStart(e: React.DragEvent, idx: number) {
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData("text/plain"));
    if (!Number.isNaN(from)) moveItem(from, idx);
  }

  function addItem() {
    const v = newItem.trim();
    if (!v) return;
    setItems((s) => [...s, v]);
    setNewItem("");
  }

  function removeItem(idx: number) {
    setItems((s) => s.filter((_, i) => i !== idx));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Simple validation
    if (!name.trim()) return setError("Internal name is required.");
    if (!label.trim()) return setError("Label is required.");
    if (items.length === 0) return setError("At least one item is required.");

    setSaving(true);
    try {
      const payload = { name: name.trim(), label: label.trim(), description: description.trim(), items: items.map((i) => i.trim()).filter(Boolean) };
      const method = kit.name ? (kit.name === name ? "PUT" : "POST") : "POST";
      const url = "/api/admin/kits";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showToast("Saved", "success");
      setEditing(null);
      onSaved();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-[92vw] sm:max-w-2xl rounded-lg border border-zinc-700 bg-zinc-950 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">Kit</p>
            <h2 className="font-heading text-2xl font-bold text-zinc-100">{kit.name ? "Edit kit" : "New kit"}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-800 text-zinc-400 transition hover:text-zinc-100" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-3 block">
          <span className="text-sm text-zinc-300">Internal name (unique, uppercase)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none" required />
        </label>

        <label className="mb-3 block">
          <span className="text-sm text-zinc-300">Label</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none" required />
        </label>

        <label className="mb-3 block">
          <span className="text-sm text-zinc-300">Description</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none" />
        </label>

        <div className="mb-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-300">Items</label>
            <span className="text-xs text-zinc-500">(drag to reorder)</span>
          </div>
          <div className="mt-2 rounded-lg border border-zinc-700 bg-zinc-900 p-2">
            <ul className="space-y-2">
              {items.map((it, idx) => (
                <li key={idx} draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, idx)} className="flex items-center gap-2">
                  <input value={it} onChange={(e) => setItems((s) => s.map((v, i) => (i === idx ? e.target.value : v)))} className="flex-1 rounded-md bg-transparent px-2 py-1 text-sm text-zinc-100 outline-none border border-transparent focus:border-amber-500" />
                  <button type="button" onClick={() => removeItem(idx)} className="text-xs text-red-400">Remove</button>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex gap-2">
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add item" className="flex-1 rounded-md bg-transparent px-2 py-1 text-sm text-zinc-100 outline-none border border-zinc-700" />
              <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-3 py-1 text-sm font-semibold text-zinc-900">Add</button>
            </div>
          </div>
        </div>

        {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-bold text-zinc-900 disabled:opacity-70">
            {saving ? "Saving" : "Save"}
          </button>
          <button type="button" onClick={onClose} className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-200">Cancel</button>
        </div>
      </form>
    </div>
  );
}
