import { useEffect, useMemo, useState, useCallback } from "react";
import { RefreshCw, Clock, MapPin, Check, ChevronRight } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import type { Outlet, Order, OrderStatus } from "~/lib/domain.types";
import { formatIDR, ORDER_STEPS } from "~/lib/domain.types";
import { cn } from "~/lib/utils";

const COLUMNS: { key: OrderStatus; label: string; tone: string }[] = [
  { key: "received", label: "Received", tone: "border-[#6F6258]" },
  { key: "preparing", label: "Preparing", tone: "border-[#D9A441]" },
  { key: "ready", label: "Ready", tone: "border-[#2E7D32]" },
];

const NEXT_LABEL: Record<string, string> = {
  received: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark collected",
};

export default function OrderBoard() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [outletId, setOutletId] = useState<string>("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    htApi.outlets().then((r) => {
      if (r.success && r.data) {
        setOutlets(r.data);
        if (r.data[0]) setOutletId(r.data[0].id);
      }
    });
  }, []);

  const loadOrders = useCallback(async () => {
    if (!outletId) return;
    const r = await htApi.adminOutletOrders(outletId);
    setOrders(r.success && r.data ? r.data : []);
  }, [outletId]);

  useEffect(() => {
    setOrders(null);
    loadOrders();
  }, [loadOrders]);

  // poll for new orders + tick prep timer
  useEffect(() => {
    const poll = setInterval(loadOrders, 8000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [loadOrders]);

  const advance = async (o: Order) => {
    await htApi.adminAdvanceOrder(o.id);
    loadOrders();
  };

  const active = useMemo(
    () => (orders ?? []).filter((o) => ["received", "preparing", "ready"].includes(o.status)),
    [orders],
  );
  const outlet = outlets.find((o) => o.id === outletId);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-2xl font-bold">Live Order Board</h1>
          <p className="text-sm text-[#6F6258]">Real-time pickup queue — advance each order as the kitchen progresses.</p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E0D4C2] bg-white px-3.5 py-2 text-sm font-medium"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Outlet picker */}
      <div className="mt-4 flex flex-wrap gap-2">
        {outlets.map((o) => (
          <button
            key={o.id}
            onClick={() => setOutletId(o.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium",
              o.id === outletId ? "bg-[#3E2723] text-white" : "bg-[#F2EADD] text-[#6F6258]",
            )}
          >
            <MapPin className="h-3.5 w-3.5" /> {o.mall}
          </button>
        ))}
      </div>

      {outlet && (
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#6F6258]">
          <span className={cn("inline-flex items-center gap-1.5 font-medium", outlet.isOpen ? "text-[#2E7D32]" : "text-[#C62828]")}>
            <span className={cn("h-2 w-2 rounded-full", outlet.isOpen ? "bg-[#2E7D32]" : "bg-[#C62828]")} />
            {outlet.isOpen ? "Open" : "Closed"}
          </span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> Prep ~{outlet.prepMinutes} min</span>
          <span>{active.length} active order{active.length === 1 ? "" : "s"}</span>
        </div>
      )}

      {/* Columns */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colOrders = active.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="rounded-2xl bg-[#FBF7F0] p-3">
              <div className={cn("mb-3 flex items-center justify-between border-l-4 pl-2.5", col.tone)}>
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold tabular-nums text-[#6F6258]">
                  {colOrders.length}
                </span>
              </div>
              <div className="space-y-3">
                {orders === null ? (
                  <div className="h-28 animate-pulse rounded-xl bg-white" />
                ) : colOrders.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[#6F6258]">No orders</p>
                ) : (
                  colOrders.map((o) => <OrderTicket key={o.id} order={o} now={now} onAdvance={() => advance(o)} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderTicket({ order, now, onAdvance }: { order: Order; now: number; onAdvance: () => void }) {
  const placed = new Date(order.createdAt).getTime();
  const elapsedMin = Math.floor((now - placed) / 60000);
  const overdue = order.status !== "ready" && elapsedMin > order.etaMinutes;

  return (
    <div className="rounded-xl border border-[#EFE6D8] bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-serif-display text-lg font-bold tabular-nums">{order.pickupCode}</span>
        <span className={cn("inline-flex items-center gap-1 text-xs font-medium tabular-nums", overdue ? "text-[#C62828]" : "text-[#6F6258]")}>
          <Clock className="h-3.5 w-3.5" /> {elapsedMin}m
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {order.lines.map((l, i) => (
          <li key={i} className="text-sm text-[#3E2723]">
            <span className="font-semibold tabular-nums">{l.quantity}×</span> {l.name}
            {l.options.length > 0 && (
              <span className="block pl-5 text-xs text-[#6F6258]">{l.options.map((o) => o.choiceLabel).join(" · ")}</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2.5 flex items-center justify-between border-t border-[#EFE6D8] pt-2.5">
        <span className="text-sm font-semibold tabular-nums">{formatIDR(order.total)}</span>
        <span className="text-xs text-[#6F6258]">{order.paymentMethod}</span>
      </div>
      <button
        onClick={onAdvance}
        className={cn(
          "mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white",
          order.status === "ready" ? "bg-[#2E7D32]" : "bg-[#C62828]",
        )}
      >
        {order.status === "ready" ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {NEXT_LABEL[order.status]}
      </button>
    </div>
  );
}
