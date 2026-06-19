import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, Gift, Check, Lock } from "lucide-react";
import { htApi, type RewardDto } from "~/lib/ht-api";
import { useMember } from "~/state/member-context";
import { useToast } from "~/state/toast";
import { AppHeader } from "~/components/app/phone-shell";
import { Card, Skeleton, Button, Badge, Sheet, EmptyState } from "~/components/ui/primitives";
import { cn } from "~/lib/utils";

export default function Rewards() {
  const navigate = useNavigate();
  const { member, refresh } = useMember();
  const { notify } = useToast();
  const [rewards, setRewards] = useState<RewardDto[] | null>(null);
  const [selected, setSelected] = useState<RewardDto | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const idemRef = useRef<string>("");

  const loadRewards = () =>
    htApi.memberRewards().then((r) => setRewards(r.success && r.data ? r.data : []));

  useEffect(() => {
    loadRewards();
  }, [member?.crystals, member?.tier]);

  const crystals = member?.crystals ?? 0;

  const redeem = async () => {
    if (!selected) return;
    if (!idemRef.current) idemRef.current = crypto.randomUUID();
    setRedeeming(true);
    const res = await htApi.redeem(selected.id, idemRef.current);
    setRedeeming(false);
    if (res.success) {
      idemRef.current = "";
      setSelected(null);
      await refresh();
      await loadRewards();
      notify("Reward redeemed!", `${selected.title} is now in your vouchers.`);
      navigate("/app/vouchers");
    } else {
      idemRef.current = "";
      notify("Could not redeem", res.message ?? "Please try again");
    }
  };

  return (
    <div>
      <AppHeader title="Rewards Store" />

      {/* Crystal balance banner */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3.5 text-primary-foreground">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/90">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest opacity-70">Your balance</p>
              <p className="font-serif-display text-xl font-bold tabular-nums leading-tight">
                {crystals.toLocaleString("id-ID")} Crystals
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/app/vouchers")}
            className="rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold"
          >
            My Vouchers
          </button>
        </div>
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          Spending Crystals never lowers your tier — your Bowls keep your status.
        </p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {rewards === null ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : rewards.length === 0 ? (
          <EmptyState
            icon={<Gift className="h-10 w-10" strokeWidth={1.4} />}
            title="No rewards yet"
            subtitle="Check back soon for new ways to spend your Crystals."
          />
        ) : (
          rewards.map((r) => {
            const affordable = r.redeemable;
            return (
              <Card
                key={r.id}
                className={cn("flex gap-3 p-3", !affordable && "opacity-90")}
                onClick={() => setSelected(r)}
              >
                <img src={r.imageUrl} alt={r.title} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="muted">{r.type === "voucher" ? "Voucher" : "Merch"}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-foreground leading-tight">{r.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-sm font-bold tabular-nums",
                        affordable ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> {r.crystalCost.toLocaleString("id-ID")}
                    </span>
                    {!affordable && r.reason && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Lock className="h-3 w-3" /> {r.reason}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Redeem confirmation sheet */}
      <Sheet open={!!selected} onClose={() => setSelected(null)} title="Redeem reward">
        {selected && (
          <div className="px-5 pb-8 pt-3">
            <img src={selected.imageUrl} alt={selected.title} className="h-44 w-full rounded-2xl object-cover" />
            <p className="mt-4 font-serif-display text-lg font-bold text-foreground">{selected.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
              <span className="text-sm text-muted-foreground">Cost</span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-foreground tabular-nums">
                <Sparkles className="h-4 w-4 text-accent" /> {selected.crystalCost.toLocaleString("id-ID")} Crystals
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between px-4 text-xs">
              <span className="text-muted-foreground">Balance after</span>
              <span className="tabular-nums text-foreground">
                {(crystals - selected.crystalCost).toLocaleString("id-ID")} Crystals
              </span>
            </div>

            {selected.redeemable ? (
              <Button full className="mt-5" onClick={redeem} disabled={redeeming}>
                {redeeming ? "Redeeming…" : "Confirm redemption"}
              </Button>
            ) : (
              <div className="mt-5 rounded-xl bg-accent/10 px-4 py-3 text-center text-sm font-medium text-accent">
                {selected.reason ?? "Not available right now."}
              </div>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5" /> Redeemed rewards land in My Vouchers instantly.
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
