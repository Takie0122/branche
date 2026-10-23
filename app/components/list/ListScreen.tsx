"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRestaurants, type Restaurant } from "../../contexts/LikedRestaurantsContext";
import {
  CUISINE_CATEGORIES,
  mapCuisineToCategory,
  type CuisineCategory,
} from "../../data/cuisineCategories";
import RestaurantDetailScreen from "../restaurant/RestaurantDetailScreen";

type ListSegment = "liked" | "favorite";
type GenreFilter = "all" | "other" | CuisineCategory;

const CUISINE_LABEL_JA: Record<CuisineCategory, string> = {
  Italian: "イタリアン",
  Japanese: "和食",
  Chinese: "中華",
  Cafe: "カフェ",
  French: "フレンチ",
};

export default function ListScreen() {
  const [segment, setSegment] = useState<ListSegment>("liked");
  const [genre, setGenre] = useState<GenreFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { likedRestaurants, toggleFavoriteRestaurant, unlikeRestaurant, fillRestaurantDetails } =
    useRestaurants();

  const items = useMemo(
    () =>
      likedRestaurants.filter((restaurant) =>
        segment === "favorite" ? restaurant.favorited : restaurant.liked && !restaurant.favorited,
      ),
    [likedRestaurants, segment],
  );

  const counts = useMemo(() => {
    const next: Record<CuisineCategory, number> = {
      Italian: 0,
      Japanese: 0,
      Chinese: 0,
      Cafe: 0,
      French: 0,
    };
    for (const restaurant of items) {
      const mapped = mapCuisineToCategory(restaurant.cuisineType);
      if (mapped) {
        next[mapped] += 1;
      }
    }
    return next;
  }, [items]);

  const visibleGenres = CUISINE_CATEGORIES.filter((cuisine) => counts[cuisine] > 0);
  const otherRestaurants = useMemo(
    () => items.filter((restaurant) => mapCuisineToCategory(restaurant.cuisineType) == null),
    [items],
  );

  useEffect(() => {
    const missing = likedRestaurants.filter(
      (restaurant) => !restaurant.cuisineType?.trim() && !Number.isFinite(Number(restaurant.id)),
    );
    if (missing.length === 0) {
      return;
    }
    let cancelled = false;
    void (async () => {
      await Promise.all(
        missing.map(async (restaurant) => {
          try {
            const res = await fetch(
              `/api/places/details?placeId=${encodeURIComponent(restaurant.id)}`,
            );
            if (!res.ok || cancelled) {
              return;
            }
            const data = (await res.json()) as {
              description?: string;
              cuisineType?: string;
              priceRange?: string;
              rating?: string;
              openingHours?: string;
              websiteUrl?: string;
            };
            if (!cancelled) {
              fillRestaurantDetails(restaurant.id, data);
            }
          } catch {
            // ジャンルが取れない店はその他のまま
          }
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [fillRestaurantDetails, likedRestaurants]);

  useEffect(() => {
    if (genre === "other") {
      if (otherRestaurants.length === 0) {
        setGenre("all");
      }
      return;
    }
    if (genre !== "all" && counts[genre] === 0) {
      setGenre("all");
    }
  }, [counts, genre, otherRestaurants.length]);

  const groups = useMemo(() => {
    const genres = genre === "all" ? visibleGenres : genre === "other" ? [] : [genre];
    const next = genres
      .map((cuisine) => ({
        key: cuisine,
        label: CUISINE_LABEL_JA[cuisine],
        restaurants: items.filter((restaurant) => mapCuisineToCategory(restaurant.cuisineType) === cuisine),
      }))
      .filter((group) => group.restaurants.length > 0);
    if ((genre === "all" || genre === "other") && otherRestaurants.length > 0) {
      next.push({ key: "other", label: "その他", restaurants: otherRestaurants });
    }
    return next;
  }, [genre, items, otherRestaurants, visibleGenres]);

  const selected = selectedId
    ? (likedRestaurants.find((restaurant) => restaurant.id === selectedId) ?? null)
    : null;

  if (selected) {
    return (
      <div className="h-full">
        <RestaurantDetailScreen
          onBack={() => setSelectedId(null)}
          onToggleFavorite={(id) => {
            const result = toggleFavoriteRestaurant(id);
            if (!result.success && result.message) {
              window.alert(result.message);
            }
          }}
          restaurant={selected}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0e1210]">
      <header className="shrink-0 px-5 pb-1 pt-5">
        <h1 className="font-brand text-3xl font-medium text-[#e8efe6]">List</h1>
        <p className="mt-1 text-sm text-[#8a9688]">
          {items.length === 0
            ? "残した店がここに並びます"
            : genre === "all"
              ? `${items.length} 件をジャンルごとに`
              : genre === "other"
                ? `その他 ${otherRestaurants.length} 件`
                : `${CUISINE_LABEL_JA[genre]} ${groups.reduce((total, group) => total + group.restaurants.length, 0)} 件`}
        </p>
      </header>

      <div className="shrink-0 px-4 pb-3 pt-3">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/8 bg-[#161d18] p-1.5">
          {(["liked", "favorite"] as const).map((tab) => {
            const isActive = segment === tab;
            return (
              <button
                className={`relative rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  isActive ? "text-[#0e1210]" : "text-[#6f7a70]"
                }`}
                key={tab}
                onClick={() => setSegment(tab)}
                type="button"
              >
                <span className="relative z-10">{tab === "liked" ? "Liked" : "Favorite"}</span>
                {isActive ? (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#a8b89a]"
                    layoutId="list-segment"
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <GenreChip active={genre === "all"} label="すべて" onClick={() => setGenre("all")} />
          {visibleGenres.map((cuisine) => (
            <GenreChip
              active={genre === cuisine}
              count={counts[cuisine]}
              key={cuisine}
              label={CUISINE_LABEL_JA[cuisine]}
              onClick={() => setGenre(cuisine)}
            />
          ))}
          {otherRestaurants.length > 0 ? (
            <GenreChip
              active={genre === "other"}
              count={otherRestaurants.length}
              label="その他"
              onClick={() => setGenre("other")}
            />
          ) : null}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-[#161d18] px-5 py-8 text-sm leading-relaxed text-[#8a9688]">
            {segment === "liked"
              ? "まだ残した店がありません。ホームで右にスワイプすると、ここに並びます。"
              : "お気に入りはまだありません。体験してよかった店を Favorite にすると、ここに残ります。"}
          </div>
        ) : (
          <div className="space-y-5" key={`${segment}-${genre}`}>
            {groups.map((group) => (
              <section key={group.key}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <h2 className="text-xs font-medium tracking-[0.16em] text-[#a8b89a]">
                    {group.label}
                  </h2>
                  <span className="text-[11px] text-[#6f7a70]">{group.restaurants.length}</span>
                </div>
                <ul className="space-y-2">
                  {group.restaurants.map((restaurant) => (
                    <li key={restaurant.id}>
                      <RestaurantRow
                        onDelete={() => unlikeRestaurant(restaurant.id)}
                        onOpen={() => setSelectedId(restaurant.id)}
                        restaurant={restaurant}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GenreChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-[#a8b89a] text-[#0e1210]" : "bg-[#161d18] text-[#8a9688]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
      {typeof count === "number" ? <span className="ml-1.5 opacity-70">{count}</span> : null}
    </button>
  );
}

function RowPhoto({ restaurant }: { restaurant: Restaurant }) {
  const [failed, setFailed] = useState(false);
  const homeId = Number(restaurant.id);
  const src = Number.isFinite(homeId)
    ? `/api/places/photo?homeId=${homeId}&index=0`
    : `/api/places/photo?placeId=${encodeURIComponent(restaurant.id)}&index=0`;

  if (failed) {
    return null;
  }

  return (
    <img
      alt=""
      className="h-12 w-12 shrink-0 rounded-xl bg-[#0e1210] object-cover"
      draggable={false}
      onError={() => setFailed(true)}
      src={src}
    />
  );
}

function RestaurantRow({
  restaurant,
  onOpen,
  onDelete,
}: {
  restaurant: Restaurant;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-[#161d18] py-2 pl-2 pr-2">
      <RowPhoto restaurant={restaurant} />
      <button className="min-w-0 flex-1 py-1 text-left" onClick={onOpen} type="button">
        <span className="block truncate text-sm font-medium text-[#e8efe6]">{restaurant.name}</span>
        <span className="mt-0.5 block truncate text-xs text-[#8a9688]">
          {restaurant.location || "場所未設定"}
        </span>
      </button>
      <button
        className="shrink-0 rounded-full px-3 py-2 text-xs font-medium text-[#c4b2a8] active:bg-white/5"
        onClick={onDelete}
        type="button"
      >
        削除
      </button>
    </div>
  );
}
