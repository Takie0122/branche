"use client";

import { useEffect, useState } from "react";
import type { Restaurant } from "../contexts/LikedRestaurantsContext";

type RestaurantCardProps = {
  restaurant: Restaurant;
  onRemoveFromFavorites?: (id: string) => void;
  onRemoveFromLiked?: (id: string) => void;
};

function isSampleImageUrl(url: string | undefined): boolean {
  return Boolean(url?.includes("images.unsplash.com"));
}

export default function RestaurantCard({
  restaurant,
  onRemoveFromFavorites,
  onRemoveFromLiked,
}: RestaurantCardProps) {
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);

  useEffect(() => {
    const homeId = Number(restaurant.id);
    if (!Number.isFinite(homeId)) {
      setPhotoSrc(null);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5_000);

    void (async () => {
      try {
        const cfgRes = await fetch("/api/places/config", { signal: controller.signal });
        const cfg = (await cfgRes.json()) as { googlePlacesPhotosEnabled?: boolean };
        if (cancelled || !cfg.googlePlacesPhotosEnabled) {
          return;
        }
        const attrRes = await fetch(`/api/places/photo-attributions?homeId=${homeId}`, {
          signal: controller.signal,
        });
        if (cancelled || !attrRes.ok) {
          return;
        }
        const j = (await attrRes.json()) as { photos?: unknown[] };
        if (cancelled || !j.photos?.length) {
          return;
        }
        setPhotoSrc(`/api/places/photo?homeId=${homeId}&index=0`);
      } catch {
        // サンプルは出さない
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [restaurant.id]);

  const displaySrc =
    photoSrc ??
    (restaurant.image && !isSampleImageUrl(restaurant.image) ? restaurant.image : null);

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#161d18] p-3">
      {displaySrc ? (
        <img
          alt={restaurant.name}
          className="h-16 w-16 rounded-xl object-cover"
          draggable={false}
          src={displaySrc}
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#1a221c] text-[9px] text-[#6f7a70]">
          No photo
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-brand text-xl text-[#e8efe6]">{restaurant.name}</h3>
        <p className="truncate text-sm text-[#8a9688]">{restaurant.location || "Location unavailable"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onRemoveFromFavorites ? (
          <button
            className="rounded-full border border-white/20 bg-transparent px-3 py-1.5 text-xs font-medium text-[#a8b89a] transition-colors active:bg-white/5"
            onClick={() => onRemoveFromFavorites(restaurant.id)}
            type="button"
          >
            Remove
          </button>
        ) : null}
        {onRemoveFromLiked ? (
          <button
            className="rounded-full border border-white/20 bg-transparent px-3 py-1.5 text-xs font-medium text-[#a8b89a] transition-colors active:bg-white/5"
            onClick={() => onRemoveFromLiked(restaurant.id)}
            type="button"
          >
            Remove
          </button>
        ) : null}
      </div>
    </article>
  );
}
