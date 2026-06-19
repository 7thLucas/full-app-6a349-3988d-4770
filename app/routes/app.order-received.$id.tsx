import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Check, Clock, MapPin, Receipt, Sparkles } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import type { Order } from "~/lib/domain.types";
import { formatIDR } from "~/lib/domain.types";
import { Button, Skeleton } from "~/components/ui/primitives";

export default function OrderReceived() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    htApi.order(id).then((r) => setOrder(r.success && r.data ? r.data : null));
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFF8EF] px-5 pt-20">
        <Skeleton className="mx-auto h-52 w-full rounded-[28px]" />
        <Skeleton className="mx-auto mt-5 h-12 w-3/4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#FFF8EF] text-[#3E2723]">
      <div className="relative px-5 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="absolute left-[-70px] top-20 h-44 w-44 rounded-full bg-[#C62828]/10" />
        <div className="absolute right-[-80px] top-8 h-52 w-52 rounded-full bg-[#D9A441]/16" />

        <div className="relative mx-auto mt-5 flex h-28 w-28 items-center justify-center rounded-full bg-[#3E2723] shadow-[0_20px_50px_rgba(62,39,35,0.25)]">
          <span className="absolute inset-3 rounded-full border border-[#E9C9A3]/35" />
          <Check className="h-12 w-12 text-[#F8E7C8]" strokeWidth={2.6} />
        </div>

        <div className="relative mt-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#C62828]">Payment confirmed</p>
          <h1 className="mt-2 font-serif-display text-4xl font-bold leading-tight">We've received your order</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[#6F6258]">
            The kitchen has your ticket. Keep this pickup code ready while we prepare everything fresh.
          </p>
        </div>

        <div className="relative mt-7 rounded-[28px] border border-[#EFE6D8] bg-white p-5 shadow-[0_16px_40px_rgba(62,39,35,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#6F6258]">Pickup code</p>
              <p className="mt-1 font-serif-display text-3xl font-bold tracking-wide tabular-nums">{order.pickupCode}</p>
            </div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C62828]/10 text-[#C62828]">
              <Receipt className="h-7 w-7" />
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            <Info icon={<MapPin className="h-4 w-4" />} label="Pickup at" value={order.outletName} />
            <Info icon={<Clock className="h-4 w-4" />} label="Estimated ready" value={`~${order.etaMinutes} minutes`} />
            <Info icon={<Sparkles className="h-4 w-4" />} label="Rewards pending" value={`+${order.crystalsEarned} Crystals · +${order.bowlsEarned} Bowls`} />
          </div>

          <div className="mt-5 border-t border-[#EFE6D8] pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#6F6258]">{order.lines.reduce((s, l) => s + l.quantity, 0)} item{order.lines.reduce((s, l) => s + l.quantity, 0) === 1 ? "" : "s"}</span>
              <span className="font-bold tabular-nums">{formatIDR(order.total)}</span>
            </div>
            <p className="mt-1 truncate text-xs text-[#6F6258]">{order.lines.map((l) => `${l.quantity}x ${l.name}`).join(", ")}</p>
          </div>
        </div>

        <div className="relative mt-6 space-y-3">
          <Button full onClick={() => navigate(`/app/orders/${order.id}`, { replace: true })}>
            Track my order
          </Button>
          <Button full variant="outline" onClick={() => navigate("/app/menu")}>
            Add something else
          </Button>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#FBF7F0] px-3.5 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#C62828]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs text-[#6F6258]">{label}</span>
        <span className="block truncate text-sm font-semibold text-[#3E2723]">{value}</span>
      </span>
    </div>
  );
}
