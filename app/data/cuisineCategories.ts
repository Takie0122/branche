// Home / List で使うメインの料理カテゴリ
export const CUISINE_CATEGORIES = ["Italian", "Japanese", "Chinese", "Cafe", "French"] as const;

export type CuisineCategory = (typeof CUISINE_CATEGORIES)[number];

/** 任意の cuisineType を 5つのメインカテゴリにマッピングする */
export function mapCuisineToCategory(raw?: string | null): CuisineCategory | null {
  if (!raw) return null;
  if ((CUISINE_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as CuisineCategory;
  }

  if (/寿司|鮨|ラーメン|和食|焼肉|天ぷら|居酒屋|うどん|そば|蕎麦|焼鳥|焼き鳥|海鮮|日本/.test(raw)) {
    return "Japanese";
  }
  if (/イタリアン|ピザ|ピッツァ|トラットリア/.test(raw)) {
    return "Italian";
  }
  if (/フレンチ|フランス/.test(raw)) {
    return "French";
  }
  if (/中華|中国/.test(raw)) {
    return "Chinese";
  }
  if (/カフェ|コーヒー|珈琲|ベーカリー|喫茶/.test(raw)) {
    return "Cafe";
  }

  switch (raw) {
    case "Brunch":
    case "Cafe":
      return "Cafe";
    case "Bistro":
    case "Grill":
    case "Seafood":
      return "French";
    case "Mediterranean":
      return "Italian";
    case "Ramen":
      return "Japanese";
    default:
      // どこにも当てはまらない場合はカフェに寄せる
      return "Cafe";
  }
}
