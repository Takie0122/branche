import type { HomeRestaurantDetail } from "../data/homeRestaurants";

/**
 * 明示的に持っている写真のみ返す。サンプル（Unsplash）での補完はしない。
 * Places 写真は各画面が `/api/places/photo` から取得する。
 */
export function getHomeGalleryImages(r: HomeRestaurantDetail): string[] {
  if (r.images?.length) {
    return r.images.filter((url) => Boolean(url?.trim()) && !url.includes("images.unsplash.com"));
  }
  return [];
}

export function resolveHomeWebsiteUrl(r: HomeRestaurantDetail): string | undefined {
  const u = r.websiteUrl?.trim();
  return u || undefined;
}

/**
 * 店舗ページ（検索結果の該当施設）を開く。座標だけの「地点」ではなく名前ベースで解決する。
 * `googlePlaceId` があるときは Places の query_place_id を付与。
 */
export function buildGoogleMapsPlaceSearchUrl(params: {
  title: string;
  location: string;
  googlePlaceId?: string;
}): string {
  const title = params.title.trim();
  const location = params.location.trim();
  const pid = params.googlePlaceId?.trim();
  if (pid) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title)}&query_place_id=${encodeURIComponent(pid)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title} ${location}`)}`;
}

/** 未指定時は店名＋住所（または place_id）で Google マップ検索へ */
export function resolveHomeGoogleMapsUrl(r: HomeRestaurantDetail): string {
  const u = r.googleMapsUrl?.trim();
  if (u) return u;
  return buildGoogleMapsPlaceSearchUrl({
    title: r.title,
    location: r.location,
    googlePlaceId: r.googlePlaceId,
  });
}
