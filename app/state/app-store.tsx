import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { CartLine, Outlet, SelectedOption } from "~/lib/domain.types";

const OUTLET_KEY = "ht_outlet";
const CART_KEY = "ht_cart";

interface AppStore {
  outlet: Outlet | null;
  setOutlet: (o: Outlet | null) => void;
  cart: CartLine[];
  addToCart: (line: Omit<CartLine, "lineId">) => void;
  updateQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
}

const Ctx = createContext<AppStore | null>(null);

function lineSignature(itemId: string, options: SelectedOption[]) {
  return itemId + "|" + options.map((o) => `${o.groupId}:${o.choiceId}`).sort().join(",");
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [outlet, setOutletState] = useState<Outlet | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const o = localStorage.getItem(OUTLET_KEY);
      if (o) setOutletState(JSON.parse(o));
      const c = localStorage.getItem(CART_KEY);
      if (c) setCart(JSON.parse(c));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, hydrated]);

  const setOutlet = useCallback((o: Outlet | null) => {
    setOutletState(o);
    try {
      if (o) localStorage.setItem(OUTLET_KEY, JSON.stringify(o));
      else localStorage.removeItem(OUTLET_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const addToCart = useCallback((line: Omit<CartLine, "lineId">) => {
    setCart((prev) => {
      const sig = lineSignature(line.itemId, line.options);
      const existing = prev.find((l) => lineSignature(l.itemId, l.options) === sig);
      if (existing) {
        return prev.map((l) =>
          l.lineId === existing.lineId ? { ...l, quantity: l.quantity + line.quantity } : l,
        );
      }
      return [...prev, { ...line, lineId: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }];
    });
  }, []);

  const updateQty = useCallback((lineId: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.lineId === lineId ? { ...l, quantity: Math.max(0, qty) } : l))
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setCart((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, l) => s + l.quantity, 0);
  const cartSubtotal = cart.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  return (
    <Ctx.Provider
      value={{ outlet, setOutlet, cart, addToCart, updateQty, removeLine, clearCart, cartCount, cartSubtotal }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAppStore(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
