import { useEffect, useState } from "react";
import { Store, Clock, Check } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import type { Outlet } from "~/lib/domain.types";
import { cn } from "~/lib/utils";

export default function ConsoleOutlets() {
  const [outlets, setOutlets] = useState<Outlet[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    htApi.outlets().then((r) => setOutlets(r.success && r.data ? r.data : []));
  }, []);

  const patch = (id: string, changes: Partial<Outlet>) => {
    setOutlets((prev) => (prev ? prev.map((o) => (o.id === id ? { ...o, ...changes } : o)) : prev));
  };

  const persist = async (o: Outlet) => {
    setSavingId(o.id);
    const r = await htApi.adminUpdateOutlet(o.id, {
      openTime: o.openTime,
      closeTime: o.closeTime,
      lastOrderTime: o.lastOrderTime,
      prepMinutes: o.prepMinutes,
      isOpen: o.isOpen,
      pickupEnabled: o.pickupEnabled,
    });
    setSavingId(null);
    if (r.success && r.data) {
      patch(o.id, r.data);
      setSavedId(o.id);
      setTimeout(() => setSavedId((s) => (s === o.id ? null : s)), 1800);
    }
  };

  return (
    <div>
      <h1 className="font-serif-display text-2xl font-bold">Outlets</h1>
      <p className="text-sm text-[#6F6258]">Hours, open/closed status, pickup, and prep time per location.</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {outlets === null
          ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-[#FBF7F0]" />)
          : outlets.map((o) => (
              <div key={o.id} className="rounded-2xl border border-[#EFE6D8] bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C62828]/10">
                    <Store className="h-5 w-5 text-[#C62828]" />
                  </span>
                  <div className="flex-1">
                    <p className="font-serif-display text-lg font-bold">{o.mall}</p>
                    <p className="text-xs text-[#6F6258]">{o.city} · {o.address}</p>
                  </div>
                </div>

                {/* Toggles */}
                <div className="mt-4 space-y-2.5">
                  <Toggle label="Open for business" on={o.isOpen} onChange={(v) => patch(o.id, { isOpen: v })} />
                  <Toggle label="Order-ahead pickup" on={o.pickupEnabled} onChange={(v) => patch(o.id, { pickupEnabled: v })} />
                </div>

                {/* Hours */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <TimeField label="Opens" value={o.openTime} onChange={(v) => patch(o.id, { openTime: v })} />
                  <TimeField label="Closes" value={o.closeTime} onChange={(v) => patch(o.id, { closeTime: v })} />
                  <TimeField label="Last order" value={o.lastOrderTime} onChange={(v) => patch(o.id, { lastOrderTime: v })} />
                </div>

                {/* Prep time */}
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium">Prep time (minutes)</label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#6F6258]" />
                    <input
                      type="number"
                      min={1}
                      value={o.prepMinutes}
                      onChange={(e) => patch(o.id, { prepMinutes: Number(e.target.value) })}
                      className="w-24 rounded-xl border border-[#E0D4C2] bg-white px-3 py-2 text-sm tabular-nums outline-none focus:border-[#C62828]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => persist(o)}
                  disabled={savingId === o.id}
                  className={cn(
                    "mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white",
                    savedId === o.id ? "bg-[#2E7D32]" : "bg-[#C62828]",
                  )}
                >
                  {savedId === o.id ? <><Check className="h-4 w-4" /> Saved</> : savingId === o.id ? "Saving…" : "Save changes"}
                </button>
              </div>
            ))}
      </div>
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="flex w-full items-center justify-between rounded-xl bg-[#FBF7F0] px-4 py-2.5 text-left">
      <span className="text-sm font-medium">{label}</span>
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-[#2E7D32]" : "bg-[#D5C8B5]")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#6F6258]">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#E0D4C2] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#C62828]"
      />
    </div>
  );
}
