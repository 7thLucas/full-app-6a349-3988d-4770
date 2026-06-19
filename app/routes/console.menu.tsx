import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Star, PackageX } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import type { MenuItem, Outlet, CategoryKey } from "~/lib/domain.types";
import { CATEGORIES, formatIDR } from "~/lib/domain.types";
import { cn } from "~/lib/utils";

type Draft = {
  id?: string;
  name: string;
  description: string;
  category: CategoryKey;
  basePrice: string;
  imageUrl: string;
  isSignature: boolean;
  available: boolean;
};

const EMPTY: Draft = {
  name: "",
  description: "",
  category: "signature-promo",
  basePrice: "",
  imageUrl: "",
  isSignature: false,
  available: true,
};

export default function ConsoleMenu() {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [outletId, setOutletId] = useState<string>("");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    htApi.menu().then((r) => setItems(r.success && r.data ? r.data : []));
  };
  const loadOutlets = () => {
    htApi.outlets().then((r) => {
      if (r.success && r.data) {
        setOutlets(r.data);
        if (r.data[0] && !outletId) setOutletId(r.data[0].id);
      }
    });
  };

  useEffect(() => {
    load();
    loadOutlets();
  }, []);

  const outlet = outlets.find((o) => o.id === outletId);
  const soldOut = new Set(outlet?.soldOutItemIds ?? []);

  const toggleSoldOut = async (itemId: string) => {
    if (!outletId) return;
    const next = !soldOut.has(itemId);
    const r = await htApi.adminToggleSoldOut(outletId, itemId, next);
    if (r.success && r.data) {
      setOutlets((prev) => prev.map((o) => (o.id === outletId ? r.data! : o)));
    }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      name: editing.name,
      description: editing.description,
      category: editing.category,
      basePrice: Number(editing.basePrice) || 0,
      imageUrl: editing.imageUrl,
      isSignature: editing.isSignature,
      available: editing.available,
    };
    const r = editing.id
      ? await htApi.adminUpdateItem(editing.id, payload)
      : await htApi.adminCreateItem(payload);
    setSaving(false);
    if (r.success) {
      setEditing(null);
      load();
    }
  };

  const remove = async (it: MenuItem) => {
    if (!confirm(`Delete "${it.name}"? This cannot be undone.`)) return;
    await htApi.adminDeleteItem(it.id);
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-2xl font-bold">Menu &amp; Catalog</h1>
          <p className="text-sm text-[#6F6258]">Manage items and toggle per-outlet availability.</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-2 rounded-xl bg-[#C62828] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> New item
        </button>
      </div>

      {/* Outlet picker for sold-out context */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#6F6258]">Availability for:</span>
        {outlets.map((o) => (
          <button
            key={o.id}
            onClick={() => setOutletId(o.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              o.id === outletId ? "bg-[#3E2723] text-white" : "bg-[#F2EADD] text-[#6F6258]",
            )}
          >
            {o.mall}
          </button>
        ))}
      </div>

      {/* Items table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#EFE6D8] bg-white">
        {items === null ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse bg-[#FBF7F0]" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#6F6258]">No items yet. Create your first one.</p>
        ) : (
          <ul className="divide-y divide-[#EFE6D8]">
            {items.map((it) => {
              const out = soldOut.has(it.id);
              return (
                <li key={it.id} className="flex items-center gap-3 p-3">
                  <img src={it.imageUrl} alt={it.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{it.name}</p>
                      {it.isSignature && <Star className="h-3.5 w-3.5 fill-[#D9A441] text-[#D9A441]" />}
                    </div>
                    <p className="text-xs text-[#6F6258]">
                      {CATEGORIES.find((c) => c.key === it.category)?.name ?? it.category} · {formatIDR(it.basePrice)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSoldOut(it.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                      out ? "bg-[#C62828]/10 text-[#C62828]" : "bg-[#2E7D32]/10 text-[#2E7D32]",
                    )}
                  >
                    {out ? <><PackageX className="h-3.5 w-3.5" /> Sold out</> : "Available"}
                  </button>
                  <button onClick={() => setEditing({
                    id: it.id,
                    name: it.name,
                    description: it.description,
                    category: it.category,
                    basePrice: String(it.basePrice),
                    imageUrl: it.imageUrl,
                    isSignature: !!it.isSignature,
                    available: true,
                  })} className="rounded-lg p-2 text-[#6F6258] hover:bg-[#F2EADD]">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(it)} className="rounded-lg p-2 text-[#C62828] hover:bg-[#C62828]/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Editor drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button className="absolute inset-0 bg-[#3E2723]/40" onClick={() => setEditing(null)} aria-label="Close" />
          <div className="relative h-full w-full max-w-md overflow-y-auto bg-[#FDFBF7] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-xl font-bold">{editing.id ? "Edit item" : "New item"}</h2>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 hover:bg-[#F2EADD]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Name">
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Description">
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as CategoryKey })} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Base price (IDR)">
                  <input type="number" value={editing.basePrice} onChange={(e) => setEditing({ ...editing, basePrice: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Image URL">
                <input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} className={inputCls} />
              </Field>
              {editing.imageUrl && (
                <img src={editing.imageUrl} alt="" className="h-32 w-full rounded-xl object-cover" />
              )}
              <label className="flex items-center gap-2.5 text-sm">
                <input type="checkbox" checked={editing.isSignature} onChange={(e) => setEditing({ ...editing, isSignature: e.target.checked })} className="h-4 w-4 accent-[#C62828]" />
                Signature item
              </label>
            </div>

            <button
              onClick={save}
              disabled={saving || !editing.name.trim()}
              className="mt-7 w-full rounded-xl bg-[#C62828] py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save item"}
            </button>
            {editing.id && (
              <p className="mt-3 text-center text-xs text-[#6F6258]">
                Option groups (sugar, ice, toppings) are managed via seeded data in this build.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-[#E0D4C2] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#C62828]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#3E2723]">{label}</label>
      {children}
    </div>
  );
}
