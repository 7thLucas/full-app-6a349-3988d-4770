import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Receipt, RefreshCw, ChevronRight } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import { useAppStore } from "~/state/app-store";
import { useToast } from "~/state/toast";
import type { Order } from "~/lib/domain.types";
import { formatIDR, ORDER_STEPS } from "~/lib/domain.types";
import { AppHeader } from "~/components/app/phone-shell";
import { Card, Skeleton, Badge, Button, EmptyState } from "~/components/ui/primitives";
import { cn } from "~/lib/utils";

const statusTone: Record<string, "accent" | "neutral" | "muted"> = {
  received: "neutral",
  preparing: "neutral",
  ready: "accent",
  collected: "muted",
  cancelled: "muted",
};

export default function Orders() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, addToCart } = useAppStore();
  const { notify } = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [tab, setTab] = useState<"active" | "past">("active");

  useEffect(() => {
    htApi.orders().then((r) => setOrders(r.success && r.data ? r.data : []));
  }, []);

  const active = (orders ?? []).filter((o) => ["received", "preparing", "ready"].includes(o.status));
  const past = (orders ?? []).filter((o) => ["collected", "cancelled"].includes(o.status));
  const list = tab === "active" ? active : past;

  const reorder = (o: Order) => {
    o.lines.forEach((l) =>
      addToCart({
        itemId: l.itemId,
        name: l.name,
        imageUrl: l.imageUrl,
        basePrice: l.unitPrice,
        quantity: l.quantity,
        options: l.options,
        unitPrice: l.unitPrice,
      }),
    );
    notify("Added to cart", "Reordered your items");
    navigate("/app/cart");
  };

  return (
    <div>
      <AppHeader title="Orders" />

      {/* Cart resume banner */}
      {cart.length > 0 && (
        <div className="px-4 pt-3">
          <Card className="flex items-center gap-3 p-3" onClick={() => navigate("/app/cart")}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground text-sm font-bold tabular-nums">
              {cart.reduce((s, l) => s + l.quantity, 0)}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Continue your order</p>
              <p className="text-xs text-muted-foreground tabular-nums">{formatIDR(cartSubtotal)} in cart</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="flex rounded-full bg-secondary p-1">
          {(["active", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-full py-2 text-sm font-semibold capitalize transition-colors",
                tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {orders === null ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-10 w-10" strokeWidth={1.4} />}
            title={tab === "active" ? "No active orders" : "No past orders yet"}
            subtitle={tab === "active" ? "Place an order to skip the queue." : "Your completed orders will appear here."}
            action={<Button onClick={() => navigate("/app/menu")}>Browse menu</Button>}
          />
        ) : (
          list.map((o) => {
            const stepIdx = ORDER_STEPS.findIndex((s) => s.key === o.status);
            return (
              <Card key={o.id} className="p-4" onClick={() => navigate(`/app/orders/${o.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {new Date(o.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="font-serif-display text-base font-semibold text-foreground">{o.outletName}</p>
                  </div>
                  <Badge tone={statusTone[o.status]}>
                    {o.status === "cancelled" ? "Cancelled" : ORDER_STEPS[Math.max(0, stepIdx)]?.label}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                  {o.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ")}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground tabular-nums">{formatIDR(o.total)}</span>
                  {tab === "past" && (
                    <Button
                      variant="outline"
                      className="h-9 min-h-0 px-3 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorder(o);
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Reorder
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
