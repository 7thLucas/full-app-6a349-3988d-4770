import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Filter, RefreshCw, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import type { FinanceTransaction, Outlet, ReconciliationRow } from "~/lib/domain.types";
import { formatIDR } from "~/lib/domain.types";
import { cn } from "~/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);

export default function ConsoleFinance() {
  const [txns, setTxns] = useState<FinanceTransaction[] | null>(null);
  const [recons, setRecons] = useState<ReconciliationRow[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [filters, setFilters] = useState({ status: "", method: "", outletId: "", from: "", to: "" });
  const [settlementDate, setSettlementDate] = useState(today());
  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const [ledger, rec, outs] = await Promise.all([
      htApi.adminTransactions(activeFilters),
      htApi.adminReconciliations({ date: settlementDate, outletId: filters.outletId || undefined }),
      htApi.outlets(),
    ]);
    setTxns(ledger.success && ledger.data ? ledger.data : []);
    setRecons(rec.success && rec.data ? rec.data : []);
    if (outs.success && outs.data) setOutlets(outs.data);
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const paid = (txns ?? []).filter((t) => t.status === "paid");
    return {
      paid: paid.reduce((s, t) => s + t.amount, 0),
      refunds: (txns ?? []).filter((t) => t.status === "refunded").reduce((s, t) => s + t.amount, 0),
      pending: (txns ?? []).filter((t) => t.refundStatus === "pending").length,
    };
  }, [txns]);

  const requestRefund = async (id: string) => {
    setBusy(id);
    const r = await htApi.adminRequestRefund(id, reason);
    setBusy(null);
    if (r.success) {
      setReasonFor(null);
      setReason("");
      load();
    } else {
      alert(r.message ?? "Refund request failed");
    }
  };

  const approve = async (id: string, ok: boolean) => {
    setBusy(id);
    const r = await htApi.adminApproveRefund(id, ok);
    setBusy(null);
    if (r.success) load();
    else alert(r.message ?? "Approval failed");
  };

  const runRecon = async () => {
    setBusy("recon");
    const r = await htApi.adminRunReconciliation({
      settlementDate,
      outletId: filters.outletId || undefined,
    });
    setBusy(null);
    if (r.success) load();
    else alert(r.message ?? "Reconciliation failed");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-2xl font-bold">Payments & Finance</h1>
          <p className="text-sm text-[#6F6258]">Transaction ledger, dual-approval refunds, and settlement reconciliation.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-[#E0D4C2] bg-white px-3.5 py-2 text-sm font-medium">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Metric label="Paid volume" value={formatIDR(totals.paid)} />
        <Metric label="Refunded" value={formatIDR(totals.refunds)} />
        <Metric label="Pending approvals" value={String(totals.pending)} />
      </div>

      <div className="mt-5 rounded-2xl border border-[#EFE6D8] bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4 text-[#C62828]" /> Ledger filters
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <Select value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={["", "paid", "authorized", "failed", "refunded"]} label="Status" />
          <Select value={filters.method} onChange={(v) => setFilters({ ...filters, method: v })} options={["", "QRIS", "GoPay", "OVO", "DANA", "ShopeePay", "Visa", "Mastercard"]} label="Method" />
          <select value={filters.outletId} onChange={(e) => setFilters({ ...filters, outletId: e.target.value })} className={inputCls}>
            <option value="">All outlets</option>
            {outlets.map((o) => <option key={o.id} value={o.id}>{o.mall}</option>)}
          </select>
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className={inputCls} />
          <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3E2723] px-3 py-2 text-sm font-semibold text-white">
            <Search className="h-4 w-4" /> Apply
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#EFE6D8] bg-white">
        <div className="grid grid-cols-[1.1fr_.8fr_.8fr_.8fr_.9fr] gap-3 border-b border-[#EFE6D8] bg-[#FBF7F0] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#6F6258]">
          <span>Order</span><span>Method</span><span>Amount</span><span>Status</span><span>Action</span>
        </div>
        {txns === null ? (
          <div className="h-36 animate-pulse bg-[#FBF7F0]" />
        ) : txns.length === 0 ? (
          <p className="p-10 text-center text-sm text-[#6F6258]">No transactions match these filters.</p>
        ) : (
          <ul className="divide-y divide-[#EFE6D8]">
            {txns.map((t) => (
              <li key={t.id} className="grid grid-cols-[1.1fr_.8fr_.8fr_.8fr_.9fr] gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold">{t.pickupCode || t.orderId.slice(-6)}</p>
                  <p className="truncate text-xs text-[#6F6258]">{t.outletName || "Unknown outlet"} · {t.gatewayRef}</p>
                </div>
                <span>{t.method}</span>
                <span className="font-semibold tabular-nums">{formatIDR(t.amount)}</span>
                <Status value={t.refundStatus === "pending" ? "refund pending" : t.status} />
                <div>
                  {t.refundStatus === "pending" ? (
                    <div className="flex gap-2">
                      <IconButton label="Approve refund" onClick={() => approve(t.id, true)} disabled={busy === t.id}><CheckCircle2 className="h-4 w-4" /></IconButton>
                      <IconButton label="Reject refund" onClick={() => approve(t.id, false)} disabled={busy === t.id}><AlertTriangle className="h-4 w-4" /></IconButton>
                    </div>
                  ) : t.status === "paid" ? (
                    <button onClick={() => setReasonFor(t.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#C62828]/10 px-2.5 py-1.5 text-xs font-semibold text-[#C62828]">
                      <RotateCcw className="h-3.5 w-3.5" /> Refund
                    </button>
                  ) : (
                    <span className="text-xs text-[#6F6258]">No action</span>
                  )}
                </div>
                {reasonFor === t.id && (
                  <div className="col-span-5 rounded-xl bg-[#FBF7F0] p-3">
                    <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Refund reason required" className={inputCls} />
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => requestRefund(t.id)} disabled={!reason.trim() || busy === t.id} className="rounded-lg bg-[#C62828] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Submit for approval</button>
                      <button onClick={() => setReasonFor(null)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#6F6258]">Cancel</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-[#EFE6D8] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-display text-xl font-bold">Settlement Reconciliation</h2>
            <p className="text-sm text-[#6F6258]">App vs POS vs gateway totals with mismatch flags.</p>
          </div>
          <div className="flex gap-2">
            <input type="date" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} className={inputCls} />
            <button onClick={runRecon} disabled={busy === "recon"} className="rounded-xl bg-[#3E2723] px-3.5 py-2 text-sm font-semibold text-white">Run</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recons.length === 0 ? <p className="text-sm text-[#6F6258]">No reconciliation rows yet.</p> : recons.map((r) => (
            <div key={r.id} className={cn("rounded-xl border p-3", r.status === "mismatch" ? "border-[#C62828] bg-[#C62828]/5" : "border-[#EFE6D8] bg-[#FBF7F0]")}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{r.settlementDate}</p>
                <Status value={r.status} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <span>App <b className="block tabular-nums">{formatIDR(r.appTotal)}</b></span>
                <span>POS <b className="block tabular-nums">{formatIDR(r.posTotal)}</b></span>
                <span>Gateway <b className="block tabular-nums">{formatIDR(r.gatewayTotal)}</b></span>
              </div>
              {r.mismatchFlags.length > 0 && <p className="mt-2 text-xs font-semibold text-[#C62828]">{r.mismatchFlags.join(", ")}</p>}
              {r.status === "mismatch" && <button onClick={() => htApi.adminResolveReconciliation(r.id).then(load)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#2E7D32] px-2.5 py-1.5 text-xs font-semibold text-white"><ShieldCheck className="h-3.5 w-3.5" /> Mark resolved</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-[#E0D4C2] bg-white px-3 py-2 text-sm outline-none focus:border-[#C62828]";

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[#EFE6D8] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#6F6258]">{label}</p><p className="mt-1 font-serif-display text-2xl font-bold tabular-nums">{value}</p></div>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>{options.map((o) => <option key={o} value={o}>{o || label}</option>)}</select>;
}

function Status({ value }: { value: string }) {
  const good = ["paid", "matched", "resolved", "approved"].includes(value);
  const warn = ["pending", "refund pending", "mismatch"].includes(value);
  return <span className={cn("inline-flex w-fit rounded-full px-2 py-1 text-xs font-bold", good ? "bg-[#2E7D32]/10 text-[#2E7D32]" : warn ? "bg-[#D9A441]/15 text-[#8A5A00]" : "bg-[#C62828]/10 text-[#C62828]")}>{value}</span>;
}

function IconButton({ label, children, onClick, disabled }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button title={label} aria-label={label} onClick={onClick} disabled={disabled} className="rounded-lg border border-[#E0D4C2] bg-white p-1.5 text-[#3E2723] disabled:opacity-50">{children}</button>;
}
