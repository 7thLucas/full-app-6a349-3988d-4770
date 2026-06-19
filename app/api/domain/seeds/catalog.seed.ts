import { createLogger } from "~/lib/logger";
import { OutletModel } from "../models/outlet.model";
import { MenuItemModel } from "../models/menu-item.model";

const logger = createLogger("CatalogSeed");

const IMG = (prompt: string) =>
  `https://api.qb-deck.quantumbyte.ai/common/image-generation?prompt=${encodeURIComponent(prompt)}`;

const tempGroup = {
  id: "temp",
  name: "Temperature",
  type: "single",
  required: true,
  min: 1,
  max: 1,
  choices: [
    { id: "cold", label: "Cold", priceDelta: 0 },
    { id: "less-ice", label: "Less Ice", priceDelta: 0 },
    { id: "no-ice", label: "No Ice", priceDelta: 0 },
  ],
};

const warmTempGroup = {
  id: "temp",
  name: "Temperature",
  type: "single",
  required: true,
  min: 1,
  max: 1,
  choices: [
    { id: "warm", label: "Warm", priceDelta: 0 },
    { id: "hot", label: "Hot", priceDelta: 0 },
  ],
};

const sugarGroup = {
  id: "sugar",
  name: "Sugar Level",
  type: "single",
  required: true,
  min: 1,
  max: 1,
  choices: [
    { id: "100", label: "100% Sweet", priceDelta: 0 },
    { id: "70", label: "70%", priceDelta: 0 },
    { id: "50", label: "50%", priceDelta: 0 },
    { id: "30", label: "30%", priceDelta: 0 },
    { id: "0", label: "0% No Sugar", priceDelta: 0 },
  ],
};

const toppingsGroup = (max = 3) => ({
  id: "toppings",
  name: "Toppings",
  type: "multi",
  required: false,
  min: 0,
  max,
  choices: [
    { id: "pearls", label: "Brown Sugar Pearls", priceDelta: 6000 },
    { id: "grass-jelly", label: "Grass Jelly", priceDelta: 5000 },
    { id: "taro-ball", label: "Taro Balls", priceDelta: 7000 },
    { id: "red-bean", label: "Red Bean", priceDelta: 5000 },
    { id: "pudding", label: "Egg Pudding", priceDelta: 6000 },
    { id: "mochi", label: "Mini Mochi", priceDelta: 7000 },
  ],
});

const MENU: Array<{
  slug: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imgPrompt: string;
  tags?: string[];
  isSignature?: boolean;
  groups: any[];
  sortOrder?: number;
}> = [
  {
    slug: "brown-sugar-pearl-milk",
    name: "Brown Sugar Pearl Milk",
    description: "Signature fresh milk layered with slow-cooked brown sugar and chewy pearls.",
    category: "signatures",
    basePrice: 38000,
    imgPrompt: "brown sugar boba pearl fresh milk in glass, premium oriental dessert, cream background, soft light, top down",
    tags: ["Bestseller"],
    isSignature: true,
    groups: [tempGroup, sugarGroup, toppingsGroup()],
    sortOrder: 1,
  },
  {
    slug: "taro-coconut-sago",
    name: "Taro Coconut Sago",
    description: "Steamed taro, coconut milk and sago — a Hong Kong classic, lightly sweet.",
    category: "signatures",
    basePrice: 42000,
    imgPrompt: "taro coconut sago dessert bowl, purple, premium oriental dessert photography, cream background",
    tags: ["Signature"],
    isSignature: true,
    groups: [tempGroup, sugarGroup, toppingsGroup()],
    sortOrder: 2,
  },
  {
    slug: "grass-jelly-supreme",
    name: "Grass Jelly Supreme",
    description: "Herbal grass jelly with taro balls, red bean and a drizzle of brown sugar.",
    category: "grass-jelly",
    basePrice: 40000,
    imgPrompt: "grass jelly dessert bowl with taro balls and red bean, dark herbal jelly, premium oriental dessert, cream background",
    tags: ["Herbal"],
    groups: [tempGroup, sugarGroup, toppingsGroup()],
    sortOrder: 3,
  },
  {
    slug: "iced-grass-jelly-milk-tea",
    name: "Grass Jelly Milk Tea",
    description: "Fragrant milk tea poured over soft grass jelly cubes.",
    category: "grass-jelly",
    basePrice: 34000,
    imgPrompt: "grass jelly milk tea iced drink in glass, premium, cream background, soft light",
    groups: [tempGroup, sugarGroup, toppingsGroup()],
    sortOrder: 4,
  },
  {
    slug: "mango-pomelo-sago",
    name: "Mango Pomelo Sago",
    description: "Alphonso mango, pomelo pearls and sago in chilled mango cream.",
    category: "mango-fruit",
    basePrice: 45000,
    imgPrompt: "mango pomelo sago dessert in bowl, vibrant yellow, premium oriental dessert, cream background, top down",
    tags: ["Bestseller"],
    isSignature: true,
    groups: [tempGroup, sugarGroup, toppingsGroup()],
    sortOrder: 5,
  },
  {
    slug: "fresh-mango-shaved-ice",
    name: "Fresh Mango Shaved Ice",
    description: "Mountains of fluffy shaved ice crowned with fresh mango cubes.",
    category: "mango-fruit",
    basePrice: 48000,
    imgPrompt: "mango shaved ice tower dessert, fresh mango cubes, premium oriental dessert photography, cream background",
    groups: [sugarGroup, toppingsGroup()],
    sortOrder: 6,
  },
  {
    slug: "warm-black-sesame-soup",
    name: "Warm Black Sesame Soup",
    description: "Velvety stone-ground black sesame, served warm. Comforting and rich.",
    category: "warm-desserts",
    basePrice: 36000,
    imgPrompt: "warm black sesame soup dessert in bowl, smooth dark grey, premium oriental dessert, cream background",
    tags: ["Warm"],
    groups: [warmTempGroup, sugarGroup, toppingsGroup(2)],
    sortOrder: 7,
  },
  {
    slug: "ginger-tang-yuan",
    name: "Ginger Tang Yuan",
    description: "Glutinous rice balls with sesame filling in warm ginger syrup.",
    category: "warm-desserts",
    basePrice: 38000,
    imgPrompt: "tang yuan glutinous rice balls in warm ginger syrup, premium oriental dessert, cream background",
    tags: ["Warm"],
    groups: [warmTempGroup, sugarGroup, toppingsGroup(2)],
    sortOrder: 8,
  },
  {
    slug: "brown-sugar-smash-ice",
    name: "Brown Sugar Smash Ice",
    description: "Hand-smashed ice soaked in brown sugar syrup with pearls and pudding.",
    category: "smash-ice",
    basePrice: 44000,
    imgPrompt: "brown sugar smashed ice dessert with pearls, premium oriental dessert photography, cream background",
    tags: ["New"],
    groups: [sugarGroup, toppingsGroup()],
    sortOrder: 9,
  },
  {
    slug: "matcha-ice-cream-bowl",
    name: "Matcha Ice Cream Bowl",
    description: "Premium matcha soft-serve over red bean and mochi.",
    category: "smash-ice",
    basePrice: 46000,
    imgPrompt: "matcha soft serve ice cream bowl with red bean and mochi, premium oriental dessert, cream background",
    groups: [toppingsGroup()],
    sortOrder: 10,
  },
  {
    slug: "jasmine-milk-tea",
    name: "Jasmine Milk Tea",
    description: "Hand-brewed jasmine green tea with fresh milk.",
    category: "beverages",
    basePrice: 30000,
    imgPrompt: "jasmine milk tea iced drink in glass, premium, cream background, soft light",
    groups: [tempGroup, sugarGroup, toppingsGroup()],
    sortOrder: 11,
  },
  {
    slug: "oolong-fruit-tea",
    name: "Oolong Fruit Tea",
    description: "Roasted oolong shaken with seasonal fruit and a hint of honey.",
    category: "beverages",
    basePrice: 32000,
    imgPrompt: "oolong fruit tea iced drink with fruit slices in glass, premium, cream background",
    groups: [tempGroup, sugarGroup, toppingsGroup()],
    sortOrder: 12,
  },
  {
    slug: "osmanthus-pear-seasonal",
    name: "Osmanthus & Pear (Seasonal)",
    description: "Limited-season warm pear poached with osmanthus blossom and goji.",
    category: "seasonal",
    basePrice: 49000,
    imgPrompt: "osmanthus poached pear warm dessert with goji berries, premium oriental dessert, cream background",
    tags: ["Limited"],
    groups: [warmTempGroup, sugarGroup, toppingsGroup(2)],
    sortOrder: 13,
  },
];

const OUTLETS = [
  {
    slug: "pacific-place",
    name: "Hong Tang Pacific Place",
    mall: "Pacific Place Mall",
    city: "Jakarta",
    address: "Ground Floor, Pacific Place, SCBD, Jakarta Selatan",
    distanceKm: 1.2,
    openTime: "10:00",
    closeTime: "22:00",
    lastOrderTime: "21:30",
    prepMinutes: 12,
    isOpen: true,
    pickupEnabled: true,
    lat: -6.224,
    lng: 106.81,
  },
  {
    slug: "grand-indonesia",
    name: "Hong Tang Grand Indonesia",
    mall: "Grand Indonesia",
    city: "Jakarta",
    address: "West Mall L2, Grand Indonesia, Jakarta Pusat",
    distanceKm: 3.6,
    openTime: "10:00",
    closeTime: "22:00",
    lastOrderTime: "21:30",
    prepMinutes: 18,
    isOpen: true,
    pickupEnabled: true,
    lat: -6.195,
    lng: 106.821,
  },
  {
    slug: "pakuwon-mall",
    name: "Hong Tang Pakuwon Mall",
    mall: "Pakuwon Mall",
    city: "Surabaya",
    address: "Upper Ground, Pakuwon Mall, Surabaya",
    distanceKm: 12.4,
    openTime: "10:00",
    closeTime: "22:00",
    lastOrderTime: "21:15",
    prepMinutes: 15,
    isOpen: true,
    pickupEnabled: true,
    lat: -7.289,
    lng: 112.677,
  },
  {
    slug: "paris-van-java",
    name: "Hong Tang Paris Van Java",
    mall: "Paris Van Java",
    city: "Bandung",
    address: "Resort Level, Paris Van Java, Bandung",
    distanceKm: 18.9,
    openTime: "10:00",
    closeTime: "21:30",
    lastOrderTime: "21:00",
    prepMinutes: 14,
    isOpen: false,
    pickupEnabled: true,
    lat: -6.888,
    lng: 107.595,
  },
];

export async function seedCatalog(): Promise<void> {
  try {
    const outletCount = await OutletModel.countDocuments();
    if (outletCount === 0) {
      await OutletModel.insertMany(OUTLETS.map((o) => ({ ...o, soldOutItemIds: [] })));
      logger.info(`✅ Seeded ${OUTLETS.length} outlets.`);
    } else {
      logger.info("Outlets already seeded, skipping.");
    }

    const menuCount = await MenuItemModel.countDocuments();
    if (menuCount === 0) {
      await MenuItemModel.insertMany(
        MENU.map((m) => ({
          slug: m.slug,
          name: m.name,
          description: m.description,
          category: m.category,
          basePrice: m.basePrice,
          imageUrl: IMG(m.imgPrompt),
          tags: m.tags ?? [],
          isSignature: m.isSignature ?? false,
          available: true,
          optionGroups: m.groups,
          sortOrder: m.sortOrder ?? 0,
        })),
      );
      logger.info(`✅ Seeded ${MENU.length} menu items.`);
    } else {
      logger.info("Menu items already seeded, skipping.");
    }
  } catch (error) {
    logger.error("❌ Catalog seed failed:", error);
  }
}
