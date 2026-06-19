import { useNavigate } from "react-router";
import { ChevronLeft, Minus, Plus, Trash2, MapPin, ShoppingBag } from "lucide-react";
import { useAppStore } from "~/state/app-store";
import { formatIDR } from "~/lib/domain.types";
import { AppHeader } from "~/components/app/phone-shell";
import { Button, Card, EmptyState, StickyCTA } from "~/components/ui/primitives";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQty, removeLine, outlet, cartSubtotal } = useAppStore();

  const available = outlet?.isOpen && outlet?.pickupEnabled;

  return (
    <div>
      <AppHeader
        title="Your cart"
        left={
          <button onClick={() => navigate(-1)} className="-ml-1 text-foreground" aria-label="Back">
            <ChevronLeft className="h-6 w-6" />
          </button>
        }
      />

      {cart.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10" strokeWidth={1.4} />}
          title="Your cart is empty"
          subtitle="Add a dessert or drink to get started."
          action={<Button onClick={() => navigate("/app/menu")}>Browse menu</Button>}
        />
      ) : (
        <>
          <div className="px-4 py-4 space-y-3 pb-40">
            {/* Outlet */}
            <button
              onClick={() => navigate("/app/outlets")}
              className="flex w-full items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-left"
            >
              <MapPin className="h-5 w-5 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Pickup at</p>
                <p className="text-sm font-medium text-foreground truncate">{outlet?.mall ?? "Choose an outlet"}</p>
              </div>
              <span className="text-xs font-semibold text-accent">Change</span>
            </button>

            {!available && outlet && (
              <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
                This outlet is currently closed for pickup. Choose another to continue.
              </p>
            )}

            {/* Lines */}
            {cart.map((l) => (
              <Card key={l.lineId} className="p-3">
                <div className="flex gap-3">
                  <img src={l.imageUrl} alt={l.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground leading-tight">{l.name}</p>
                      <button onClick={() => removeLine(l.lineId)} aria-label="Remove" className="text-muted-foreground">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {l.options.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {l.options.map((o) => o.choiceLabel).join(" · ")}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQty(l.lineId, l.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0D4C2] text-foreground"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold tabular-nums">{l.quantity}</span>
                        <button
                          onClick={() => updateQty(l.lineId, l.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-foreground tabular-nums">
                        {formatIDR(l.unitPrice * l.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <button onClick={() => navigate("/app/menu")} className="w-full py-2 text-sm font-semibold text-accent">
              + Add more items
            </button>
          </div>

          <StickyCTA>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground tabular-nums">{formatIDR(cartSubtotal)}</span>
            </div>
            <Button full disabled={!available} onClick={() => navigate("/app/checkout")}>
              {available ? "Go to checkout" : "Outlet closed"}
            </Button>
          </StickyCTA>
        </>
      )}
    </div>
  );
}
