import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Minus, Plus, Heart, Check } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import { useAppStore } from "~/state/app-store";
import { useMember } from "~/state/member-context";
import { useToast } from "~/state/toast";
import type { MenuItem, OptionGroup, SelectedOption } from "~/lib/domain.types";
import { formatIDR } from "~/lib/domain.types";
import { Skeleton, StickyCTA, Button, Badge } from "~/components/ui/primitives";
import { cn } from "~/lib/utils";

export default function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useAppStore();
  const { member, refresh } = useMember();
  const { notify } = useToast();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!itemId) return;
    htApi.menu().then((r) => {
      const found = r.success && r.data ? r.data.find((m) => m.id === itemId) : null;
      if (!found) {
        setNotFound(true);
        return;
      }
      setItem(found);
      // Default single-select required groups to first choice
      const init: Record<string, string[]> = {};
      for (const g of found.optionGroups as OptionGroup[]) {
        if (g.type === "single" && g.required && g.choices[0]) init[g.id] = [g.choices[0].id];
        else init[g.id] = [];
      }
      setSelections(init);
    });
  }, [itemId]);

  const toggleChoice = (g: OptionGroup, choiceId: string) => {
    setSelections((prev) => {
      const cur = prev[g.id] ?? [];
      if (g.type === "single") return { ...prev, [g.id]: [choiceId] };
      // multi
      if (cur.includes(choiceId)) return { ...prev, [g.id]: cur.filter((c) => c !== choiceId) };
      if (cur.length >= g.max) return prev; // respect max
      return { ...prev, [g.id]: [...cur, choiceId] };
    });
  };

  const selectedOptions: SelectedOption[] = useMemo(() => {
    if (!item) return [];
    const out: SelectedOption[] = [];
    for (const g of item.optionGroups as OptionGroup[]) {
      for (const cid of selections[g.id] ?? []) {
        const choice = g.choices.find((c) => c.id === cid);
        if (choice)
          out.push({
            groupId: g.id,
            groupName: g.name,
            choiceId: choice.id,
            choiceLabel: choice.label,
            priceDelta: choice.priceDelta,
          });
      }
    }
    return out;
  }, [item, selections]);

  const unitPrice = (item?.basePrice ?? 0) + selectedOptions.reduce((s, o) => s + o.priceDelta, 0);

  const valid = useMemo(() => {
    if (!item) return false;
    for (const g of item.optionGroups as OptionGroup[]) {
      const count = (selections[g.id] ?? []).length;
      if (g.required && count < Math.max(1, g.min)) return false;
      if (count < g.min) return false;
    }
    return true;
  }, [item, selections]);

  const isFav = member?.favorites?.includes(itemId ?? "");

  const onAdd = () => {
    if (!item || !valid) return;
    addToCart({
      itemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      basePrice: item.basePrice,
      quantity: qty,
      options: selectedOptions,
      unitPrice,
    });
    notify("Added to cart", `${qty} × ${item.name}`);
    navigate(-1);
  };

  const onFav = async () => {
    if (!itemId) return;
    await htApi.toggleFavorite(itemId);
    refresh();
  };

  if (notFound) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground">This item isn't available.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/menu")}>Back to menu</Button>
      </div>
    );
  }

  if (!item) {
    return (
      <div>
        <Skeleton className="h-72 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="ht-fade-in">
      {/* Hero image */}
      <div className="relative h-72 w-full bg-secondary">
        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onFav}
          className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow"
          aria-label="Favorite"
        >
          <Heart className={cn("h-5 w-5", isFav ? "fill-accent text-accent" : "text-foreground")} />
        </button>
      </div>

      <div className="px-4 pt-4 pb-40">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif-display text-2xl font-bold text-foreground leading-tight">{item.name}</h1>
          <p className="font-serif-display text-xl font-bold text-foreground tabular-nums shrink-0">{formatIDR(item.basePrice)}</p>
        </div>
        {item.tags?.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            {item.tags.map((t) => (
              <Badge key={t} tone="muted">{t}</Badge>
            ))}
          </div>
        )}
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>

        {/* Option groups */}
        <div className="mt-5 space-y-5">
          {(item.optionGroups as OptionGroup[]).map((g) => {
            const cur = selections[g.id] ?? [];
            return (
              <div key={g.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{g.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {g.required ? "Required" : g.type === "multi" ? `Up to ${g.max}` : "Optional"}
                  </span>
                </div>
                <div className={cn("mt-2 gap-2", g.type === "multi" ? "grid grid-cols-1" : "flex flex-wrap")}>
                  {g.choices.map((c) => {
                    const on = cur.includes(c.id);
                    if (g.type === "single") {
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleChoice(g, c.id)}
                          className={cn(
                            "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                            on ? "border-accent bg-accent/5 text-foreground" : "border-[#E0D4C2] text-muted-foreground",
                          )}
                        >
                          {c.label}
                          {c.priceDelta > 0 && <span className="ml-1 tabular-nums">+{formatIDR(c.priceDelta)}</span>}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleChoice(g, c.id)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors min-h-[48px]",
                          on ? "border-accent bg-accent/5" : "border-[#E0D4C2]",
                        )}
                      >
                        <span className="flex items-center gap-2.5 text-foreground">
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-md border",
                              on ? "border-accent bg-accent" : "border-[#C9BCA8]",
                            )}
                          >
                            {on && <Check className="h-3.5 w-3.5 text-accent-foreground" />}
                          </span>
                          {c.label}
                        </span>
                        {c.priceDelta > 0 && (
                          <span className="text-muted-foreground tabular-nums">+{formatIDR(c.priceDelta)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quantity */}
        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Quantity</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E0D4C2] text-foreground disabled:opacity-40"
              disabled={qty <= 1}
              aria-label="Decrease"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-lg font-semibold text-foreground tabular-nums">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
              aria-label="Increase"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <StickyCTA>
        <Button full onClick={onAdd} disabled={!valid}>
          <span>Add to cart</span>
          <span className="tabular-nums">· {formatIDR(unitPrice * qty)}</span>
        </Button>
      </StickyCTA>
    </div>
  );
}
