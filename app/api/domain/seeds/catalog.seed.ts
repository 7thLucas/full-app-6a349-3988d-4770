import { createLogger } from "~/lib/logger";
import { CategoryModel } from "../models/category.model";
import { OutletModel } from "../models/outlet.model";
import { MenuItemModel } from "../models/menu-item.model";
import { CATEGORIES } from "~/lib/domain.types";

const logger = createLogger("CatalogSeed");

const menuAsset = (fileName: string) => `/images/menu/${fileName}`;

const CATEGORY_IMAGES: Record<string, string> = {
  "signature-promo": menuAsset("grassjelly-signature.jpg"),
  "taiwan-grass-jelly": menuAsset("grassjelly-signature.jpg"),
  "taiwan-soya": menuAsset("soya-classic.jpg"),
  taro: menuAsset("taro-favorite.jpg"),
  "taiwan-ice-pudding": menuAsset("q-ball-ice-signature.jpg"),
  "durian-dessert": menuAsset("durian-sago.jpg"),
  "mango-dessert": menuAsset("mango-sago.jpg"),
  "thai-mango-coco": menuAsset("mango-monster.jpg"),
  "thai-coconut-ice": menuAsset("cendol-monster.jpg"),
  "classic-warm": menuAsset("purple-rice-durian.jpg"),
  "fresh-milk": menuAsset("q-ball-ice-signature.jpg"),
  beverages: menuAsset("grassjelly-q-ball.jpg"),
  savory: menuAsset("collectible-sticker-banner.jpg"),
};

const iceGroup = {
  id: "ice",
  name: "Ice",
  type: "single",
  required: true,
  min: 1,
  max: 1,
  choices: [
    { id: "normal", label: "Normal Ice", priceDelta: 0 },
    { id: "less", label: "Less Ice", priceDelta: 0 },
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
    { id: "100", label: "100%", priceDelta: 0 },
    { id: "70", label: "70%", priceDelta: 0 },
    { id: "50", label: "50%", priceDelta: 0 },
    { id: "30", label: "30%", priceDelta: 0 },
    { id: "0", label: "0% No Sugar", priceDelta: 0 },
  ],
};

const toppingsGroup = (max = 4, choices = REAL_TOPPINGS) => ({
  id: "toppings",
  name: "Toppings",
  type: "multi",
  required: false,
  min: 0,
  max,
  choices,
});

const REAL_TOPPINGS = [
  { id: "pearl", label: "Pearl / Bubble", priceDelta: 6000 },
  { id: "q-ball", label: "Q Ball", priceDelta: 7000 },
  { id: "mochi", label: "Mochi", priceDelta: 7000 },
  { id: "grass-jelly", label: "Grass Jelly / Cingcau", priceDelta: 5000 },
  { id: "mango-pudding", label: "Mango Pudding", priceDelta: 6000 },
  { id: "coconut-pudding", label: "Coconut Pudding", priceDelta: 6000 },
  { id: "3-mix-pudding", label: "3 Mix Pudding", priceDelta: 7000 },
  { id: "soya-pudding", label: "Soya Pudding", priceDelta: 6000 },
  { id: "coconut-jelly", label: "Coconut Jelly", priceDelta: 5000 },
  { id: "peanut", label: "Peanut", priceDelta: 5000 },
  { id: "red-bean", label: "Red Bean", priceDelta: 5000 },
  { id: "ketan", label: "Ketan", priceDelta: 5000 },
  { id: "ronde", label: "Ronde", priceDelta: 7000 },
  { id: "ice-cream", label: "Ice Cream", priceDelta: 8000 },
];

const THAI_MANGO_COCO_TOPPINGS = REAL_TOPPINGS.filter((t) =>
  ["mango-pudding", "coconut-pudding", "grass-jelly", "ketan", "pearl"].includes(t.id),
);

type MenuSeed = {
  slug: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl: string;
  tags?: string[];
  isSignature?: boolean;
  optionGroups?: any[];
  sortOrder: number;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function menu(
  name: string,
  category: string,
  basePrice: number,
  description: string,
  sortOrder: number,
  extra: Partial<MenuSeed> = {},
): MenuSeed {
  const warm = category === "classic-warm";
  const beverage = category === "beverages";
  const thaiMango = category === "thai-mango-coco";
  return {
    slug: extra.slug ?? slugify(name),
    name,
    description,
    category,
    basePrice,
    imageUrl: extra.imageUrl ?? CATEGORY_IMAGES[category] ?? menuAsset("grassjelly-signature.jpg"),
    tags: extra.tags ?? (warm ? ["Warm"] : []),
    isSignature: extra.isSignature ?? /signature/i.test(name),
    optionGroups:
      extra.optionGroups ??
      (warm
        ? [warmTempGroup, sugarGroup, toppingsGroup(3)]
        : beverage
          ? [iceGroup, sugarGroup, toppingsGroup(3)]
          : thaiMango
            ? [iceGroup, sugarGroup, toppingsGroup(1, THAI_MANGO_COCO_TOPPINGS)]
            : [iceGroup, sugarGroup, toppingsGroup(4)]),
    sortOrder,
  };
}

const MENU: MenuSeed[] = [
  menu("Grass Jelly Signature", "signature-promo", 54450, "Promo signature grass jelly dessert.", 1, { isSignature: true, tags: ["Signature", "Promo"] }),
  menu("Soya Signature", "signature-promo", 54450, "Promo signature soya pudding dessert.", 2, { isSignature: true, tags: ["Signature", "Promo"] }),
  menu("Taro Signature", "signature-promo", 54450, "Promo signature taro dessert.", 3, { isSignature: true, tags: ["Signature", "Promo"] }),

  menu("Grassjelly Signature", "taiwan-grass-jelly", 50000, "Taiwan cingcau with pearl, Q Ball, and ice cream.", 10, { isSignature: true }),
  menu("Grassjelly Classic", "taiwan-grass-jelly", 41000, "Taiwan cingcau with pearl, peanut, and red bean.", 11, { imageUrl: menuAsset("grassjelly-q-ball.jpg") }),
  menu("Grassjelly Favorite", "taiwan-grass-jelly", 42000, "Taiwan cingcau with pearl, mochi, and pudding.", 12, { imageUrl: menuAsset("grassjelly-favorite.jpg"), tags: ["Favorite"] }),

  menu("Soya Signature", "taiwan-soya", 50000, "Soya pudding with pearl, Q Ball, and ice cream.", 20, { slug: "taiwan-soya-signature", isSignature: true }),
  menu("Soya Classic", "taiwan-soya", 41000, "Soya pudding with peanut and red bean.", 21),
  menu("Soya Favorite", "taiwan-soya", 42000, "Soya pudding with mochi and pudding.", 22, { tags: ["Favorite"] }),

  menu("Taro Signature", "taro", 50000, "Taro ice with pearl and ice cream.", 30, { slug: "taro-series-signature", isSignature: true }),
  menu("Taro Classic", "taro", 41000, "Taro ice with peanut and red bean.", 31),
  menu("Taro Favorite", "taro", 42000, "Taro ice with pearl and ice cream.", 32, { tags: ["Favorite"] }),

  menu("Ice Puding Signature", "taiwan-ice-pudding", 43000, "3 Mix Pudding with ice cream.", 40, { isSignature: true }),
  menu("Ice Puding Classic", "taiwan-ice-pudding", 41000, "3 Mix Pudding with mango.", 41),
  menu("Ice Puding Fav", "taiwan-ice-pudding", 43000, "3 Mix Pudding with durian.", 42, { imageUrl: menuAsset("purple-rice-durian.jpg"), tags: ["Favorite"] }),

  menu("Durian Coco Pudding", "durian-dessert", 69000, "Durian soup with coconut pudding.", 50, { imageUrl: menuAsset("durian-28.jpg") }),
  menu("Durian Grassjelly", "durian-dessert", 67000, "Durian soup with grass jelly.", 51),
  menu("Durian Soup + Ice Cream", "durian-dessert", 52800, "Durian soup served with ice cream.", 52, { imageUrl: menuAsset("durian-28.jpg") }),
  menu("Durian Juice", "durian-dessert", 44000, "Durian juice with grass jelly.", 53, { imageUrl: menuAsset("durian-28.jpg") }),

  menu("Mango Soup + Coconut Pudding", "mango-dessert", 43000, "Mango soup with coconut pudding.", 60, { imageUrl: menuAsset("mango-monster.jpg") }),
  menu("Mango Soup + Grass Jelly", "mango-dessert", 43000, "Mango soup with grass jelly.", 61),
  menu("Mango Soup + Ice Cream", "mango-dessert", 43000, "Mango soup with ice cream.", 62, { imageUrl: menuAsset("mango-monster.jpg") }),
  menu("Mango Soup + Mango Pudding", "mango-dessert", 43000, "Mango soup with mango pudding.", 63),

  menu("Mango Coco", "thai-mango-coco", 39000, "Thai mango coco with a choice of topping.", 70),

  menu("Coco Peach", "thai-coconut-ice", 41000, "Coconut ice with peach.", 80),
  menu("Coco Mango", "thai-coconut-ice", 41000, "Coconut ice with mango.", 81),
  menu("Coco Durian", "thai-coconut-ice", 50000, "Coconut ice with durian.", 82),

  menu("Ginger Soup", "classic-warm", 38500, "Warm ginger soup.", 90, { imageUrl: menuAsset("q-ball-ice-signature.jpg") }),
  menu("Red Bean Soup", "classic-warm", 35200, "Warm red bean soup.", 91, { imageUrl: menuAsset("soya-classic.jpg") }),
  menu("Ketan Hitam", "classic-warm", 35200, "Warm black glutinous rice soup.", 92),

  menu("Grass Jelly QQ 28", "fresh-milk", 35000, "Fresh milk with grass jelly, Q Ball, mochi, and bubble.", 100, { imageUrl: menuAsset("grassjelly-q-ball.jpg") }),
  menu("Tiger Pudding", "fresh-milk", 35000, "Brown sugar milk with grass jelly, caramel pudding, chocolate pudding, and bubble.", 101, { tags: ["Brown Sugar"] }),
  menu("Taro Soy", "fresh-milk", 35000, "Taro milk with soya pudding, peanut, coconut jelly, and red bean.", 102, { imageUrl: menuAsset("taro-favorite.jpg") }),
  menu("Coco Peach Fresh Milk", "fresh-milk", 35000, "Coconut soup with coconut pudding, mochi, peach, and bubble.", 103, { slug: "fresh-milk-coco-peach", imageUrl: menuAsset("cendol-monster.jpg") }),
  menu("Ginger Tangyuan", "fresh-milk", 35000, "Ginger soup with ronde, red bean, peanut, and bubble.", 104, { imageUrl: menuAsset("q-ball-ice-signature.jpg"), tags: ["Warm"] }),

  menu("Tiger Milk", "beverages", 35000, "Fresh milk, brown sugar, and bubble.", 110, { imageUrl: menuAsset("grassjelly-q-ball.jpg"), tags: ["Brown Sugar"] }),
  menu("Choco Lava", "beverages", 35000, "Fresh milk with chocolate cream.", 111, { imageUrl: menuAsset("soya-classic.jpg") }),
  menu("Strawberry Lemonade", "beverages", 35000, "Strawberry syrup and lemon syrup.", 112, { imageUrl: menuAsset("mango-monster.jpg") }),
  menu("Blackpinky Choco Lava", "beverages", 35000, "Blackpinky choco lava beverage.", 113, { imageUrl: menuAsset("purple-rice-durian.jpg") }),
  menu("Blackpinky Macchiato", "beverages", 35000, "Blackpinky macchiato beverage.", 114, { imageUrl: menuAsset("purple-rice-durian.jpg") }),
  menu("Taro Genji", "beverages", 19000, "Taro Genji beverage.", 115, { imageUrl: menuAsset("taro-favorite.jpg") }),
  menu("Coffee Tiger", "beverages", 19000, "Coffee Tiger beverage.", 116, { imageUrl: menuAsset("grassjelly-q-ball.jpg") }),
  menu("Royal Milk Tea", "beverages", 19000, "Royal milk tea.", 117, { imageUrl: menuAsset("soya-classic.jpg") }),

  menu("Karaage Curry Rice", "savory", 43000, "Savory karaage curry rice.", 130, { optionGroups: [], tags: ["Savory"] }),
];

const OUTLETS = [
  {
    slug: "grand-indonesia",
    name: "Hong Tang @ Grand Indonesia",
    mall: "Grand Indonesia",
    city: "Jakarta",
    address: "East Mall, 3rd Floor, Grand Indonesia, Jakarta Pusat",
    distanceKm: 3.6,
    lat: -6.1951,
    lng: 106.8216,
  },
  {
    slug: "mall-kelapa-gading-3",
    name: "Hong Tang @ Mall Kelapa Gading 3",
    mall: "Summarecon Mall Kelapa Gading 3",
    city: "Jakarta",
    address: "3rd Floor, Mall Kelapa Gading 3, Kelapa Gading, Jakarta Utara",
    distanceKm: 9.8,
    lat: -6.1579,
    lng: 106.9086,
  },
  {
    slug: "central-park",
    name: "Hong Tang @ Central Park",
    mall: "Central Park",
    city: "Jakarta",
    address: "Central Park Mall, Tanjung Duren, Jakarta Barat",
    distanceKm: 6.7,
    lat: -6.1774,
    lng: 106.7906,
  },
  {
    slug: "mall-taman-anggrek",
    name: "Hong Tang @ Mall Taman Anggrek",
    mall: "Mall Taman Anggrek",
    city: "Jakarta",
    address: "Mall Taman Anggrek, Tanjung Duren, Jakarta Barat",
    distanceKm: 6.9,
    lat: -6.1787,
    lng: 106.7925,
  },
  {
    slug: "mall-artha-gading",
    name: "Hong Tang @ Mall Artha Gading",
    mall: "Mall Artha Gading",
    city: "Jakarta",
    address: "Mall Artha Gading, Kelapa Gading, Jakarta Utara",
    distanceKm: 10.5,
    lat: -6.1434,
    lng: 106.8927,
  },
  {
    slug: "mall-of-indonesia",
    name: "Hong Tang @ Mall of Indonesia",
    mall: "Mall of Indonesia",
    city: "Jakarta",
    address: "Mall of Indonesia, Kelapa Gading, Jakarta Utara",
    distanceKm: 10.1,
    lat: -6.1493,
    lng: 106.8916,
  },
  {
    slug: "pondok-indah-mall-2",
    name: "Hong Tang @ Pondok Indah Mall 2",
    mall: "Pondok Indah Mall 2",
    city: "Jakarta",
    address: "Pondok Indah Mall 2, Jakarta Selatan",
    distanceKm: 8.5,
    lat: -6.2656,
    lng: 106.7846,
  },
  {
    slug: "lotte-shopping-avenue",
    name: "Hong Tang @ Lotte Shopping Avenue",
    mall: "Lotte Shopping Avenue",
    city: "Jakarta",
    address: "Lotte Shopping Avenue, Kuningan, Jakarta Selatan",
    distanceKm: 2.5,
    lat: -6.2242,
    lng: 106.8229,
  },
  {
    slug: "pik-avenue",
    name: "Hong Tang @ PIK Avenue",
    mall: "PIK Avenue / Pantjoran PIK",
    city: "Jakarta",
    address: "PIK Avenue / Pantjoran PIK, Pantai Indah Kapuk, Jakarta Utara",
    distanceKm: 17.4,
    lat: -6.1081,
    lng: 106.7404,
  },
  {
    slug: "gandaria-city",
    name: "Hong Tang @ Gandaria City",
    mall: "Gandaria City",
    city: "Jakarta",
    address: "Gandaria City, Kebayoran Lama, Jakarta Selatan",
    distanceKm: 7.3,
    lat: -6.2443,
    lng: 106.7837,
  },
  {
    slug: "slipi-jaya",
    name: "Hong Tang @ Slipi Jaya",
    mall: "Slipi Jaya",
    city: "Jakarta",
    address: "Slipi Jaya, Palmerah, Jakarta Barat",
    distanceKm: 5.4,
    lat: -6.189,
    lng: 106.798,
  },
  {
    slug: "summarecon-mall-serpong",
    name: "Hong Tang @ Summarecon Mall Serpong",
    mall: "Summarecon Mall Serpong",
    city: "Tangerang",
    address: "Summarecon Mall Serpong, Gading Serpong, Tangerang",
    distanceKm: 24.2,
    lat: -6.2416,
    lng: 106.6287,
  },
  {
    slug: "aeon-mall-bsd",
    name: "Hong Tang @ AEON Mall BSD",
    mall: "AEON Mall BSD",
    city: "Tangerang",
    address: "AEON Mall BSD City, Tangerang",
    distanceKm: 28.3,
    lat: -6.3052,
    lng: 106.6437,
  },
  {
    slug: "gading-serpong",
    name: "Hong Tang @ Gading Serpong",
    mall: "Gading Serpong",
    city: "Tangerang",
    address: "Gading Serpong, Tangerang",
    distanceKm: 25.1,
    lat: -6.2446,
    lng: 106.6316,
  },
  {
    slug: "broadway-alam-sutera",
    name: "Hong Tang @ Broadway Alam Sutera",
    mall: "Broadway Alam Sutera",
    city: "Tangerang",
    address: "Broadway Alam Sutera, Tangerang",
    distanceKm: 21.6,
    lat: -6.2232,
    lng: 106.6524,
  },
  {
    slug: "benda",
    name: "Hong Tang @ Benda",
    mall: "Benda",
    city: "Tangerang",
    address: "Benda, Tangerang",
    distanceKm: 24.5,
    lat: -6.1257,
    lng: 106.6748,
  },
  {
    slug: "summarecon-mall-bekasi",
    name: "Hong Tang @ Summarecon Mall Bekasi",
    mall: "Summarecon Mall Bekasi",
    city: "Bekasi",
    address: "Summarecon Mall Bekasi, Bekasi",
    distanceKm: 23.1,
    lat: -6.2264,
    lng: 107.0006,
  },
  {
    slug: "23-paskal",
    name: "Hong Tang @ 23 Paskal",
    mall: "23 Paskal",
    city: "Bandung",
    address: "23 Paskal Shopping Center, Bandung",
    distanceKm: 118.3,
    lat: -6.9153,
    lng: 107.5944,
  },
  {
    slug: "cicendo",
    name: "Hong Tang @ Cicendo",
    mall: "Cicendo",
    city: "Bandung",
    address: "Cicendo, Bandung",
    distanceKm: 119.6,
    lat: -6.9069,
    lng: 107.5961,
  },
  {
    slug: "the-grand-outlet-karawang",
    name: "Hong Tang @ The Grand Outlet Karawang",
    mall: "The Grand Outlet Karawang",
    city: "Karawang",
    address: "The Grand Outlet Karawang, Karawang",
    distanceKm: 61.5,
    lat: -6.3566,
    lng: 107.3055,
  },
];

const LEGACY_MENU_SLUGS = [
  "brown-sugar-pearl-milk",
  "taro-coconut-sago",
  "grass-jelly-supreme",
  "iced-grass-jelly-milk-tea",
  "mango-pomelo-sago",
  "fresh-mango-shaved-ice",
  "warm-black-sesame-soup",
  "ginger-tang-yuan",
  "brown-sugar-smash-ice",
  "matcha-ice-cream-bowl",
  "jasmine-milk-tea",
  "oolong-fruit-tea",
  "osmanthus-pear-seasonal",
];

const LEGACY_OUTLET_SLUGS = ["pacific-place", "pakuwon-mall", "paris-van-java"];

export async function seedCatalog(): Promise<void> {
  try {
    await CategoryModel.deleteMany({ key: { $nin: CATEGORIES.map((c) => c.key) } });
    await Promise.all(
      CATEGORIES.map((category, sortOrder) =>
        CategoryModel.updateOne(
          { key: category.key },
          { $set: { key: category.key, name: category.name, sortOrder } },
          { upsert: true },
        ),
      ),
    );

    await MenuItemModel.deleteMany({ slug: { $in: LEGACY_MENU_SLUGS } });
    await Promise.all(
      MENU.map((m) =>
        MenuItemModel.updateOne(
          { slug: m.slug },
          {
            $set: {
              slug: m.slug,
              name: m.name,
              description: m.description,
              category: m.category,
              basePrice: m.basePrice,
              imageUrl: m.imageUrl,
              tags: m.tags ?? [],
              isSignature: m.isSignature ?? false,
              available: true,
              published: true,
              optionGroups: m.optionGroups ?? [],
              sortOrder: m.sortOrder,
            },
            $setOnInsert: { priceOverrides: [], allergens: [], calories: null },
          },
          { upsert: true },
        ),
      ),
    );

    await OutletModel.deleteMany({ slug: { $in: LEGACY_OUTLET_SLUGS } });
    await Promise.all(
      OUTLETS.map((o, index) =>
        OutletModel.updateOne(
          { slug: o.slug },
          {
            $set: {
              ...o,
              country: "ID",
              region: "WIB",
              openTime: "10:00",
              closeTime: "22:00",
              lastOrderTime: "21:30",
              prepMinutes: 15 + (index % 4),
              isOpen: true,
              pickupEnabled: true,
              deliveryEnabled: false,
            },
            $setOnInsert: { soldOutItemIds: [] },
          },
          { upsert: true },
        ),
      ),
    );

    logger.info(`Seeded/updated ${CATEGORIES.length} categories, ${MENU.length} menu items, and ${OUTLETS.length} outlets.`);
  } catch (error) {
    logger.error("Catalog seed failed:", error);
  }
}
