import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { MapPin, ChevronRight, Sparkles, Ticket } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { useMember } from "~/state/member-context";
import { useAppStore } from "~/state/app-store";
import { htApi } from "~/lib/ht-api";
import type { MenuItem } from "~/lib/domain.types";
import { CATEGORIES, formatIDR } from "~/lib/domain.types";
import { Card, Skeleton, Badge, Pill } from "~/components/ui/primitives";
import { MembershipCard } from "~/components/app/membership-card";
import { cn } from "~/lib/utils";

export default function Home() {
  const { config } = useConfigurables();
  const { member } = useMember();
  const { outlet, setOutlet } = useAppStore();
  const navigate = useNavigate();

  const [menu, setMenu] = useState<MenuItem[] | null>(null);
  const [bannerIdx, setBannerIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    htApi.menu().then((r) => setMenu(r.success && r.data ? r.data : []));
    // Auto-select nearest outlet if none chosen yet
    if (!outlet) {
      htApi.outlets().then((r) => {
        if (r.success && r.data?.length) setOutlet(r.data[0]);
      });
    }
  }, []);

  const banners = config?.heroBanners ?? [];

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const signatures = (menu ?? []).filter((m) => m.isSignature);
  const warm = (menu ?? []).filter((m) => m.category === "warm-desserts");

  return (
    <div className="ht-fade-in">
      {/* Top bar: greeting + outlet */}
      <div className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Welcome back</p>
            <p className="font-serif-display text-xl font-semibold text-foreground">
              {member?.name?.split(" ")[0] ?? "there"}
            </p>
          </div>
          <button
            onClick={() => navigate("/app/outlets")}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-sm max-w-[55%]"
          >
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            <span className="truncate text-foreground">{outlet ? outlet.mall : "Choose outlet"}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Hero carousel */}
      <div className="px-4">
        {banners.length === 0 ? (
          <Skeleton className="h-44 w-full rounded-2xl" />
        ) : (
          <>
            <div ref={carouselRef} className="relative h-44 overflow-hidden rounded-2xl">
              {banners.map((b, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700",
                    i === bannerIdx ? "opacity-100" : "opacity-0 pointer-events-none",
                  )}
                >
                  {b.imageUrl && <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif-display text-lg font-bold text-primary-foreground leading-tight">{b.title}</h3>
                    {b.subtitle && <p className="text-xs text-primary-foreground/85 mt-0.5">{b.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <div className="mt-2 flex justify-center gap-1.5">
                {banners.map((_, i) => (
                  <span
                    key={i}
                    className={cn("h-1.5 rounded-full transition-all", i === bannerIdx ? "w-5 bg-accent" : "w-1.5 bg-[#D8CBB8]")}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Membership snapshot */}
      <div className="px-4 mt-5">
        {member ? (
          <button onClick={() => navigate("/app/me")} className="block w-full text-left">
            <MembershipCard name={member.name} tier={member.tier} bowls={member.bowls} crystals={member.crystals} />
          </button>
        ) : (
          <Skeleton className="h-40 w-full rounded-2xl" />
        )}
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <Card className="p-3.5 flex items-center gap-3" onClick={() => navigate("/app/vouchers")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Ticket className="h-5 w-5 text-accent" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">My Vouchers</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {member ? `${member.vouchers.filter((v) => !v.used && new Date(v.expiresAt) > new Date()).length} active` : "—"}
            </p>
          </div>
        </Card>
        <Card className="p-3.5 flex items-center gap-3" onClick={() => navigate("/app/rewards")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Sparkles className="h-5 w-5 text-accent" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Rewards Store</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {member ? `${member.crystals.toLocaleString("id-ID")} Crystals` : "—"}
            </p>
          </div>
        </Card>
      </div>

      {/* Category quick chips */}
      <div className="mt-6">
        <div className="px-4 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <Pill key={c.key} onClick={() => navigate(`/app/menu?cat=${c.key}`)}>
              {c.name}
            </Pill>
          ))}
        </div>
      </div>

      {/* Signatures row */}
      <PromoRow
        title={config?.promoRows?.[0]?.heading ?? "Signatures"}
        subtitle={config?.promoRows?.[0]?.subtext}
        items={signatures}
        loading={menu === null}
        onSeeAll={() => navigate("/app/menu?cat=signatures")}
        onItem={(id) => navigate(`/app/menu/${id}`)}
      />

      {/* Warm row */}
      <PromoRow
        title={config?.promoRows?.[1]?.heading ?? "Warm & Comforting"}
        subtitle={config?.promoRows?.[1]?.subtext}
        items={warm}
        loading={menu === null}
        onSeeAll={() => navigate("/app/menu?cat=warm-desserts")}
        onItem={(id) => navigate(`/app/menu/${id}`)}
      />

      <div className="h-6" />
    </div>
  );
}

function PromoRow({
  title,
  subtitle,
  items,
  loading,
  onSeeAll,
  onItem,
}: {
  title: string;
  subtitle?: string;
  items: MenuItem[];
  loading: boolean;
  onSeeAll: () => void;
  onItem: (id: string) => void;
}) {
  return (
    <div className="mt-6">
      <div className="px-4 flex items-end justify-between">
        <div>
          <h2 className="font-serif-display text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <button onClick={onSeeAll} className="text-xs font-semibold text-accent">See all</button>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-36 shrink-0">
                <Skeleton className="h-36 w-36 rounded-2xl" />
                <Skeleton className="mt-2 h-4 w-28" />
                <Skeleton className="mt-1 h-3 w-16" />
              </div>
            ))
          : items.map((m) => (
              <button key={m.id} onClick={() => onItem(m.id)} className="w-36 shrink-0 text-left">
                <div className="relative h-36 w-36 overflow-hidden rounded-2xl bg-secondary">
                  <img src={m.imageUrl} alt={m.name} className="h-full w-full object-cover" />
                  {m.tags?.[0] && (
                    <span className="absolute left-2 top-2">
                      <Badge tone="accent">{m.tags[0]}</Badge>
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium leading-tight text-foreground line-clamp-2">{m.name}</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">{formatIDR(m.basePrice)}</p>
              </button>
            ))}
      </div>
    </div>
  );
}
