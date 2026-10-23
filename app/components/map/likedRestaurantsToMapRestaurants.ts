import type { Restaurant } from "../../contexts/LikedRestaurantsContext";
import { getHomeRestaurantDetailById } from "../../data/homeRestaurants";
import {
  buildGoogleMapsPlaceSearchUrl,
  resolveHomeGoogleMapsUrl,
  resolveHomeWebsiteUrl,
} from "../../lib/venueDisplay";
import type { MapRestaurant } from "./mapTypes";

function likedRestaurantToMapRestaurant(r: Restaurant): MapRestaurant | null {
  const detail = getHomeRestaurantDetailById(r.id);
  const lat = r.lat ?? detail?.lat;
  const lng = r.lng ?? detail?.lng;
  if (lat == null || lng == null) {
    return null;
  }

  const ratingFromR = Number.parseFloat(r.rating ?? "");
  const rating = Number.isFinite(ratingFromR)
    ? ratingFromR
    : Number.parseFloat(detail?.rating ?? "0") || 0;

  const websiteUrl = r.websiteUrl ?? (detail ? resolveHomeWebsiteUrl(detail) : undefined);
  const googleMapsUrl =
    r.googleMapsUrl ??
    (detail
      ? resolveHomeGoogleMapsUrl(detail)
      : buildGoogleMapsPlaceSearchUrl({ title: r.name, location: r.location }));

  const homeId = Number(r.id);
  return {
    id: r.id,
    name: r.name,
    location: r.location,
    lat,
    lng,
    /** サンプル画像は使わない。表示は RestaurantSheet が Places API から取得 */
    image: "",
    images: [],
    ...(Number.isFinite(homeId) ? { homeId } : {}),
    websiteUrl,
    googleMapsUrl,
    rating,
    category: r.cuisineType ?? detail?.cuisineType,
  };
}

export function likedRestaurantsToMapRestaurants(restaurants: Restaurant[]): MapRestaurant[] {
  const out: MapRestaurant[] = [];
  for (const r of restaurants) {
    const mapped = likedRestaurantToMapRestaurant(r);
    if (mapped) {
      out.push(mapped);
    }
  }
  return out;
}
