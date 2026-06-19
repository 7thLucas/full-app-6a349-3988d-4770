import { cn } from "~/lib/utils";
import type { ReactNode, ButtonHTMLAttributes } from "react";

// ── Button ────────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  full?: boolean;
}
export function Button({ variant = "primary", full, className, children, ...rest }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 min-h-[48px] text-[15px] font-semibold transition-all duration-200 active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-accent text-accent-foreground shadow-sm hover:brightness-105",
    secondary: "bg-primary text-primary-foreground hover:brightness-110",
    outline: "border border-[#E0D4C2] bg-white text-foreground hover:bg-secondary",
    ghost: "text-foreground hover:bg-secondary",
  };
  return (
    <button className={cn(base, variants[variant], full && "w-full", className)} {...rest}>
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl bg-card border border-[#EFE6D8] shadow-[0_1px_3px_rgba(62,39,35,0.05)]",
        onClick && "ht-press cursor-pointer transition-shadow hover:shadow-[0_4px_16px_rgba(62,39,35,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Pill / Chip ─────────────────────────────────────────────────────────────
export function Pill({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "ht-press whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[40px]",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "muted" }) {
  const tones = {
    neutral: "bg-primary/10 text-primary",
    accent: "bg-accent text-accent-foreground",
    muted: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("ht-skeleton rounded-lg", className)} />;
}

// ── Section heading ──────────────────────────────────────────────────────────
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <h2 className="font-serif-display text-xl font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  );
}

// ── Empty / Error states ────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }: { icon?: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-8">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <p className="font-serif-display text-lg text-foreground">{title}</p>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Bottom sheet (spring modal) ────────────────────────────────────────────
export function Sheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="ht-overlay-in absolute inset-0 bg-[#3E2723]/40"
      />
      <div className="ht-sheet-up relative w-full max-w-md bg-background rounded-t-[28px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-background pt-3 pb-2 z-10">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-[#E0D4C2]" />
          {title && <h3 className="px-5 pt-3 font-serif-display text-xl font-semibold text-foreground">{title}</h3>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Sticky bottom CTA bar ──────────────────────────────────────────────────
export function StickyCTA({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-md pointer-events-auto bg-background/95 backdrop-blur border-t border-[#EFE6D8] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}
