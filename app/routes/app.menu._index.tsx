import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { MapPin, Search } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import { useAppStore } from "~/state/app-store";
import type { MenuItem } from "~/lib/domain.types";
import { CATEGORIES, formatIDR } from "~/lib/domain.types";
import type { CategoryDef } from "~/lib/domain.types";
import { AppHeader } from "~/components/app/phone-shell";
import { Skeleton, Badge, Pill, EmptyState, Button } from "~/components/ui/primitives";
import { cn } from "~/lib/utils";

export default function MenuList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { outlet } = useAppStore();
  const [menu, setMenu] = useState<MenuItem[] | null>(null);
  const [categories, setCategories] = useState<CategoryDef[]>(CATEGORIES);
  const [query, setQuery] = useState("");
  const activeCat = params.get("cat") ?? "all";

  useEffect(() => {
    htApi.menu(outlet?.id).then((r) => setMenu(r.success && r.data ? r.data : []));
  }, [outlet?.id]);

  // Category order is admin-managed (Sprint 13) — drives the pill bar order.
  useEffect(() => {
    htApi.categories().then((r) => {
      if (r.success && r.data?.length) setCategories(r.data as CategoryDef[]);
    });
  }, []);

  // Sold-out resolved from the server's per-outlet flag, with the cached outlet
  // matrix as a fallback before the menu refetch lands.
  const soldOut = useMemo(() => {
    const set = new Set(outlet?.soldOutItemIds ?? []);
    for (const m of menu ?? []) if (m.soldOut) set.add(m.id);
    return set;
  }, [outlet, menu]);

  const filtered = useMemo(() => {
    let list = menu ?? [];
    if (activeCat !== "all") list = list.filter((m) => m.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return list;
  }, [menu, activeCat, query]);

  const setCat = (c: string) => {
    const next = new URLSearchParams(params);
    if (c === "all") next.delete("cat");
    else next.set("cat", c);
    setParams(next, { replace: true });
  };

  return (
    <div>
      <AppHeader
        title="Menu"
        right={
          <button
            onClick={() => navigate("/app/outlets")}
            className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-xs text-foreground max-w-[140px]"
          >
            <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="truncate">{outlet?.mall ?? "Choose outlet"}</span>
          </button>
        }
      />

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="flex items-center rounded-full border border-[#E0D4C2] bg-white px-3.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search desserts & drinks"
            className="flex-1 bg-transparent px-2 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="sticky top-14 z-20 bg-background/90 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          <Pill active={activeCat === "all"} onClick={() => setCat("all")}>
            All
          </Pill>
          {categories.map((c) => (
            <Pill key={c.key} active={activeCat === c.key} onClick={() => setCat(c.key)}>
              {c.name}
            </Pill>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 py-2">
        {menu === null ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-1 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            subtitle="Try another category or clear your search."
            action={
              <Button variant="outline" onClick={() => { setQuery(""); setCat("all"); }}>
                Reset
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((m) => {
              const out = soldOut.has(m.id) || !m.available;
              return (
                <button
                  key={m.id}
                  onClick={() => !out && navigate(`/app/menu/${m.id}`)}
                  className={cn("text-left", out ? "opacity-60" : "ht-press")}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      loading="lazy"
                      onLoad={(e) => e.currentTarget.classList.add("ht-img-in")}
                      className="h-full w-full object-cover"
                    />
                    {m.tags?.[0] && !out && (
                      <span className="absolute left-2 top-2">
                        <Badge tone="accent">{m.tags[0]}</Badge>
                      </span>
                    )}
                    {out && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Badge tone="muted">Sold out</Badge>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium leading-tight text-foreground line-clamp-2">{m.name}</p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">{formatIDR(m.basePrice)}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="h-4" />
    </div>
  );
}
