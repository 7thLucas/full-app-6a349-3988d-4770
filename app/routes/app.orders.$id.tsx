import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Check, Sparkles, Clock, MapPin } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import { useMember } from "~/state/member-context";
import { useAppStore } from "~/state/app-store";
import { useToast } from "~/state/toast";
import type { Order } from "~/lib/domain.types";
import { formatIDR, ORDER_STEPS } from "~/lib/domain.types";
import { AppHeader } from "~/components/app/phone-shell";
import { Card, Skeleton, Button } from "~/components/ui/primitives";
import { cn } from "~/lib/utils";

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  received: { title: "Order received", body: "We've got your order — payment confirmed." },
  preparing: { title: "Preparing your order", body: "Our team is crafting your desserts." },
  ready: { title: "Ready for pickup!", body: "Show your pickup code at the counter." },
  collected: { title: "Order collected", body: "Enjoy your Hong Tang treats!" },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useMember();
  const { addToCart } = useAppStore();
  const { notify } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const lastStatus = useRef<string | null>(null);
  const advancing = useRef(false);

  const load = async () => {
    if (!id) return;
    const res = await htApi.order(id);
    if (res.success && res.data) {
      setOrder(res.data);
      if (lastStatus.current && lastStatus.current !== res.data.status) {
        const c = STATUS_COPY[res.data.status];
        if (c) notify(c.title, c.body);
        refresh();
      }
      lastStatus.current = res.data.status;
    } else {
      setNotFound(true);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // Simulated kitchen progression: auto-advance every ~6s until "ready".
  useEffect(() => {
    if (!order) return;
    if (["ready", "collected", "cancelled"].includes(order.status)) return;
    const t = setTimeout(async () => {
      if (advancing.current || !id) return;
      advancing.current = true;
      await htApi.advanceOrder(id);
      advancing.current = false;
      load();
    }, 6000);
    return () => clearTimeout(t);
  }, [order?.status]);

  const markCollected = async () => {
    if (!id) return;
    await htApi.advanceOrder(id); // ready -> collected
    load();
  };

  const cancel = async () => {
    if (!id) return;
    await htApi.cancelOrder(id);
    refresh();
    load();
  };

  // Reorder: rebuild the cart from this order's lines (Sprint 6/10).
  const reorder = () => {
    if (!order) return;
    for (const l of order.lines) {
      const optTotal = l.options.reduce((s, o) => s + o.priceDelta, 0);
      addToCart({
        itemId: l.itemId,
        name: l.name,
        imageUrl: l.imageUrl,
        basePrice: l.unitPrice - optTotal,
        quantity: l.quantity,
        options: l.options,
        unitPrice: l.unitPrice,
      });
    }
    notify("Added to cart", "Your previous order is ready to checkout.");
    navigate("/app/cart");
  };

  const rate = () => notify("Thanks for your feedback!", "Rating saved (preview).");

  if (notFound) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground">Order not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/orders")}>Back to orders</Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <AppHeader title="Order" left={<button onClick={() => navigate(-1)}><ChevronLeft className="h-6 w-6" /></button>} />
        <div className="p-4 space-y-3">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const cancelled = order.status === "cancelled";
  const stepIdx = ORDER_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="ht-fade-in">
      <AppHeader
        title="Your order"
        left={
          <button onClick={() => navigate("/app/orders")} className="-ml-1 text-foreground" aria-label="Back">
            <ChevronLeft className="h-6 w-6" />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 pb-10">
        {/* Pickup code card */}
        <div className={cn("rounded-2xl p-5 text-center", cancelled ? "bg-secondary" : "bg-primary")}>
          {cancelled ? (
            <>
              <p className="font-serif-display text-lg font-semibold text-foreground">Order cancelled</p>
              <p className="mt-1 text-sm text-muted-foreground">A refund has been issued to your payment method.</p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E9C9A3]">Pickup code</p>
              <p className="font-serif-display text-4xl font-bold tracking-wide text-primary-foreground tabular-nums mt-1">
                {order.pickupCode}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary-foreground/85">
                <MapPin className="h-4 w-4" /> {order.outletName}
              </p>
            </>
          )}
        </div>

        {/* Status stepper */}
        {!cancelled && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-accent" />
              <p className="text-sm font-medium text-foreground">
                {order.status === "ready" || order.status === "collected"
                  ? "Ready to collect"
                  : `Ready in ~${order.etaMinutes} min`}
              </p>
            </div>
            <div className="relative">
              {ORDER_STEPS.map((s, i) => {
                const done = i < stepIdx;
                const current = i === stepIdx;
                const isLast = i === ORDER_STEPS.length - 1;
                return (
                  <div key={s.key} className="relative flex gap-3 pb-6 last:pb-0">
                    {!isLast && (
                      <span
                        className={cn(
                          "absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5",
                          done ? "bg-accent" : "bg-[#E8DECF]",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        done || current ? "border-accent bg-accent text-accent-foreground" : "border-[#E0D4C2] bg-background text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold tabular-nums">{i + 1}</span>}
                    </span>
                    <div className="pt-1">
                      <p className={cn("text-sm font-semibold", current || done ? "text-foreground" : "text-muted-foreground")}>
                        {s.label}
                      </p>
                      {current && (
                        <p className="text-xs text-muted-foreground">{STATUS_COPY[s.key]?.body}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.status === "ready" && (
              <Button full className="mt-2" onClick={markCollected}>
                I've collected my order
              </Button>
            )}
          </Card>
        )}

        {/* Loyalty earned */}
        {!cancelled && (
          <Card className="p-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Sparkles className="h-5 w-5 text-accent" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                +{order.crystalsEarned} Sugar Crystals · +{order.bowlsEarned} Bowls
              </p>
              <p className="text-xs text-muted-foreground">Earned on this order — Bowls move your tier up.</p>
            </div>
          </Card>
        )}

        {/* Receipt */}
        <Card className="p-4">
          <p className="text-sm font-semibold text-foreground mb-2.5">Order details</p>
          <div className="space-y-2.5">
            {order.lines.map((l, i) => (
              <div key={i} className="flex justify-between gap-3 text-sm">
                <span className="text-foreground">
                  <span className="tabular-nums">{l.quantity}×</span> {l.name}
                  {l.options.length > 0 && (
                    <span className="block text-xs text-muted-foreground">{l.options.map((o) => o.choiceLabel).join(" · ")}</span>
                  )}
                </span>
                <span className="text-foreground tabular-nums shrink-0">{formatIDR(l.unitPrice * l.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="my-3 h-px bg-[#EFE6D8]" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums text-foreground">{formatIDR(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount {order.voucherCode ? `(${order.voucherCode})` : ""}</span><span className="tabular-nums text-[#2E7D32]">−{formatIDR(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Tax (PB1 10%)</span><span className="tabular-nums text-muted-foreground">{formatIDR(order.tax)}</span></div>
            <div className="flex justify-between pt-1"><span className="font-semibold text-foreground">Total · {order.paymentMethod}</span><span className="font-semibold tabular-nums text-foreground">{formatIDR(order.total)}</span></div>
          </div>
        </Card>

        {order.status === "received" && (
          <button onClick={cancel} className="w-full py-2 text-sm font-medium text-accent">
            Cancel order
          </button>
        )}

        {/* Terminal-state actions (Sprint 6): Reorder + Rate */}
        {(order.status === "collected" || cancelled) && (
          <div className="flex gap-2">
            <Button full onClick={reorder}>Reorder</Button>
            {order.status === "collected" && (
              <Button full variant="outline" onClick={rate}>Rate</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
