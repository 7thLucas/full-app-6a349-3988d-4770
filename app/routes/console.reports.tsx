import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Download, Play, Save } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import type { Outlet, ReportDefinition, ReportResult } from "~/lib/domain.types";
import { formatIDR } from "~/lib/domain.types";
import { cn } from "~/lib/utils";

export default function ConsoleReports() {
  const [defs, setDefs] = useState<ReportDefinition[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [selected, setSelected] = useState("sales");
  const [filters, setFilters] = useState({ outletId: "", from: "", to: "" });
  const [result, setResult] = useState<ReportResult | null>(null);
  const [schedule, setSchedule] = useState({ name: "", deliverTo: "", cron: "0 8 * * *" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [d, o, s] = await Promise.all([htApi.adminReportDefinitions(), htApi.outlets(), htApi.adminSavedReports()]);
    if (d.success && d.data) {
      setDefs(d.data);
      if (!selected && d.data[0]) setSelected(d.data[0].key);
    }
    if (o.success && o.data) setOutlets(o.data);
    if (s.success && s.data) setSaved(s.data);
  };

  useEffect(() => {
    load();
  }, []);

  const activeDef = defs.find((d) => d.key === selected);
  const columns = useMemo(() => {
    const rows = result?.rows ?? [];
    return [...new Set(rows.flatMap((r) => Object.keys(r)))].slice(0, 8);
  }, [result]);

  const run = async () => {
    setBusy(true);
    const r = await htApi.adminRunReport(selected, Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
    setBusy(false);
    if (r.success && r.data) setResult(r.data);
    else alert(r.message ?? "Report failed");
  };

  const save = async () => {
    const r = await htApi.adminSaveReport({
      name: schedule.name || activeDef?.name || selected,
      reportKey: selected,
      filters,
      schedule: schedule.cron || null,
      deliverTo: schedule.deliverTo || null,
    });
    if (r.success) {
      setSchedule({ name: "", deliverTo: "", cron: "0 8 * * *" });
      load();
    } else {
      alert(r.message ?? "Could not save report");
    }
  };

  const exportHref = `/api/admin/reports/${selected}/export?${new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString()}`;

  return (
    <div>
      <div>
        <h1 className="font-serif-display text-2xl font-bold">Reports</h1>
        <p className="text-sm text-[#6F6258]">Standard reporting, Sugar Crystals liability, custom saved views, schedules, and CSV export.</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-[#EFE6D8] bg-white p-3">
          <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#6F6258]">Report suite</p>
          <div className="mt-2 space-y-1">
            {defs.map((d) => (
              <button
                key={d.key}
                onClick={() => { setSelected(d.key); setResult(null); }}
                className={cn("w-full rounded-xl px-3 py-2.5 text-left text-sm transition", selected === d.key ? "bg-[#C62828] text-white" : "hover:bg-[#FBF7F0]")}
              >
                <span className="block font-semibold">{d.name}</span>
                <span className={cn("mt-0.5 block text-xs", selected === d.key ? "text-white/80" : "text-[#6F6258]")}>{d.description}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="rounded-2xl border border-[#EFE6D8] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif-display text-xl font-bold">{activeDef?.name ?? "Report"}</h2>
                <p className="text-sm text-[#6F6258]">{activeDef?.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={run} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#3E2723] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  <Play className="h-4 w-4" /> Run
                </button>
                <a href={exportHref} className="inline-flex items-center gap-2 rounded-xl border border-[#E0D4C2] bg-white px-3.5 py-2 text-sm font-semibold">
                  <Download className="h-4 w-4" /> CSV
                </a>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <select value={filters.outletId} onChange={(e) => setFilters({ ...filters, outletId: e.target.value })} className={inputCls}>
                <option value="">All outlets</option>
                {outlets.map((o) => <option key={o.id} value={o.id}>{o.mall}</option>)}
              </select>
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className={inputCls} />
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className={inputCls} />
            </div>
          </div>

          {result && (
            <div className="mt-4 rounded-2xl border border-[#EFE6D8] bg-white">
              {result.totals && (
                <div className="grid gap-3 border-b border-[#EFE6D8] p-4 md:grid-cols-4">
                  {Object.entries(result.totals).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#6F6258]">{k}</p>
                      <p className="font-serif-display text-xl font-bold tabular-nums">{k.toLowerCase().includes("idr") || k === "revenue" || k === "tax" || k === "discounts" ? formatIDR(Number(v)) : v}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#FBF7F0] text-xs uppercase tracking-wide text-[#6F6258]">
                    <tr>{columns.map((c) => <th key={c} className="px-4 py-3">{c}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE6D8]">
                    {(result.rows ?? []).slice(0, 60).map((row, i) => (
                      <tr key={i}>{columns.map((c) => <td key={c} className="max-w-[220px] truncate px-4 py-3">{formatCell(row[c])}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(result.rows ?? []).length === 0 && <p className="p-10 text-center text-sm text-[#6F6258]">No rows for this report window.</p>}
            </div>
          )}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#EFE6D8] bg-white p-4">
              <div className="mb-3 flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-[#C62828]" /> Save & schedule</div>
              <div className="space-y-3">
                <input value={schedule.name} onChange={(e) => setSchedule({ ...schedule, name: e.target.value })} placeholder="View name" className={inputCls} />
                <input value={schedule.deliverTo} onChange={(e) => setSchedule({ ...schedule, deliverTo: e.target.value })} placeholder="finance@hongtang.id" className={inputCls} />
                <input value={schedule.cron} onChange={(e) => setSchedule({ ...schedule, cron: e.target.value })} placeholder="0 8 * * *" className={inputCls} />
                <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-[#C62828] px-3.5 py-2 text-sm font-semibold text-white">
                  <Save className="h-4 w-4" /> Save view
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-[#EFE6D8] bg-white p-4">
              <p className="mb-3 font-semibold">Saved views</p>
              <div className="space-y-2">
                {saved.length === 0 ? <p className="text-sm text-[#6F6258]">No saved reports yet.</p> : saved.map((s) => (
                  <button key={s.id} onClick={() => { setSelected(s.reportKey); setFilters({ outletId: s.filters?.outletId ?? "", from: s.filters?.from ?? "", to: s.filters?.to ?? "" }); }} className="w-full rounded-xl bg-[#FBF7F0] px-3 py-2 text-left text-sm">
                    <span className="block font-semibold">{s.name}</span>
                    <span className="text-xs text-[#6F6258]">{s.reportKey} · {s.schedule || "manual"} · {s.deliverTo || "no recipient"}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-[#E0D4C2] bg-white px-3 py-2 text-sm outline-none focus:border-[#C62828]";

function formatCell(value: any) {
  if (typeof value === "number") return value > 1000 ? formatIDR(value) : String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return value == null ? "" : String(value);
}
