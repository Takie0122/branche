"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRestaurants, type Restaurant } from "../../contexts/LikedRestaurantsContext";
import { getHomeRestaurantDetailById } from "../../data/homeRestaurants";
import {
  buildGoogleMapsPlaceSearchUrl,
  resolveHomeGoogleMapsUrl,
  resolveHomeWebsiteUrl,
} from "../../lib/venueDisplay";

type RestaurantDetailScreenProps = {
  restaurant: Restaurant;
  onBack: () => void;
  onToggleFavorite?: (id: string) => void;
};

const PLACES_FETCH_TIMEOUT_MS = 5_000;

export default function RestaurantDetailScreen({
  restaurant,
  onBack,
  onToggleFavorite,
}: RestaurantDetailScreenProps) {
  const { fillRestaurantDetails } = useRestaurants();
  const homeDetail = useMemo(() => getHomeRestaurantDetailById(restaurant.id), [restaurant.id]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [gallery, setGallery] = useState<string[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const placeId = homeDetail || Number.isFinite(Number(restaurant.id)) ? "" : restaurant.id;
  const [placeFacts, setPlaceFacts] = useState<{
    description: string;
    cuisineType: string;
    priceRange: string;
    rating: string;
    openingHours: string;
    websiteUrl: string;
  } | null>(null);
  const [factsLoading, setFactsLoading] = useState(false);

  useEffect(() => {
    if (!placeId) {
      setPlaceFacts(null);
      setFactsLoading(false);
      return;
    }
    let cancelled = false;
    setPlaceFacts(null);
    setFactsLoading(true);
    void (async () => {
      try {
        const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`);
        const data = (await res.json()) as {
          description?: string;
          cuisineType?: string;
          priceRange?: string;
          rating?: string;
          openingHours?: string;
          websiteUrl?: string;
        };
        if (cancelled || !res.ok) {
          return;
        }
        setPlaceFacts({
          description: data.description ?? "",
          cuisineType: data.cuisineType ?? "",
          priceRange: data.priceRange ?? "",
          rating: data.rating ?? "",
          openingHours: data.openingHours ?? "",
          websiteUrl: data.websiteUrl ?? "",
        });
      } catch {
        if (!cancelled) {
          setPlaceFacts(null);
        }
      } finally {
        if (!cancelled) {
          setFactsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  useEffect(() => {
    if (!placeId || !placeFacts) {
      return;
    }
    fillRestaurantDetails(restaurant.id, placeFacts);
  }, [fillRestaurantDetails, placeFacts, placeId, restaurant.id]);

  const description = restaurant.description ?? homeDetail?.description ?? placeFacts?.description ?? "";
  const cuisineType = restaurant.cuisineType ?? homeDetail?.cuisineType ?? placeFacts?.cuisineType ?? "";
  const priceRange = restaurant.priceRange ?? homeDetail?.priceRange ?? placeFacts?.priceRange ?? "";
  const rating = restaurant.rating ?? homeDetail?.rating ?? placeFacts?.rating ?? "";
  const openingHours = restaurant.openingHours ?? homeDetail?.openingHours ?? placeFacts?.openingHours ?? "";

  const websiteUrl =
    restaurant.websiteUrl ??
    (homeDetail ? resolveHomeWebsiteUrl(homeDetail) : undefined) ??
    (placeFacts?.websiteUrl || undefined);
  const googleMapsUrl = (() => {
    const saved = restaurant.googleMapsUrl?.trim();
    if (saved) return saved;
    if (homeDetail) return resolveHomeGoogleMapsUrl(homeDetail);
    const title = restaurant.name.trim();
    const loc = restaurant.location.trim();
    if (title && loc) {
      return buildGoogleMapsPlaceSearchUrl({
        title,
        location: loc,
        googlePlaceId: homeDetail?.googlePlaceId,
      });
    }
    if (typeof restaurant.lat === "number" && typeof restaurant.lng === "number") {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.lat},${restaurant.lng}`)}`;
    }
    return "";
  })();

  useEffect(() => {
    setPhotoIndex(0);
    const homeId = homeDetail?.id ?? Number(restaurant.id);
    const photoQuery = Number.isFinite(homeId)
      ? `homeId=${homeId}`
      : placeId
        ? `placeId=${encodeURIComponent(placeId)}`
        : "";
    if (!photoQuery) {
      setGallery([]);
      setLoadingPhotos(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), PLACES_FETCH_TIMEOUT_MS);
    setGallery([]);
    setLoadingPhotos(true);

    void (async () => {
      try {
        const cfgRes = await fetch("/api/places/config", { signal: controller.signal });
        const cfg = (await cfgRes.json()) as { googlePlacesPhotosEnabled?: boolean };
        if (cancelled || !cfg.googlePlacesPhotosEnabled) {
          return;
        }
        const attrRes = await fetch(`/api/places/photo-attributions?${photoQuery}`, {
          signal: controller.signal,
        });
        if (cancelled || !attrRes.ok) {
          return;
        }
        const j = (await attrRes.json()) as { photos?: unknown[] };
        const count = j.photos?.length ?? 0;
        if (cancelled || count === 0) {
          return;
        }
        setGallery(
          Array.from({ length: count }, (_, i) => `/api/places/photo?${photoQuery}&index=${i}`),
        );
      } catch {
        // サンプルは出さない
      } finally {
        if (!cancelled) {
          setLoadingPhotos(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [restaurant.id, homeDetail?.id, placeId]);

  const heroSrc = gallery[photoIndex];

  return (
    <motion.div
      className="flex h-full flex-col bg-[#f5f3ee]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="hide-scrollbar flex-1 overflow-y-auto">
        <div className="relative mx-4 mt-4 overflow-hidden rounded-2xl border border-white/40 bg-[#f8f6f1] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <button
            aria-label="Back"
            className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors active:bg-black/50"
            onClick={onBack}
            type="button"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {heroSrc ? (
              <img
                alt={restaurant.name}
                className="h-full w-full object-cover"
                draggable={false}
                src={heroSrc}
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-[#e8e3d9] text-sm text-[#9ca3af] ${
                  loadingPhotos ? "animate-pulse" : ""
                }`}
              >
                {loadingPhotos ? "…" : "No photo"}
              </div>
            )}
            {gallery.length > 1 ? (
              <div className="absolute bottom-3 left-3 right-3 z-10 flex gap-2">
                {gallery.map((src, i) => (
                  <button
                    className={`relative h-11 min-w-0 flex-1 overflow-hidden rounded-lg border-2 shadow-md transition-opacity ${
                      photoIndex === i ? "border-white opacity-100 ring-2 ring-white/50" : "border-white/40 opacity-80"
                    }`}
                    key={`${restaurant.id}-dg-${i}`}
                    onClick={() => setPhotoIndex(i)}
                    type="button"
                  >
                    <img alt="" className="h-full w-full object-cover" draggable={false} src={src} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="overflow-y-auto bg-[#faf8f3] px-5 py-4">
            <h2 className="font-brand text-2xl font-semibold tracking-tight text-[#1c1c1c]">
              {restaurant.name}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">
              {restaurant.location || "場所未設定"}
            </p>
            {cuisineType ? (
              <p className="mt-3 inline-flex rounded-full bg-[#ece7dc] px-3 py-1 text-xs font-medium text-[#0f3d2e]">
                {cuisineType}
              </p>
            ) : null}
            {description ? (
              <p className="text-sm leading-6 text-[#4b5563]">{description}</p>
            ) : factsLoading ? (
              <p className="text-sm leading-6 text-[#6b7280]">情報を読み込み中…</p>
            ) : null}

            {(websiteUrl?.trim() || googleMapsUrl) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {websiteUrl?.trim() ? (
                  <a
                    className="inline-flex items-center rounded-full bg-[#0f3d2e] px-3 py-1.5 text-xs font-semibold text-white active:bg-[#1f6f54]"
                    href={websiteUrl.trim()}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    公式サイト
                  </a>
                ) : null}
                {googleMapsUrl ? (
                  <a
                    className="inline-flex items-center rounded-full border border-[#0f3d2e] bg-transparent px-3 py-1.5 text-xs font-semibold text-[#0f3d2e] active:bg-[#0f3d2e]/10"
                    href={googleMapsUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Googleマップ
                  </a>
                ) : null}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-[#ece7dc] px-3 py-2">
                <p className="text-[#6b7280]">価格帯</p>
                <p className="mt-0.5 font-semibold text-[#0f3d2e]">
                  {priceRange || "未設定"}
                </p>
              </div>
              <div className="rounded-xl bg-[#ece7dc] px-3 py-2">
                <p className="text-[#6b7280]">評価</p>
                <p className="mt-0.5 font-semibold text-[#0f3d2e]">
                  ★ {rating || "未設定"}
                </p>
              </div>
              <div className="rounded-xl bg-[#ece7dc] px-3 py-2">
                <p className="text-[#6b7280]">ジャンル</p>
                <p className="mt-0.5 font-semibold text-[#0f3d2e]">
                  {cuisineType || "未設定"}
                </p>
              </div>
              <div className="rounded-xl bg-[#ece7dc] px-3 py-2">
                <p className="text-[#6b7280]">営業時間</p>
                <p className="mt-0.5 font-semibold text-[#0f3d2e]">
                  {openingHours || "未設定"}
                </p>
              </div>
            </div>

            {onToggleFavorite ? (
              <button
                className={`mt-6 w-full rounded-2xl py-3 text-sm font-semibold transition-colors ${
                  restaurant.favorited
                    ? "border-2 border-[#0f3d2e] bg-transparent text-[#0f3d2e] active:bg-[#0f3d2e]/10"
                    : "bg-[#1f6f54] text-white active:bg-[#2a7d60]"
                }`}
                onClick={() => onToggleFavorite(restaurant.id)}
                type="button"
              >
                {restaurant.favorited ? "Remove from Favorites" : "Add to Favorites"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
