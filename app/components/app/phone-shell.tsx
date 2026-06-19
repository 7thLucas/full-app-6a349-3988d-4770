import { NavLink, useLocation } from "react-router";
import { Home, UtensilsCrossed, Gift, Receipt, User } from "lucide-react";
import { cn } from "~/lib/utils";
import { useAppStore } from "~/state/app-store";
import type { ReactNode } from "react";

const TABS = [
  { to: "/app", label: "Home", icon: Home, end: true },
  { to: "/app/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/app/rewards", label: "Rewards", icon: Gift },
  { to: "/app/orders", label: "Orders", icon: Receipt },
  { to: "/app/me", label: "Me", icon: User },
];

export function BottomNav() {
  const { cartCount } = useAppStore();
  const location = useLocation();
  // Hide nav on full-screen flows
  const hidden = /\/app\/(cart|checkout|menu\/[^/]+|orders\/[^/]+|outlets)/.test(location.pathname);
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-md pointer-events-auto bg-background/95 backdrop-blur border-t border-[#EFE6D8] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
        <div className="flex items-stretch justify-around">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  cn(
                    "ht-press relative flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors min-h-[52px]",
                    isActive ? "text-accent" : "text-muted-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative">
                      <Icon
                        className={cn(
                          "h-[22px] w-[22px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          isActive && "-translate-y-0.5 scale-110",
                        )}
                        strokeWidth={isActive ? 2.4 : 1.8}
                      />
                      {t.label === "Orders" && cartCount > 0 && (
                        <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground tabular-nums">
                          {cartCount}
                        </span>
                      )}
                    </span>
                    <span className="text-[10.5px] font-medium">{t.label}</span>
                    <span
                      className={cn(
                        "absolute bottom-0.5 h-1 w-1 rounded-full bg-accent transition-all duration-300",
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-0",
                      )}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function AppHeader({
  title,
  left,
  right,
  serif = true,
}: {
  title: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  serif?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-[#EFE6D8]">
      <div className="flex items-center gap-3 px-4 h-14">
        {left}
        <h1 className={cn("flex-1 truncate text-lg text-foreground", serif ? "font-serif-display font-semibold" : "font-semibold")}>
          {title}
        </h1>
        {right}
      </div>
    </header>
  );
}
