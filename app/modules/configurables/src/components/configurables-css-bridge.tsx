import { useEffect } from "react";
import { useConfigurables } from "../hooks/use-configurables";

/**
 * ConfigurablesCSSBridge — Syncs brandColor from configurables into CSS custom
 * properties so Tailwind utilities (bg-primary, text-accent, etc.) reflect the
 * DB-driven config in real time.
 *
 * How it works:
 *   1. Tailwind config maps e.g. `primary` → `var(--primary)`.
 *   2. tailwind.css defines the default `--primary` value.
 *   3. This component overrides those CSS vars at runtime on <html>,
 *      so every Tailwind utility referencing var(--primary) updates instantly.
 *   4. When the portal sends a QB_MIDDLE_EDITOR_UPDATE with new colors,
 *      useConfigurables() re-renders → this effect re-runs → CSS vars update.
 *
 * Mount this INSIDE <ConfigurablesProvider>, but outside <ThemeProvider> so it
 * applies before any themed children paint.
 */
export function ConfigurablesCSSBridge() {
  const { config } = useConfigurables();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const brandColor = config?.brandColor;
    if (!brandColor || typeof brandColor !== "object") return;

    const root = document.documentElement;

    // Only set if the value looks like a real color (not a FILL_X_HERE placeholder)
    const isValidColor = (v: unknown): v is string =>
      typeof v === "string" && v.length > 0 && !v.startsWith("FILL_");

    // ── Primary (deep brown-sugar, used for text/structure) ────────────────
    if (isValidColor(brandColor.primary)) {
      root.style.setProperty("--primary", brandColor.primary);
      root.style.setProperty("--foreground", brandColor.primary);
      root.style.setProperty("--card-foreground", brandColor.primary);
      root.style.setProperty("--popover-foreground", brandColor.primary);
      root.style.setProperty("--secondary-foreground", brandColor.primary);
      root.style.setProperty("--sidebar-primary", brandColor.primary);
    }

    // ── Secondary (warm grey, used for meta text) ──────────────────────────
    if (isValidColor(brandColor.secondary)) {
      root.style.setProperty("--muted-foreground", brandColor.secondary);
    }

    // ── Accent (Hong Tang Red — the single CTA / alert color) ──────────────
    if (isValidColor(brandColor.accent)) {
      root.style.setProperty("--accent", brandColor.accent);
      root.style.setProperty("--destructive", brandColor.accent);
      root.style.setProperty("--ring", brandColor.accent);
      root.style.setProperty("--sidebar-accent", brandColor.accent);
    }

    // ── Background (textured cream) ────────────────────────────────────────
    const bg = (config as Record<string, unknown> | undefined)?.backgroundColor;
    if (isValidColor(bg)) {
      root.style.setProperty("--background", bg);
    }
  }, [config?.brandColor, (config as Record<string, unknown> | undefined)?.backgroundColor]);

  return null; // renderless component
}
