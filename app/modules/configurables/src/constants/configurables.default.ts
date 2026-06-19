/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts.
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type THeroBanner = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

export type TPromoRow = {
  heading: string;
  subtext: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  tagline: string;
  loyaltyProgramName: string;
  supportPhone: string;
  brandColor: TBrandColor;
  backgroundColor: string;
  heroBanners: THeroBanner[];
  promoRows: TPromoRow[];
};

const IMG = (prompt: string) =>
  `https://api.qb-deck.quantumbyte.ai/common/image-generation?prompt=${encodeURIComponent(prompt)}`;

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Hong Tang",
  logoUrl: IMG("minimalist logo for premium oriental dessert brand, brown sugar, chinese character, cream background"),
  tagline: "Oriental Dessert Culture, Now in Your Pocket",
  loyaltyProgramName: "Loyal-Tang",
  supportPhone: "+62 811 1000 2012",
  brandColor: {
    primary: "#3E2723", // deep brown-sugar
    secondary: "#6F6258", // warm grey
    accent: "#C62828", // Hong Tang Red
  },
  backgroundColor: "#FDFBF7", // textured cream
  heroBanners: [
    {
      title: "Brown Sugar, Slow-Crafted",
      subtitle: "Our signature pearls, freshly made for you.",
      imageUrl: IMG("brown sugar pearl milk dessert hero banner, premium oriental dessert photography, warm cream tones, editorial"),
    },
    {
      title: "Warm Comfort, Hong Kong Style",
      subtitle: "Black sesame & ginger tang yuan, served warm.",
      imageUrl: IMG("warm black sesame soup and tang yuan dessert hero banner, premium oriental, cream tones, editorial"),
    },
    {
      title: "Mango Season Is Here",
      subtitle: "Mango pomelo sago — chilled and radiant.",
      imageUrl: IMG("mango pomelo sago dessert hero banner, vibrant yellow, premium oriental, cream tones, editorial"),
    },
  ],
  promoRows: [
    { heading: "Signatures", subtext: "The bowls Hong Tang is loved for" },
    { heading: "Warm & Comforting", subtext: "Hong Kong-style, served warm" },
  ],
};
