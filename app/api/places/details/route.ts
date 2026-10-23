import { type NextRequest, NextResponse } from "next/server";
import { getPlacesApiKey } from "@/app/lib/placesPhoto";

const TYPE_LABELS: Record<string, string> = {
  japanese_restaurant: "和食",
  sushi_restaurant: "寿司",
  ramen_restaurant: "ラーメン",
  italian_restaurant: "イタリアン",
  french_restaurant: "フレンチ",
  chinese_restaurant: "中華",
  korean_restaurant: "韓国料理",
  indian_restaurant: "インド料理",
  thai_restaurant: "タイ料理",
  seafood_restaurant: "海鮮",
  steak_house: "ステーキ",
  pizza_restaurant: "ピザ",
  cafe: "カフェ",
  bar: "バー",
  izakaya: "居酒屋",
  bakery: "ベーカリー",
  yakiniku_restaurant: "焼肉",
  tempura_restaurant: "天ぷら",
};

const PRICE_LABELS: Record<string, string> = {
  PRICE_LEVEL_INEXPENSIVE: "$",
  PRICE_LEVEL_MODERATE: "$$",
  PRICE_LEVEL_EXPENSIVE: "$$$",
  PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
};

function priceLabel(level: unknown): string {
  if (typeof level === "string" && PRICE_LABELS[level]) {
    return PRICE_LABELS[level];
  }
  if (typeof level === "number" && level > 0) {
    return "$".repeat(Math.min(level, 4));
  }
  return "";
}

const GENERIC_TYPES = new Set([
  "restaurant",
  "food",
  "point_of_interest",
  "establishment",
  "meal_takeaway",
  "meal_delivery",
  "store",
]);

const NAME_HINTS: [RegExp, string][] = [
  [/鮨|寿司|すし/, "寿司"],
  [/ラーメン|らーめん|拉麺/, "ラーメン"],
  [/焼鳥|焼き鳥/, "焼鳥"],
  [/焼肉/, "焼肉"],
  [/天ぷら|天麩羅/, "天ぷら"],
  [/うどん/, "うどん"],
  [/そば|蕎麦/, "そば"],
  [/イタリアン|トラットリア|ピッツァ|ピザ/, "イタリアン"],
  [/フレンチ|フランス料理/, "フレンチ"],
  [/中華|中国料理|餃子|点心/, "中華"],
  [/カフェ|珈琲|コーヒー|喫茶/, "カフェ"],
  [/居酒屋/, "居酒屋"],
];

function cuisineFromName(name: string): string {
  for (const [pattern, label] of NAME_HINTS) {
    if (pattern.test(name)) {
      return label;
    }
  }
  return "";
}

function cuisineLabel(place: {
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  displayName?: { text?: string };
  types?: string[];
}): string {
  const primary = place.primaryType ?? "";
  if (primary && !GENERIC_TYPES.has(primary)) {
    return place.primaryTypeDisplayName?.text?.trim() || TYPE_LABELS[primary] || "";
  }
  for (const type of place.types ?? []) {
    if (TYPE_LABELS[type]) {
      return TYPE_LABELS[type];
    }
  }
  return cuisineFromName(place.displayName?.text ?? "");
}

function todayHours(weekdayText: unknown): string {
  if (!Array.isArray(weekdayText) || weekdayText.length === 0) {
    return "";
  }
  const jsDay = new Date().getDay();
  const index = jsDay === 0 ? 6 : jsDay - 1;
  const line = weekdayText[index];
  return typeof line === "string" ? line.replace(/^[^:：]+[:：]\s*/, "") : "";
}

/** 検索で保存した店の説明・営業情報（place_id 指定） */
export async function GET(req: NextRequest) {
  const apiKey = getPlacesApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Places API not configured" }, { status: 501 });
  }

  const placeId = req.nextUrl.searchParams.get("placeId")?.trim() ?? "";
  if (!placeId || placeId.length > 256 || Number.isFinite(Number(placeId))) {
    return NextResponse.json({ error: "invalid placeId" }, { status: 400 });
  }

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=ja`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "displayName,editorialSummary,rating,priceLevel,regularOpeningHours.weekdayDescriptions,websiteUri,primaryType,primaryTypeDisplayName,types",
      },
    },
  );
  const result = (await res.json()) as {
    displayName?: { text?: string };
    editorialSummary?: { text?: string };
    rating?: number;
    priceLevel?: string;
    websiteUri?: string;
    primaryType?: string;
    primaryTypeDisplayName?: { text?: string };
    types?: string[];
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    error?: { status?: string };
  };

  if (!res.ok || result.error) {
    const status = result.error?.status;
    return NextResponse.json(
      { error: "Place details failed", status: status ?? res.status },
      { status: status === "NOT_FOUND" ? 404 : 502 },
    );
  }

  return NextResponse.json({
    description: result.editorialSummary?.text?.trim() ?? "",
    cuisineType: cuisineLabel(result),
    priceRange: priceLabel(result.priceLevel),
    rating: typeof result.rating === "number" ? String(result.rating) : "",
    openingHours: todayHours(result.regularOpeningHours?.weekdayDescriptions),
    websiteUrl: result.websiteUri?.trim() ?? "",
  });
}
