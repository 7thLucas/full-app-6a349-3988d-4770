import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, MapPin, Clock, Navigation, Check } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import { useAppStore } from "~/state/app-store";
import type { Outlet } from "~/lib/domain.types";
import { AppHeader } from "~/components/app/phone-shell";
import { Card, Skeleton, Badge, Button } from "~/components/ui/primitives";
import { cn } from "~/lib/utils";

export default function Outlets() {
  const navigate = useNavigate();
  const { outlet, setOutlet } = useAppStore();
  const [outlets, setOutlets] = useState<Outlet[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    htApi.outlets().then((r) => {
      if (r.success && r.data) setOutlets(r.data);
      else setError(true);
    });
  }, []);

  const choose = (o: Outlet) => {
    setOutlet(o);
    navigate(-1);
  };

  return (
    <div>
      <AppHeader
        title="Choose your outlet"
        left={
          <button onClick={() => navigate(-1)} className="-ml-1 text-foreground" aria-label="Back">
            <ChevronLeft className="h-6 w-6" />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          Pick the outlet nearest you. Menu and prep times are set per outlet.
        </p>

        {outlets === null && !error &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}

        {error && (
          <Card className="p-5 text-center">
            <p className="text-sm text-foreground">We couldn't load outlets.</p>
            <Button variant="outline" className="mt-3" onClick={() => location.reload()}>
              Try again
            </Button>
          </Card>
        )}

        {outlets?.map((o) => {
          const selected = outlet?.id === o.id;
          const available = o.acceptingOrders ?? (o.isOpen && o.pickupEnabled);
          return (
            <Card
              key={o.id}
              className={cn("p-4", selected && "ring-2 ring-accent")}
              onClick={() => available && choose(o)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-serif-display text-lg font-semibold text-foreground truncate">{o.mall}</p>
                    {selected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                        <Check className="h-3 w-3 text-accent-foreground" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{o.address}</p>
                </div>
                {available ? (
                  <Badge tone="neutral">{o.distanceKm.toFixed(1)} km</Badge>
                ) : (
                  <Badge tone="muted">Closed</Badge>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {o.openTime}–{o.closeTime}
                </span>
                <span className="flex items-center gap-1">
                  Prep ~{o.prepMinutes} min
                </span>
                <span className={cn("flex items-center gap-1 font-medium", available ? "text-[#2E7D32]" : "text-accent")}>
                  <span className={cn("h-2 w-2 rounded-full", available ? "bg-[#2E7D32]" : "bg-accent")} />
                  {available ? "Open for pickup" : "Not accepting pickup"}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  variant={selected ? "secondary" : "primary"}
                  className="flex-1"
                  disabled={!available}
                  onClick={(e) => {
                    e.stopPropagation();
                    choose(o);
                  }}
                >
                  {selected ? "Selected" : available ? "Order from here" : "Closed"}
                </Button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${o.lat},${o.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center rounded-xl border border-[#E0D4C2] px-4 text-foreground"
                  aria-label="Directions"
                >
                  <Navigation className="h-5 w-5" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
