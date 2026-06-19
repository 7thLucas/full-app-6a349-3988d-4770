import { useState } from "react";
import { useNavigate } from "react-router";
import { Ticket, ChevronLeft, Clock, Check } from "lucide-react";
import { useMember } from "~/state/member-context";
import type { Voucher } from "~/lib/domain.types";
import { formatIDR } from "~/lib/domain.types";
import { AppHeader } from "~/components/app/phone-shell";
import { Card, Skeleton, Badge, Button, EmptyState } from "~/components/ui/primitives";
import { cn } from "~/lib/utils";

const SOURCE_LABEL: Record<string, string> = {
  welcome: "Welcome",
  reward: "Reward",
  referral: "Referral",
  birthday: "Birthday",
  promo: "Promo",
};

function discountSummary(v: Voucher): string {
  if (v.discountType === "percent") return `${v.discountValue}% off`;
  if (v.discountType === "fixed") return `${formatIDR(v.discountValue)} off`;
  return "Buy 1 get 1";
}

function daysLeft(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export default function Vouchers() {
  const navigate = useNavigate();
  const { member, loading } = useMember();
  const [tab, setTab] = useState<"active" | "used">("active");

  const all = member?.vouchers ?? [];
  const now = Date.now();
  const active = all.filter((v) => !v.used && new Date(v.expiresAt).getTime() > now);
  const used = all.filter((v) => v.used || new Date(v.expiresAt).getTime() <= now);
  const list = tab === "active" ? active : used;

  return (
    <div>
      <AppHeader
        title="My Vouchers"
        left={
          <button onClick={() => navigate("/app")} className="-ml-1 text-foreground" aria-label="Back">
            <ChevronLeft className="h-6 w-6" />
          </button>
        }
      />

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="flex rounded-full bg-secondary p-1">
          {(["active", "used"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-full py-2 text-sm font-semibold capitalize transition-colors",
                tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {t === "used" ? "Used & expired" : "Active"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Ticket className="h-10 w-10" strokeWidth={1.4} />}
            title={tab === "active" ? "No active vouchers" : "Nothing here yet"}
            subtitle={
              tab === "active"
                ? "Redeem Crystals in the Rewards Store to earn vouchers."
                : "Vouchers you've used or that expired will show up here."
            }
            action={tab === "active" ? <Button onClick={() => navigate("/app/rewards")}>Browse rewards</Button> : undefined}
          />
        ) : (
          list.map((v) => {
            const expired = new Date(v.expiresAt).getTime() <= now;
            const dimmed = v.used || expired;
            const dl = daysLeft(v.expiresAt);
            const expiringSoon = !dimmed && dl <= 7;
            return (
              <Card
                key={v.id}
                className={cn(
                  "relative overflow-hidden p-0",
                  dimmed && "opacity-55",
                )}
              >
                {/* perforation accent */}
                <div className="flex">
                  <div
                    className={cn(
                      "flex w-16 shrink-0 flex-col items-center justify-center border-r border-dashed border-[#E0D4C2]",
                      dimmed ? "bg-secondary" : "bg-accent/8",
                    )}
                  >
                    <Ticket className={cn("h-6 w-6", dimmed ? "text-muted-foreground" : "text-accent")} />
                  </div>
                  <div className="flex-1 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground leading-tight">{v.title}</p>
                      <Badge tone="muted">{SOURCE_LABEL[v.source] ?? "Voucher"}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{v.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-semibold text-foreground">{discountSummary(v)}</span>
                      {v.minSpend > 0 && (
                        <span className="text-muted-foreground">Min {formatIDR(v.minSpend)}</span>
                      )}
                      <span className="font-mono text-[11px] text-muted-foreground">{v.code}</span>
                    </div>
                    <div className="mt-2">
                      {v.used ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <Check className="h-3 w-3" /> Used
                        </span>
                      ) : expired ? (
                        <span className="text-[11px] font-medium text-muted-foreground">Expired</span>
                      ) : expiringSoon ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                          <Clock className="h-3 w-3" /> {dl <= 0 ? "Expires today" : `Expires in ${dl} day${dl === 1 ? "" : "s"}`}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Valid until {new Date(v.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {tab === "active" && list.length > 0 && (
        <p className="px-5 pb-6 text-center text-xs text-muted-foreground">
          Apply a voucher at checkout — one per order, no stacking.
        </p>
      )}
    </div>
  );
}
