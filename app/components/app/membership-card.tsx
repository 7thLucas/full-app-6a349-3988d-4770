import { TIERS, nextTier, tierForBowls } from "~/lib/domain.types";
import type { TierKey } from "~/lib/domain.types";
import { cn } from "~/lib/utils";
import { Sparkles } from "lucide-react";

const themeClass: Record<string, string> = {
  bronze: "tier-bronze",
  silver: "tier-silver",
  gold: "tier-gold",
  platinum: "tier-platinum",
};

export function MembershipCard({
  name,
  tier,
  bowls,
  crystals,
}: {
  name: string;
  tier: TierKey;
  bowls: number;
  crystals: number;
}) {
  const def = TIERS.find((t) => t.key === tier) ?? tierForBowls(bowls);
  const next = nextTier(tier);
  const progress = next
    ? Math.min(100, Math.round(((bowls - def.minBowls) / (next.minBowls - def.minBowls)) * 100))
    : 100;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5 text-[#2A1A14] shadow-md", themeClass[def.theme])}>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">Loyal-Tang Member</p>
            <p className="font-serif-display text-2xl font-bold leading-tight">{def.name}</p>
          </div>
          <span className="rounded-full bg-white/30 px-3 py-1 text-xs font-bold">{def.multiplier.toFixed(2)}×</span>
        </div>

        <p className="mt-3 text-sm font-medium opacity-90">{name}</p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span className="font-serif-display text-2xl font-bold tabular-nums">{crystals.toLocaleString("id-ID")}</span>
            </div>
            <p className="text-[11px] font-medium opacity-70">Sugar Crystals</p>
          </div>
          <div className="text-right">
            <span className="font-serif-display text-2xl font-bold tabular-nums">{bowls}</span>
            <p className="text-[11px] font-medium opacity-70">Bowls</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/40">
            <div className="h-full rounded-full bg-[#2A1A14]/70 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] font-medium opacity-80">
            {next
              ? `${next.minBowls - bowls} more Bowls to ${next.name}`
              : "Top tier reached — Tang Master"}
          </p>
        </div>
      </div>
    </div>
  );
}
