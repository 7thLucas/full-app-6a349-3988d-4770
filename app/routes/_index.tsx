import { useConfigurables } from "~/modules/configurables";
import { Button } from "~/components/ui/button";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Hong Tang — Oriental Dessert Culture, Now in Your Pocket" },
  {
    name: "description",
    content:
      "Hong Tang (红糖) — Indonesia's pioneer oriental dessert brand since 2012. Taiwanese-style cold desserts and Hong Kong-style warm desserts across premium malls nationwide.",
  },
];

const IMG = (prompt: string) =>
  `https://api.qb-deck.quantumbyte.ai/common/image-generation?prompt=${encodeURIComponent(
    prompt,
  )}`;

type Dessert = {
  name: string;
  origin: string;
  note: string;
  imageUrl: string;
};

const FEATURED: Dessert[] = [
  {
    name: "Brown Sugar Pearl Milk",
    origin: "Taiwanese · Cold",
    note: "Slow-caramelised pearls in chilled fresh milk.",
    imageUrl: IMG(
      "brown sugar boba pearl milk in a clear glass, premium oriental dessert photography, soft cream background, editorial, top light",
    ),
  },
  {
    name: "Mango Pomelo Sago",
    origin: "Hong Kong · Cold",
    note: "Ripe mango, pomelo pearls and chilled sago cream.",
    imageUrl: IMG(
      "mango pomelo sago dessert in a ceramic bowl, vibrant yellow, premium oriental dessert photography, cream background, editorial",
    ),
  },
  {
    name: "Black Sesame Tang Yuan",
    origin: "Hong Kong · Warm",
    note: "Glutinous rice balls in warm black sesame soup.",
    imageUrl: IMG(
      "warm black sesame soup with glutinous rice balls tang yuan in a dark bowl, premium oriental dessert photography, cream background, editorial",
    ),
  },
  {
    name: "Ginger Milk Pudding",
    origin: "Hong Kong · Warm",
    note: "Silky steamed pudding with a gentle ginger warmth.",
    imageUrl: IMG(
      "silky ginger milk pudding in a white bowl, warm tones, premium oriental dessert photography, cream background, editorial",
    ),
  },
];

export default function Landing() {
  const { config } = useConfigurables();

  const appName = config?.appName || "Hong Tang";
  const tagline = config?.tagline || "Oriental Dessert Culture, Now in Your Pocket";
  const logoUrl = config?.logoUrl;
  const loyaltyName = config?.loyaltyProgramName || "Loyal-Tang";

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* ─────────────── Header ─────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${appName} logo`}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C62828] font-serif-display text-lg font-semibold text-white">
                红
              </span>
            )}
            <span className="font-serif-display text-xl font-semibold tracking-tight">
              {appName}
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#story" className="transition-colors hover:text-foreground">
              Our Story
            </a>
            <a href="#menu" className="transition-colors hover:text-foreground">
              Desserts
            </a>
            <a href="#presence" className="transition-colors hover:text-foreground">
              Outlets
            </a>
            <a href="#app" className="transition-colors hover:text-foreground">
              The App
            </a>
          </nav>
          <Button className="bg-[#C62828] text-white hover:bg-[#C62828]/90">
            Explore the Menu
          </Button>
        </div>
      </header>

      {/* ─────────────── Hero ─────────────── */}
      <section
        id="top"
        className="relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#C62828]/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-[#3E2723]/5 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="ht-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C62828]" />
              Pioneer Oriental Desserts · Since 2012
            </span>
            <h1 className="mt-6 font-serif-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              {tagline}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Taiwanese-style cold desserts and Hong Kong-style warm desserts —
              freshly crafted, quietly premium. The taste of oriental dessert
              culture, brought close to you.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="h-12 bg-[#C62828] px-8 text-base text-white shadow-sm transition-transform hover:bg-[#C62828]/90 hover:-translate-y-0.5"
              >
                Explore the Menu
              </Button>
              <a
                href="#app"
                className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-[#C62828] hover:underline"
              >
                Get the app →
              </a>
            </div>
          </div>

          <div className="relative ht-fade-in">
            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[0_24px_60px_-30px_rgba(62,39,35,0.4)]">
              <img
                src={IMG(
                  "brown sugar pearl milk dessert hero, premium oriental dessert photography, warm cream tones, editorial, soft natural light, generous negative space",
                )}
                alt="Signature Hong Tang dessert"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-lg backdrop-blur sm:block">
              <p className="font-serif-display text-2xl font-semibold">26+</p>
              <p className="text-xs text-muted-foreground">Premium mall outlets</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── Brand Story ─────────────── */}
      <section id="story" className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-24">
          <span className="font-serif-display text-3xl text-[#C62828]">红糖</span>
          <h2 className="mt-4 font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
            Indonesia's pioneer oriental dessert brand
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Since 2012, Hong Tang has brought the craft of healthy Asian desserts
            to Indonesia — pairing the delicate chill of Taiwanese sweets with the
            soulful warmth of Hong Kong classics. Every bowl is slow-made, freshly
            served, and rooted in a quiet reverence for oriental dessert culture.
          </p>
        </div>
      </section>

      {/* ─────────────── Featured Desserts ─────────────── */}
      <section id="menu" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-xl">
          <h2 className="font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
            Signatures worth slowing down for
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            A small, considered selection — cold and warm, each freshly made to
            order.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((d) => (
            <article
              key={d.name}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(62,39,35,0.45)]"
            >
              <div className="overflow-hidden">
                <img
                  src={d.imageUrl}
                  alt={d.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#C62828]">
                  {d.origin}
                </p>
                <h3 className="mt-1.5 font-serif-display text-lg font-semibold">
                  {d.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {d.note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─────────────── Presence ─────────────── */}
      <section
        id="presence"
        className="border-y border-border bg-[#3E2723] text-[#FDFBF7]"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[auto_1fr] md:py-24">
          <div>
            <p className="font-serif-display text-6xl font-semibold leading-none">
              26<span className="text-[#C62828]">+</span>
            </p>
            <p className="mt-2 text-sm tracking-wide text-[#FDFBF7]/70">
              outlets nationwide
            </p>
          </div>
          <div className="md:border-l md:border-white/15 md:pl-10">
            <h2 className="font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
              Found in Indonesia's finest malls
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#FDFBF7]/75">
              From Jakarta to Surabaya, Hong Tang lives where moments are made —
              an unhurried pause in the day's rhythm, served across more than
              twenty-six upscale mall locations.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────── App Teaser ─────────────── */}
      <section id="app" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="overflow-hidden rounded-[1.75rem] border border-border bg-secondary/50">
          <div className="grid items-center gap-10 p-8 md:grid-cols-2 md:p-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C62828]/10 px-3 py-1 text-xs font-medium tracking-wide text-[#C62828]">
                Coming Soon
              </span>
              <h2 className="mt-5 font-serif-display text-3xl font-semibold tracking-tight md:text-4xl">
                The whole experience, in your pocket
              </h2>
              <ul className="mt-7 space-y-4">
                {[
                  ["Order ahead", "Browse the crafted menu and pay in a few taps."],
                  ["Skip the queue", "Self-pickup with a code that walks you past the line."],
                  [
                    `Earn ${loyaltyName} rewards`,
                    "Collect Sugar Crystals on every order and unlock member perks.",
                  ],
                ].map(([title, body]) => (
                  <li key={title} className="flex gap-3.5">
                    <span className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#C62828] text-xs font-semibold text-white">
                      ✓
                    </span>
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Button
                  size="lg"
                  className="h-12 bg-[#C62828] px-8 text-base text-white hover:bg-[#C62828]/90"
                >
                  Get the App
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="mx-auto w-full max-w-xs overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[0_24px_60px_-30px_rgba(62,39,35,0.4)]">
                <img
                  src={IMG(
                    "elegant mango pomelo sago and brown sugar pearl desserts arranged minimally, premium oriental dessert photography, cream tones, editorial, generous whitespace",
                  )}
                  alt="Hong Tang desserts"
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── Footer ─────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${appName} logo`}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C62828] font-serif-display text-lg font-semibold text-white">
                  红
                </span>
              )}
              <div>
                <p className="font-serif-display text-lg font-semibold">{appName}</p>
                <p className="text-xs text-muted-foreground">{tagline}</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <a href="#story" className="transition-colors hover:text-foreground">
                Our Story
              </a>
              <a href="#menu" className="transition-colors hover:text-foreground">
                Desserts
              </a>
              <a href="#presence" className="transition-colors hover:text-foreground">
                Outlets
              </a>
              <a href="#app" className="transition-colors hover:text-foreground">
                The App
              </a>
            </nav>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground md:text-left">
            © {new Date().getFullYear()} {appName} (红糖). Oriental dessert culture,
            crafted in Indonesia since 2012.
          </div>
        </div>
      </footer>
    </div>
  );
}
