import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Ticket,
  Gift,
  Users,
  Copy,
  Check,
  LogOut,
  ChevronRight,
  Cake,
  Phone,
  Share2,
  Settings as SettingsIcon,
  Bell,
  Trash2,
} from "lucide-react";
import { htApi } from "~/lib/ht-api";
import { useMember } from "~/state/member-context";
import { useToast } from "~/state/toast";
import type { TierKey } from "~/lib/domain.types";
import { TIERS, nextTier } from "~/lib/domain.types";
import { AppHeader } from "~/components/app/phone-shell";
import { MembershipCard } from "~/components/app/membership-card";
import { Card, Skeleton, Button, Sheet } from "~/components/ui/primitives";

export default function Me() {
  const navigate = useNavigate();
  const { member, loading } = useMember();
  const { notify } = useToast();
  const [perksOpen, setPerksOpen] = useState(false);
  const [referOpen, setReferOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (member?.notificationPreferences) setPrefs(member.notificationPreferences);
  }, [member?.notificationPreferences]);

  const togglePref = async (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await htApi.updatePreferences({ [key]: next[key] });
    notify("Preferences updated", next[key] ? "You'll receive these notifications." : "These notifications are off.");
  };

  const deleteAccount = async () => {
    await htApi.requestDeletion("user requested");
    await htApi.logout();
    window.location.href = "/onboarding";
  };

  const copyCode = async () => {
    if (!member) return;
    try {
      await navigator.clipboard.writeText(member.referralCode);
    } catch {
      /* clipboard may be unavailable in preview */
    }
    setCopied(true);
    notify("Code copied", "Share it with a friend to earn rewards.");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = async () => {
    if (!member) return;
    const text = `Join me on Hong Tang! Use my code ${member.referralCode} for a welcome treat. 🍮`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Hong Tang", text });
        return;
      } catch {
        /* user cancelled */
      }
    }
    copyCode();
  };

  const logout = async () => {
    await htApi.logout();
    window.location.href = "/onboarding";
  };

  if (loading || !member) {
    return (
      <div>
        <AppHeader title="Me" />
        <div className="px-4 py-4 space-y-3">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const tierDef = TIERS.find((t) => t.key === (member.tier as TierKey)) ?? TIERS[0];
  const next = nextTier(member.tier as TierKey);

  return (
    <div className="pb-8">
      <AppHeader title="Me" />

      <div className="px-4 py-4 space-y-4">
        {/* Membership */}
        <MembershipCard name={member.name} tier={member.tier as TierKey} bowls={member.bowls} crystals={member.crystals} />

        <button
          onClick={() => setPerksOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-3 text-left"
        >
          <span className="text-sm font-medium text-foreground">View {tierDef.name} perks</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <LinkTile icon={<Ticket className="h-5 w-5" />} label="My Vouchers" sub={`${member.vouchers.filter((v) => !v.used && new Date(v.expiresAt) > new Date()).length} active`} onClick={() => navigate("/app/vouchers")} />
          <LinkTile icon={<Gift className="h-5 w-5" />} label="Rewards Store" sub={`${member.crystals.toLocaleString("id-ID")} Crystals`} onClick={() => navigate("/app/rewards")} />
        </div>

        {/* Referral */}
        <Card className="p-4" onClick={() => setReferOpen(true)}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Invite friends</p>
              <p className="text-xs text-muted-foreground">You both get a welcome voucher.</p>
            </div>
            <span className="rounded-lg bg-secondary px-2.5 py-1 font-mono text-xs font-bold text-foreground">
              {member.referralCode}
            </span>
          </div>
        </Card>

        {/* Profile facts */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{member.phone}</span>
          </div>
          <div className="h-px bg-[#EFE6D8]" />
          <div className="flex items-center gap-3">
            <Cake className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {member.birthday
                ? new Date(member.birthday).toLocaleDateString("id-ID", { day: "numeric", month: "long" })
                : "Add your birthday for a treat"}
            </span>
          </div>
          <div className="h-px bg-[#EFE6D8]" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm text-foreground">
              {new Date(member.joinedAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </span>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-4" onClick={() => setSettingsOpen(true)}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
              <SettingsIcon className="h-5 w-5 text-foreground" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Settings</p>
              <p className="text-xs text-muted-foreground">Notifications, privacy & account</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-accent"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>

      {/* Perks sheet */}
      <Sheet open={perksOpen} onClose={() => setPerksOpen(false)} title="Tier perks">
        <div className="px-5 pb-8 pt-3 space-y-4">
          {TIERS.map((t) => {
            const isCurrent = t.key === member.tier;
            return (
              <div
                key={t.key}
                className={isCurrent ? "rounded-2xl border-2 border-accent/40 bg-accent/5 p-4" : "rounded-2xl border border-[#EFE6D8] p-4"}
              >
                <div className="flex items-center justify-between">
                  <p className="font-serif-display text-base font-bold text-foreground">{t.name}</p>
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                    {t.maxBowls === null ? `${t.minBowls}+ Bowls` : `${t.minBowls}–${t.maxBowls} Bowls`} · {t.multiplier.toFixed(2)}×
                  </span>
                </div>
                {isCurrent && <p className="mt-0.5 text-xs font-semibold text-accent">Your current tier</p>}
                <ul className="mt-2 space-y-1.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {next && (
            <p className="text-center text-xs text-muted-foreground">
              {next.minBowls - member.bowls} more Bowls to reach {next.name}.
            </p>
          )}
        </div>
      </Sheet>

      {/* Settings sheet */}
      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings">
        <div className="px-5 pb-8 pt-3 space-y-5">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bell className="h-4 w-4 text-accent" /> Marketing notifications
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Order updates always arrive. These control promotional pushes only.
            </p>
            <div className="space-y-2">
              {[
                { key: "new_launches", label: "New launches" },
                { key: "promotions", label: "Promotions & offers" },
                { key: "loyalty_news", label: "Loyalty & rewards news" },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => togglePref(c.key)}
                  className="flex w-full items-center justify-between rounded-xl border border-[#EFE6D8] px-4 py-3"
                >
                  <span className="text-sm text-foreground">{c.label}</span>
                  <span
                    className={
                      prefs[c.key] !== false
                        ? "relative h-6 w-11 rounded-full bg-accent transition-colors"
                        : "relative h-6 w-11 rounded-full bg-[#D8CBB8] transition-colors"
                    }
                  >
                    <span
                      className={
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all " +
                        (prefs[c.key] !== false ? "left-[22px]" : "left-0.5")
                      }
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#EFE6D8]" />

          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Account</p>
            {member.deletionRequested ? (
              <p className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                Account deletion requested — our team will process it shortly.
              </p>
            ) : !confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center gap-2 rounded-xl border border-[#EFE6D8] px-4 py-3 text-sm font-medium text-accent"
              >
                <Trash2 className="h-4 w-4" /> Delete account
              </button>
            ) : (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <p className="text-sm font-semibold text-foreground">Delete your account?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This is permanent (UU PDP). Your data and rewards will be removed.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setConfirmDelete(false)}>Keep account</Button>
                  <Button onClick={deleteAccount}>Delete</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Sheet>

      {/* Referral sheet */}
      <Sheet open={referOpen} onClose={() => setReferOpen(false)} title="Invite & earn">
        <div className="px-5 pb-8 pt-3">
          <div className="rounded-2xl bg-secondary p-5 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15">
              <Users className="h-6 w-6 text-accent" />
            </span>
            <p className="mt-3 text-sm text-muted-foreground">Your referral code</p>
            <p className="mt-1 font-serif-display text-3xl font-bold tracking-wider text-foreground">{member.referralCode}</p>
          </div>

          <div className="mt-4 space-y-2.5 text-sm text-foreground">
            <Step n={1} text="Share your code with a friend." />
            <Step n={2} text="They enter it during sign-up." />
            <Step n={3} text="You both receive a welcome voucher." />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={copyCode}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy code"}
            </Button>
            <Button onClick={shareInvite}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function LinkTile({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col gap-2 rounded-2xl bg-card border border-[#EFE6D8] p-4 text-left shadow-[0_1px_3px_rgba(62,39,35,0.05)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{sub}</p>
      </div>
    </button>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground tabular-nums">
        {n}
      </span>
      <span>{text}</span>
    </div>
  );
}
