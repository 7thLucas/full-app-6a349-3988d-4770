import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, MapPin, Clock, Ticket, X, Check } from "lucide-react";
import { useAppStore } from "~/state/app-store";
import { useMember } from "~/state/member-context";
import { useToast } from "~/state/toast";
import { htApi } from "~/lib/ht-api";
import type { Voucher } from "~/lib/domain.types";
import { formatIDR } from "~/lib/domain.types";
import { AppHeader } from "~/components/app/phone-shell";
import { Button, Card, StickyCTA, Sheet, Badge } from "~/components/ui/primitives";
import { cn } from "~/lib/utils";

const PAYMENTS = ["QRIS", "GoPay", "OVO", "DANA", "ShopeePay", "Card"];
const TAX_RATE = 0.1;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, outlet, cartSubtotal, clearCart } = useAppStore();
  const { member, refresh } = useMember();
  const { notify } = useToast();

  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [payment, setPayment] = useState("QRIS");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (cart.length === 0) navigate("/app/menu", { replace: true });
  }, [cart.length, navigate]);

  const discount = useMemo(() => {
    if (!voucher || cartSubtotal < voucher.minSpend) return 0;
    if (voucher.discountType === "percent") return Math.round((cartSubtotal * voucher.discountValue) / 100);
    if (voucher.discountType === "fixed") return Math.min(voucher.discountValue, cartSubtotal);
    if (voucher.discountType === "bogo") return cart.length ? Math.min(...cart.map((l) => l.unitPrice)) : 0;
    return 0;
  }, [voucher, cartSubtotal, cart]);

  const netSpend = Math.max(0, cartSubtotal - discount);
  const tax = Math.round(netSpend * TAX_RATE);
  const total = netSpend + tax;

  const applyCode = async (code: string) => {
    setVoucherError("");
    const res = await htApi.validateVoucher(code, cart);
    if (res.success && res.data) {
      setVoucher(res.data); // applying a new discount REPLACES the prior one
      setSheetOpen(false);
      setPromoInput("");
      notify("Discount applied", res.data.title);
    } else {
      setVoucherError(res.message ?? "Code could not be applied");
    }
  };

  // Stable per attempt: a network retry of the same submit dedupes server-side
  // (no double charge); after a failure we rotate so the next try is fresh.
  const idemRef = useRef<string>("");

  const placeOrder = async () => {
    if (!outlet || placing) return;
    if (!idemRef.current) idemRef.current = crypto.randomUUID();
    setPlacing(true);
    const res = await htApi.checkout({
      outletId: outlet.id,
      lines: cart,
      voucherCode: voucher?.code ?? null,
      paymentMethod: payment,
      idempotencyKey: idemRef.current,
    });
    setPlacing(false);
    if (res.success && res.data) {
      idemRef.current = "";
      clearCart();
      refresh();
      navigate(`/app/order-received/${res.data.id}`, { replace: true });
    } else {
      idemRef.current = ""; // allow a fresh charge on the next attempt
      notify("Payment failed", res.message ?? "Please try again");
    }
  };

  const walletVouchers = (member?.vouchers ?? []).filter(
    (v) => !v.used && new Date(v.expiresAt) > new Date(),
  );

  return (
    <div>
      <AppHeader
        title="Checkout"
        left={
          <button onClick={() => navigate(-1)} className="-ml-1 text-foreground" aria-label="Back">
            <ChevronLeft className="h-6 w-6" />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 pb-52">
        {/* Pickup + ETA */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Self-pickup at</p>
              <p className="text-sm font-semibold text-foreground">{outlet?.mall}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
            <Clock className="h-4 w-4 text-foreground" />
            <p className="text-sm text-foreground">
              Estimated ready in <span className="font-semibold tabular-nums">~{outlet?.prepMinutes ?? 15} min</span> after payment
            </p>
          </div>
        </Card>

        {/* Items recap */}
        <Card className="p-4">
          <p className="text-sm font-semibold text-foreground mb-2">Order ({cart.reduce((s, l) => s + l.quantity, 0)} items)</p>
          <div className="space-y-2.5">
            {cart.map((l) => (
              <div key={l.lineId} className="flex justify-between gap-3 text-sm">
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
        </Card>

        {/* Voucher / promo */}
        <Card className="p-4">
          <button onClick={() => setSheetOpen(true)} className="flex w-full items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
              <Ticket className="h-4.5 w-4.5 text-accent" />
            </span>
            <div className="flex-1 text-left">
              {voucher ? (
                <>
                  <p className="text-sm font-semibold text-foreground">{voucher.title}</p>
                  <p className="text-xs text-[#2E7D32]">Applied · −{formatIDR(discount)}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-foreground">Add voucher or promo code</p>
                  <p className="text-xs text-muted-foreground">One per order — no stacking</p>
                </>
              )}
            </div>
            {voucher ? (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVoucher(null);
                }}
                className="text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </span>
            ) : (
              <span className="text-sm font-semibold text-accent">Apply</span>
            )}
          </button>
        </Card>

        {/* Payment */}
        <Card className="p-4">
          <p className="text-sm font-semibold text-foreground mb-2.5">Payment method</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENTS.map((p) => (
              <button
                key={p}
                onClick={() => setPayment(p)}
                className={cn(
                  "rounded-xl border py-3 text-sm font-medium transition-colors",
                  payment === p ? "border-accent bg-accent/5 text-foreground" : "border-[#E0D4C2] text-muted-foreground",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-muted-foreground">Payment is simulated in this preview — no real charge.</p>
        </Card>

        {/* Totals */}
        <Card className="p-4 space-y-2 text-sm">
          <Row label="Subtotal" value={formatIDR(cartSubtotal)} />
          {discount > 0 && <Row label="Discount" value={`−${formatIDR(discount)}`} accent />}
          <Row label="Tax (PB1 10%)" value={formatIDR(tax)} muted />
          <div className="h-px bg-[#EFE6D8] my-1" />
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-serif-display text-lg font-bold text-foreground tabular-nums">{formatIDR(total)}</span>
          </div>
        </Card>
      </div>

      <StickyCTA>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold text-foreground tabular-nums">{formatIDR(total)}</span>
        </div>
        <Button full onClick={placeOrder} disabled={placing}>
          {placing ? "Processing payment…" : `Pay with ${payment}`}
        </Button>
      </StickyCTA>

      {/* Voucher sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Vouchers & promo codes">
        <div className="px-5 pb-8 pt-2">
          <div className="flex gap-2">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="flex-1 rounded-xl border border-[#E0D4C2] bg-white px-3.5 py-3 text-sm uppercase text-foreground outline-none focus:border-accent"
            />
            <Button onClick={() => applyCode(promoInput)} disabled={!promoInput.trim()}>
              Apply
            </Button>
          </div>
          {voucherError && <p className="mt-2 text-sm font-medium text-accent">{voucherError}</p>}
          <p className="mt-2 text-xs text-muted-foreground">Try <span className="font-semibold">TANG10</span> or <span className="font-semibold">PEARLFREE</span></p>

          <p className="mt-5 mb-2 text-sm font-semibold text-foreground">Your vouchers</p>
          {walletVouchers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active vouchers yet.</p>
          ) : (
            <div className="space-y-2">
              {walletVouchers.map((v) => {
                const eligible = cartSubtotal >= v.minSpend;
                return (
                  <button
                    key={v.id}
                    onClick={() => eligible && applyCode(v.code)}
                    disabled={!eligible}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                      eligible ? "border-[#E0D4C2]" : "border-[#EFE6D8] opacity-60",
                    )}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                      <Ticket className="h-4.5 w-4.5 text-accent" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{v.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Min spend {formatIDR(v.minSpend)}
                        {!eligible && " — add more to use"}
                      </p>
                    </div>
                    {voucher?.code === v.code && <Check className="h-5 w-5 text-accent" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Sheet>
    </div>
  );
}

function Row({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={cn(muted ? "text-muted-foreground" : "text-foreground")}>{label}</span>
      <span className={cn("tabular-nums", accent ? "text-[#2E7D32] font-medium" : muted ? "text-muted-foreground" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}
