import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { MetaFunction } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication/use-authentication";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => [
  { title: "Hong Tang — Oriental Dessert Culture, Now in Your Pocket" },
  {
    name: "description",
    content:
      "Hong Tang (红糖) — Indonesia's pioneer oriental dessert brand since 2012.",
  },
];

const MIN_SPLASH_MS = 1100;
const EXIT_MS = 400;

export default function Splash() {
  const { config } = useConfigurables();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const appName = config?.appName || "Hong Tang";
  const tagline =
    config?.tagline || "Oriental Dessert Culture, Now in Your Pocket";
  const logoUrl = config?.logoUrl;

  const [minDone, setMinDone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const navigated = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading || !minDone || navigated.current) return;
    navigated.current = true;
    setLeaving(true);
    const t = setTimeout(() => {
      navigate(isAuthenticated ? "/app" : "/onboarding", { replace: true });
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [loading, minDone, isAuthenticated, navigate]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-[#EDE3D4] select-none">
      <div
        className={cn(
          "relative w-full max-w-md bg-primary overflow-hidden flex flex-col items-center justify-center",
          leaving && "ht-splash-out",
        )}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#C62828]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-black/15 blur-3xl" />

        {/* logo + pulsing rings */}
        <div className="relative flex flex-col items-center px-8 text-center">
          <div className="relative flex items-center justify-center">
            <span className="ht-ring absolute h-24 w-24 rounded-full border border-[#E9C9A3]/40" />
            <span
              className="ht-ring absolute h-24 w-24 rounded-full border border-[#E9C9A3]/40"
              style={{ animationDelay: "0.9s" }}
            />
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${appName} logo`}
                className="ht-pop relative h-24 w-24 rounded-full object-cover ring-2 ring-white/30 shadow-2xl"
              />
            ) : (
              <span className="ht-pop relative flex h-24 w-24 items-center justify-center rounded-full bg-[#C62828] font-serif-display text-5xl font-semibold text-white shadow-2xl">
                红
              </span>
            )}
          </div>

          <h1
            className="ht-rise mt-7 font-serif-display text-3xl font-bold text-primary-foreground"
            style={{ animationDelay: "0.35s" }}
          >
            {appName}
          </h1>
          <p
            className="ht-rise mt-2 max-w-[16rem] text-sm leading-relaxed text-primary-foreground/70"
            style={{ animationDelay: "0.5s" }}
          >
            {tagline}
          </p>
        </div>

        {/* loader dots */}
        <div className="absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="ht-bounce h-2 w-2 rounded-full bg-primary-foreground/60"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
