"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { MapRestaurant } from "./mapTypes";

type RestaurantSheetProps = {
  restaurant: MapRestaurant | null;
  saved?: boolean;
  onAddLiked?: () => void;
  onAddFavorite?: () => void;
  onRemove?: () => void;
};

const PLACES_FETCH_TIMEOUT_MS = 5_000;

export default function RestaurantSheet({
  restaurant,
  saved = false,
  onAddLiked,
  onAddFavorite,
  onRemove,
}: RestaurantSheetProps) {
  const [gallery, setGallery] = useState<string[]>([]);

  useEffect(() => {
    if (!restaurant) {
      setGallery([]);
      return;
    }

    const homeId = restaurant.homeId ?? Number(restaurant.id);
    const photoQuery = Number.isFinite(homeId)
      ? `homeId=${homeId}`
      : restaurant.id
        ? `placeId=${encodeURIComponent(restaurant.id)}`
        : "";
    if (!photoQuery) {
      setGallery([]);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), PLACES_FETCH_TIMEOUT_MS);

    setGallery([]);

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
        // タイムアウト・失敗時は写真なし（サンプルは出さない）
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [restaurant]);

  const heroSrc = gallery[0];

  return (
    <AnimatePresence>
      {restaurant ? (
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-30 rounded-t-3xl bg-[#f8f6f1] p-4 shadow-2xl"
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          exit={{ y: 300 }}
          transition={{ type: "spring", stiffness: 240, damping: 28 }}
        >
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" />
          <div className="flex gap-4">
            {heroSrc ? (
              <img
                alt={restaurant.name}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                draggable={false}
                src={heroSrc}
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tracking-wide text-[#1f6f54]">
                {restaurant.category ?? "Restaurant"}
              </p>
              <h3 className="mt-1 font-brand text-2xl leading-tight text-[#1c1c1c]">
                {restaurant.name}
              </h3>
              <p className="mt-1 text-sm text-[#6b7280]">{restaurant.location}</p>
              {restaurant.rating > 0 ? (
                <p className="mt-2 text-sm font-medium text-[#0f3d2e]">★ {restaurant.rating.toFixed(1)}</p>
              ) : null}
            </div>
          </div>
          {gallery.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.slice(0, 5).map((src, i) => (
                <img
                  alt=""
                  className="h-16 w-24 shrink-0 rounded-xl object-cover"
                  draggable={false}
                  key={`${restaurant.id}-ms-${i}`}
                  src={src}
                />
              ))}
            </div>
          ) : null}
          {saved && onRemove ? (
            <button
              className="mt-4 w-full rounded-full border border-[#c4b2a8] px-4 py-3 text-sm font-semibold text-[#8a5a4a] active:bg-[#f3ebe6]"
              onClick={onRemove}
              type="button"
            >
              削除
            </button>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="rounded-full border border-[#1f6f54] px-3 py-3 text-sm font-semibold text-[#1f6f54] active:bg-[#1f6f54]/10"
                onClick={onAddLiked}
                type="button"
              >
                Likedに追加
              </button>
              <button
                className="rounded-full bg-[#1f6f54] px-3 py-3 text-sm font-semibold text-white active:bg-[#164a3a]"
                onClick={onAddFavorite}
                type="button"
              >
                お気に入りに追加
              </button>
            </div>
          )}
          {(restaurant.websiteUrl?.trim() || restaurant.googleMapsUrl?.trim()) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {restaurant.websiteUrl?.trim() ? (
                <a
                  className="inline-flex items-center rounded-full bg-[#0f3d2e] px-3 py-1.5 text-xs font-semibold text-white active:bg-[#1f6f54]"
                  href={restaurant.websiteUrl.trim()}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  公式サイト
                </a>
              ) : null}
              {restaurant.googleMapsUrl?.trim() ? (
                <a
                  className="inline-flex items-center rounded-full border border-[#0f3d2e] bg-transparent px-3 py-1.5 text-xs font-semibold text-[#0f3d2e] active:bg-[#0f3d2e]/10"
                  href={restaurant.googleMapsUrl.trim()}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Googleマップ
                </a>
              ) : null}
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
