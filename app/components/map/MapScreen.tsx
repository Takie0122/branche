"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRestaurants } from "../../contexts/LikedRestaurantsContext";
import { buildGoogleMapsPlaceSearchUrl } from "../../lib/venueDisplay";
import MapPlaceSearch, { type PlaceSearchHit } from "./MapPlaceSearch";
import type { MapRestaurant } from "./mapTypes";
import MapView from "./MapView";
import RestaurantSheet from "./RestaurantSheet";
import { likedRestaurantsToMapRestaurants } from "./likedRestaurantsToMapRestaurants";

export type MapDisplayMode = "liked" | "favorites";

const MAP_MODE_LABELS: Record<MapDisplayMode, string> = {
  liked: "いいね",
  favorites: "お気に入り",
};

export default function MapScreen() {
  const { likedRestaurants, addLikedRestaurant, addFavoriteRestaurant, unlikeRestaurant } = useRestaurants();
  /** 初期は「いいね」＝自分が保存した店のみ。リセット直後もピンが残らない */
  const [displayMode, setDisplayMode] = useState<MapDisplayMode>("liked");
  const [selectedRestaurant, setSelectedRestaurant] = useState<MapRestaurant | null>(null);
  const [focus, setFocus] = useState<{ id: string; lat: number; lng: number } | null>(null);

  const savedIds = useMemo(
    () =>
      new Set(
        likedRestaurants
          .filter((restaurant) => restaurant.liked || restaurant.favorited)
          .map((restaurant) => restaurant.id),
      ),
    [likedRestaurants],
  );

  const restaurants = useMemo(() => {
    const source = likedRestaurants.filter((restaurant) =>
      displayMode === "favorites" ? restaurant.favorited : restaurant.liked && !restaurant.favorited,
    );
    return likedRestaurantsToMapRestaurants(source);
  }, [displayMode, likedRestaurants]);

  const selectedForDisplay = useMemo(() => {
    if (!selectedRestaurant) {
      return null;
    }
    return restaurants.find((r) => r.id === selectedRestaurant.id) ?? selectedRestaurant;
  }, [restaurants, selectedRestaurant]);

  const mapRestaurants = useMemo(() => {
    if (!selectedRestaurant || restaurants.some((restaurant) => restaurant.id === selectedRestaurant.id)) {
      return restaurants;
    }
    return [...restaurants, selectedRestaurant];
  }, [restaurants, selectedRestaurant]);

  const emptyFiltered = restaurants.length === 0;

  function placeFromHit(hit: PlaceSearchHit): MapRestaurant {
    return {
      id: hit.placeId,
      name: hit.name,
      location: hit.address,
      lat: hit.lat,
      lng: hit.lng,
      googleMapsUrl: buildGoogleMapsPlaceSearchUrl({
        title: hit.name,
        location: hit.address,
        googlePlaceId: hit.placeId,
      }),
      rating: hit.rating ?? 0,
    };
  }

  function previewSearchedPlace(hit: PlaceSearchHit) {
    const restaurant = placeFromHit(hit);
    setSelectedRestaurant(restaurant);
    setFocus({ id: restaurant.id, lat: restaurant.lat, lng: restaurant.lng });
  }

  function selectedPlaceInput() {
    if (!selectedForDisplay) {
      return null;
    }
    return {
      id: selectedForDisplay.id,
      name: selectedForDisplay.name,
      location: selectedForDisplay.location,
      image: selectedForDisplay.image ?? "",
      lat: selectedForDisplay.lat,
      lng: selectedForDisplay.lng,
      ...(selectedForDisplay.rating > 0 ? { rating: String(selectedForDisplay.rating) } : {}),
      ...(selectedForDisplay.websiteUrl ? { websiteUrl: selectedForDisplay.websiteUrl } : {}),
      ...(selectedForDisplay.googleMapsUrl ? { googleMapsUrl: selectedForDisplay.googleMapsUrl } : {}),
      ...(selectedForDisplay.category ? { cuisineType: selectedForDisplay.category } : {}),
    };
  }

  function addSelectedAsLiked() {
    const input = selectedPlaceInput();
    if (!input || savedIds.has(input.id)) {
      return;
    }
    addLikedRestaurant(input);
    setDisplayMode("liked");
  }

  function addSelectedAsFavorite() {
    const input = selectedPlaceInput();
    if (!input || savedIds.has(input.id)) {
      return;
    }
    addFavoriteRestaurant(input);
    setDisplayMode("favorites");
  }

  function removeSelectedPlace() {
    if (!selectedForDisplay || !savedIds.has(selectedForDisplay.id)) {
      return;
    }
    unlikeRestaurant(selectedForDisplay.id);
    setSelectedRestaurant(null);
    setFocus(null);
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#ebe7dd] via-[#e5dfd3] to-[#ddd8cb]">
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-40 px-4 pt-3">
        <div className="pointer-events-auto rounded-[20px] border border-white/50 bg-[#faf8f3]/92 p-2 shadow-[0_12px_36px_-12px_rgba(15,61,46,0.18)] backdrop-blur-xl">
          <div className="relative flex gap-1.5">
            {(["liked", "favorites"] as const).map((mode) => {
              const isActive = displayMode === mode;
              return (
                <motion.button
                  className={`relative z-10 min-w-0 flex-1 rounded-full px-2 py-2.5 text-center text-xs font-semibold tracking-wide transition-colors ${
                    isActive ? "text-[#fbfbf7]" : "bg-[#e8e2d6]/85 text-[#5c6659] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
                  }`}
                  key={mode}
                  onClick={() => {
                    setDisplayMode(mode);
                    setSelectedRestaurant(null);
                  }}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {isActive ? (
                    <motion.span
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-[#2a8f6f] via-[#1f6f54] to-[#164a3a] shadow-[0_8px_24px_-6px_rgba(31,111,84,0.45)]"
                      layoutId="map-display-mode"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  ) : null}
                  <span className="relative z-10">{MAP_MODE_LABELS[mode]}</span>
                </motion.button>
              );
            })}
          </div>
          <MapPlaceSearch onPick={previewSearchedPlace} savedIds={savedIds} />
        </div>
      </div>

      {emptyFiltered ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <p className="max-w-sm rounded-2xl bg-[#f8f6f1]/95 px-4 py-3 text-center text-sm leading-relaxed text-[#4b5563] shadow-sm backdrop-blur">
            {displayMode === "favorites"
              ? "お気に入りの店がありません。上の検索から、もともと気に入っている店を追加できます。"
              : "保存した店がありません。ホームでスワイプするか、上の検索から店を追加できます。"}
          </p>
        </div>
      ) : null}

      <MapView
        focus={focus}
        onSelectRestaurant={setSelectedRestaurant}
        restaurants={mapRestaurants}
        selectedRestaurant={selectedForDisplay}
      />
      <RestaurantSheet
        onAddFavorite={addSelectedAsFavorite}
        onAddLiked={addSelectedAsLiked}
        onRemove={removeSelectedPlace}
        restaurant={selectedForDisplay}
        saved={selectedForDisplay ? savedIds.has(selectedForDisplay.id) : false}
      />
    </div>
  );
}
