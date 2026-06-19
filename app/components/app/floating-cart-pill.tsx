import { useNavigate } from "react-router";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { useAppStore } from "~/state/app-store";
import { formatIDR } from "~/lib/domain.types";

export function FloatingCartPill() {
  const navigate = useNavigate();
  const { cart, cartCount, cartSubtotal } = useAppStore();
  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-[5.25rem] inset-x-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-md px-4 pointer-events-auto">
        <button
          onClick={() => navigate("/app/cart")}
          className="flex w-full items-center gap-3 rounded-2xl bg-[#3E2723] px-4 py-3 text-left text-white shadow-[0_16px_36px_rgba(62,39,35,0.28)] active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">
              {cartCount} item{cartCount === 1 ? "" : "s"} in cart
            </span>
            <span className="block truncate text-xs text-white/72">{cart[cart.length - 1]?.name ?? "Ready for checkout"}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm font-bold tabular-nums">
            {formatIDR(cartSubtotal)}
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
