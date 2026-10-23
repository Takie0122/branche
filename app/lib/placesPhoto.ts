import { unstable_cache } from "next/cache";
import { getHomeRestaurantDetailById } from "@/app/data/homeRestaurants";

/** サーバー専用。クライアントに出さないこと。 */
export function getPlacesApiKey(): string {
  return (
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    ""
  );
}

export function isPlacesPhotoConfigured(): boolean {
  return Boolean(getPlacesApiKey());
}

/** Google Places から取得する写真枚数 */
export const MAX_PLACE_PHOTOS = 5;

const MAX_PLACE_DISTANCE_METERS = 3_000;

const FOOD_PLACE_TYPES = new Set([
  "restaurant",
  "food",
  "cafe",
  "bar",
  "bakery",
  "meal_takeaway",
  "meal_delivery",
]);

function normalizeAsciiText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .toLowerCase();
}

function normalizePlaceName(value: string): string {
  return normalizeAsciiText(value)
    .replace(/\s+/g, "")
    .replace(/[・\-‐‑–—&®'’]/g, "")
    .replace(/[（）()]/g, "")
    .replace(/(本店|支店|店)$/g, "");
}

function isFoodPlace(types: string[] | undefined): boolean {
  return (types ?? []).some((type) => FOOD_PLACE_TYPES.has(type));
}

function extractNameTokens(title: string): string[] {
  const tokens = title
    .split(/[\s　・\-‐‑–—]+/)
    .map((part) => normalizePlaceName(part))
    .filter((part) => part.length >= 2 && !["the", "and", "de", "da", "le", "la"].includes(part));
  const normalized = normalizePlaceName(title);
  return tokens.length > 0 ? tokens : normalized ? [normalized] : [];
}

const ROMANIZATION_HINTS: readonly [string, string][] = [
  ["てんぷら", "tempura"],
  ["山の上", "yamanoue"],
  ["とんかつ", "tonkatsu"],
  ["まい泉", "maisen"],
  ["すきやばし", "sukiyabashi"],
  ["次郎", "jiro"],
  ["鮨", "sushi"],
  ["寿司", "sushi"],
  ["焼鳥", "yakitori"],
  ["焼き鳥", "yakitori"],
  ["おみ乃", "omino"],
  ["聘珍樓", "manchinro"],
  ["四川", "sichuan"],
  ["四川", "szechuan"],
  ["四川飯店", "shisen"],
  ["状元樓", "jogenro"],
  ["カンテサンス", "quintessence"],
  ["エスキス", "esquisse"],
  ["レフェルヴェソンス", "effervescence"],
  ["ベージュ", "beige"],
  ["デュカス", "ducasse"],
  ["玄蕎麦", "soba"],
  ["野中", "nonaka"],
  ["添好运", "timho"],
  ["ティム", "tim"],
  ["ホーワン", "howan"],
  ["燕記", "enki"],
  ["鳥しき", "torishiki"],
  ["王龍", "oryu"],
  ["ピッコロ", "piccolo"],
  ["ボッソ", "bosso"],
  ["ピッツェリア", "pizzeria"],
  ["オービカ", "obica"],
  ["モッツァレラ", "mozzarella"],
  ["聘珍", "manchin"],
  ["萬珍", "manchin"],
];

function extractLatinTokens(value: string): string[] {
  return (value.match(/[a-zA-Z0-9]{2,}/g) ?? [])
    .map((token) => token.toLowerCase())
    .filter((token) => !["the", "and", "de", "da", "le", "la"].includes(token));
}

function isExactPlaceNameMatch(expectedTitle: string, candidateName: string): boolean {
  const expectedNorm = normalizePlaceName(expectedTitle);
  const candidateNorm = normalizePlaceName(candidateName);
  if (!expectedNorm || !candidateNorm) {
    return false;
  }
  if (expectedNorm === candidateNorm) {
    return true;
  }
  // 候補側が長い（英語併記・支店名付き）で期待名を含む → OK
  if (candidateNorm.includes(expectedNorm)) {
    return true;
  }
  // 期待側が候補を含むのは、候補が十分長い場合のみ（「フェリーチェ」だけで別店に落ちない）
  if (expectedNorm.includes(candidateNorm)) {
    return candidateNorm.length >= Math.max(8, Math.ceil(expectedNorm.length * 0.55));
  }
  return false;
}

function tokenMatchesCandidate(token: string, candidateNorm: string): boolean {
  if (candidateNorm.includes(token)) {
    return true;
  }
  // このトークン自体がローマ字ヒントの日本語側と対応する場合のみ
  return ROMANIZATION_HINTS.some(([japanese, latin]) => {
    const jpNorm = normalizePlaceName(japanese);
    if (!jpNorm) {
      return false;
    }
    const tokenHitsJp = token === jpNorm || token.includes(jpNorm) || jpNorm.includes(token);
    return tokenHitsJp && candidateNorm.includes(latin);
  });
}

function isPlaceNameMatch(expectedTitle: string, candidateName: string): boolean {
  // 支店食い違いは部分一致より先に判定
  if (hasBranchConflict(expectedTitle, candidateName)) {
    return false;
  }
  if (isExactPlaceNameMatch(expectedTitle, candidateName)) {
    return true;
  }

  const candidateNorm = normalizePlaceName(candidateName);
  const tokens = extractNameTokens(expectedTitle).filter((token) => token.length >= 2);
  const matched = tokens.filter((token) => tokenMatchesCandidate(token, candidateNorm));

  // 2語以上なら全トークン一致を要求（「コントワール」だけで別店「…ミサゴ」等に落ちないように）
  if (tokens.length >= 2) {
    return matched.length === tokens.length;
  }

  // 主要トークンが1語だけの店名
  const significant = tokens.filter((token) => token.length >= 3);
  if (significant.length === 1 && matched.includes(significant[0])) {
    const token = significant[0];
    // 候補名がトークンより大幅に長い＝別ブランドの可能性
    if (candidateNorm.length > token.length * 2.5) {
      return false;
    }
    return true;
  }

  const expectedLatin = extractLatinTokens(expectedTitle);
  const candidateLatin = extractLatinTokens(candidateName);
  if (expectedLatin.length > 0) {
    const overlap = expectedLatin.filter((token) =>
      candidateLatin.some(
        (candidateToken) => candidateToken.includes(token) || token.includes(candidateToken),
      ),
    );
    const required = expectedLatin.length === 1 ? 1 : Math.min(2, expectedLatin.length);
    if (overlap.length >= required) {
      return true;
    }
  }

  return false;
}

/** 支店名・店舗サフィックスが食い違う場合は別店扱い */
function hasBranchConflict(expectedTitle: string, candidateName: string): boolean {
  const markers = [
    "渋谷",
    "原宿",
    "銀座",
    "六本木",
    "表参道",
    "青山",
    "新宿",
    "恵比寿",
    "迎賓館",
    "総本",
    "息子",
    "麻布",
    "広尾",
    "白金",
    "中目黒",
    "横浜",
    "赤坂",
    "飯倉",
    "ginza",
    "roppongi",
    "shibuya",
    "shinjuku",
    "harajuku",
  ];
  const expectedLower = expectedTitle.toLowerCase();
  const candidateLower = candidateName.toLowerCase();
  const expectedHits = markers.filter((m) => expectedLower.includes(m.toLowerCase()));
  const candidateHits = markers.filter((m) => candidateLower.includes(m.toLowerCase()));

  // 「本店」指定なのに候補が別エリア表記 → 別店
  if (expectedTitle.includes("本店")) {
    const extraAreas = candidateHits.filter((m) => !expectedHits.includes(m));
    if (extraAreas.length > 0) {
      return true;
    }
  }

  // シードが支店を指定しているのに、候補にその支店語が無い → 別店
  if (expectedHits.length > 0 && !expectedHits.every((m) => candidateLower.includes(m.toLowerCase()))) {
    const missing = expectedHits.filter((m) => !candidateLower.includes(m.toLowerCase()));
    if (missing.length > 0) {
      return true;
    }
  }
  if (expectedHits.length === 0 || candidateHits.length === 0) {
    return false;
  }
  return !expectedHits.some((m) => candidateHits.includes(m));
}

function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

type PlaceCandidate = {
  place_id?: string;
  name?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
};

type PlaceDetailsSummary = {
  name?: string;
  formatted_address?: string;
  types?: string[];
};

function getCandidateDistance(
  lat: number,
  lng: number,
  candidate: PlaceCandidate,
): number | null {
  const candidateLat = candidate.geometry?.location?.lat;
  const candidateLng = candidate.geometry?.location?.lng;
  if (typeof candidateLat !== "number" || typeof candidateLng !== "number") {
    return null;
  }
  return distanceMeters(lat, lng, candidateLat, candidateLng);
}

async function fetchPlaceDetailsSummary(
  placeId: string,
  apiKey: string,
): Promise<PlaceDetailsSummary | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=formatted_address,types,name&language=ja&key=${apiKey}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    result?: PlaceDetailsSummary;
  };
  if (data.status !== "OK" || !data.result) {
    return null;
  }
  return data.result;
}

async function resolvePlaceIdFromCandidate(
  title: string,
  location: string,
  lat: number,
  lng: number,
  candidate: PlaceCandidate,
  apiKey: string,
): Promise<string | null> {
  if (!candidate.place_id) {
    return null;
  }

  const distance = getCandidateDistance(lat, lng, candidate);
  if (distance !== null && distance > MAX_PLACE_DISTANCE_METERS) {
    return null;
  }

  const candidateName = candidate.name ?? "";
  if (candidateName && isPlaceNameMatch(title, candidateName)) {
    if (distance === null || distance <= MAX_PLACE_DISTANCE_METERS) {
      return candidate.place_id;
    }
  }

  // Details（日本語名）で店名一致する場合のみ採用。住所だけで別店を拾わない
  const details = await fetchPlaceDetailsSummary(candidate.place_id, apiKey);
  if (!details || !isFoodPlace(details.types)) {
    return null;
  }

  const detailName = details.name ?? "";
  if (detailName && isPlaceNameMatch(title, detailName)) {
    if (distance === null || distance <= MAX_PLACE_DISTANCE_METERS) {
      return candidate.place_id;
    }
  }

  return null;
}

async function pickValidatedCandidate(
  title: string,
  location: string,
  lat: number,
  lng: number,
  candidates: PlaceCandidate[],
  apiKey: string,
): Promise<string | null> {
  for (const candidate of candidates) {
    const placeId = await resolvePlaceIdFromCandidate(title, location, lat, lng, candidate, apiKey);
    if (placeId) {
      return placeId;
    }
  }
  return null;
}

function titleQueryVariants(title: string, location: string): string[] {
  const trimmed = title.trim();
  const withoutBranch = trimmed.replace(/\s*(本店|支店)$/u, "").trim();
  const ward = location.match(/東京都([^\d]+?[区市])/)?.[1] ?? "";
  const variants = [
    `${trimmed} ${location}`,
    trimmed,
    withoutBranch !== trimmed ? `${withoutBranch} ${location}` : "",
    ward ? `${trimmed} ${ward}` : "",
    ward && withoutBranch !== trimmed ? `${withoutBranch} ${ward}` : "",
  ].filter(Boolean);
  return [...new Set(variants)];
}

async function findPlaceFromTextVariants(
  title: string,
  location: string,
  lat: number,
  lng: number,
  apiKey: string,
): Promise<PlaceCandidate[]> {
  const bias = encodeURIComponent(`circle:800@${lat},${lng}`);
  const out: PlaceCandidate[] = [];
  const seen = new Set<string>();

  for (const query of titleQueryVariants(title, location)) {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,geometry&language=ja&locationbias=${bias}&key=${apiKey}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: string;
      candidates?: PlaceCandidate[];
    };
    for (const candidate of data.candidates ?? []) {
      if (!candidate.place_id || seen.has(candidate.place_id)) {
        continue;
      }
      seen.add(candidate.place_id);
      out.push(candidate);
    }
    if (out.length >= 8) {
      break;
    }
  }
  return out;
}

async function findPlaceFromTextSearch(
  title: string,
  location: string,
  lat: number,
  lng: number,
  apiKey: string,
): Promise<PlaceCandidate[]> {
  const results: PlaceCandidate[] = [];
  const seen = new Set<string>();
  for (const query of titleQueryVariants(title, location).slice(0, 3)) {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=2000&language=ja&key=${apiKey}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      status: string;
      results?: PlaceCandidate[];
    };
    for (const candidate of data.results ?? []) {
      if (!candidate.place_id || seen.has(candidate.place_id)) {
        continue;
      }
      seen.add(candidate.place_id);
      results.push(candidate);
    }
  }
  return results;
}

async function findPlaceFromNearby(
  title: string,
  lat: number,
  lng: number,
  apiKey: string,
): Promise<PlaceCandidate[]> {
  const keyword = encodeURIComponent(title.replace(/\s*(本店|支店)$/u, "").trim());
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&keyword=${keyword}&language=ja&key=${apiKey}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results?: PlaceCandidate[];
  };
  return data.results ?? [];
}

async function findPlaceId(
  title: string,
  location: string,
  lat: number,
  lng: number,
  explicit: string | undefined,
  apiKey: string,
): Promise<string | null> {
  if (explicit) {
    return explicit;
  }

  const fromText = await findPlaceFromTextVariants(title, location, lat, lng, apiKey);
  const resolvedText = await pickValidatedCandidate(title, location, lat, lng, fromText, apiKey);
  if (resolvedText) {
    return resolvedText;
  }

  const fromSearch = await findPlaceFromTextSearch(title, location, lat, lng, apiKey);
  const resolvedSearch = await pickValidatedCandidate(
    title,
    location,
    lat,
    lng,
    fromSearch.slice(0, 8),
    apiKey,
  );
  if (resolvedSearch) {
    return resolvedSearch;
  }

  const fromNearby = await findPlaceFromNearby(title, lat, lng, apiKey);
  return pickValidatedCandidate(title, location, lat, lng, fromNearby.slice(0, 8), apiKey);
}

export type PlacePhotoMeta = {
  photoReference: string;
  htmlAttributions: string[];
};

async function fetchPlacePhotosMeta(
  placeId: string,
  apiKey: string,
): Promise<PlacePhotoMeta[] | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=photos&language=ja&key=${apiKey}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    result?: {
      photos?: { photo_reference: string; html_attributions?: string[] }[];
    };
  };
  if (data.status !== "OK" || !data.result?.photos?.length) {
    return null;
  }
  return data.result.photos.slice(0, MAX_PLACE_PHOTOS).map((p) => ({
    photoReference: p.photo_reference,
    htmlAttributions: p.html_attributions ?? [],
  }));
}

const getPlacePhotosMetaCached = unstable_cache(
  async (homeId: number) => {
    const apiKey = getPlacesApiKey();
    if (!apiKey) {
      return null;
    }
    const row = getHomeRestaurantDetailById(String(homeId));
    if (!row) {
      return null;
    }
    const placeId = await findPlaceId(
      row.title,
      row.location,
      row.lat,
      row.lng,
      row.googlePlaceId,
      apiKey,
    );
    if (!placeId) {
      return null;
    }
    return fetchPlacePhotosMeta(placeId, apiKey);
  },
  ["branche-place-photos-meta-v15"],
  { revalidate: 60 * 60 * 24 * 14 },
);

export async function getPlacePhotosMetaForHomeId(homeId: number) {
  return getPlacePhotosMetaCached(homeId);
}

const getPlacePhotosMetaByPlaceIdCached = unstable_cache(
  async (placeId: string) => {
    const apiKey = getPlacesApiKey();
    if (!apiKey || !placeId) {
      return null;
    }
    return fetchPlacePhotosMeta(placeId, apiKey);
  },
  ["branche-place-photos-meta-by-placeid-v1"],
  { revalidate: 60 * 60 * 24 * 14 },
);

/** Google place_id から写真メタを取得（開始前お気に入り登録用） */
export async function getPlacePhotosMetaForPlaceId(placeId: string) {
  return getPlacePhotosMetaByPlaceIdCached(placeId);
}

/** @deprecated 互換のため。先頭1枚分のみ。 */
export async function getPlacePhotoMetaForHomeId(homeId: number) {
  const photos = await getPlacePhotosMetaForHomeId(homeId);
  const first = photos?.[0];
  return first ?? null;
}
