"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import BottomTabBar, { type TabId } from "./BottomTabBar";
import Header from "./Header";
import ListScreen from "./list/ListScreen";
import MapScreen from "./map/MapScreen";
import ProfileScreen from "./ProfileScreen";
import SwipeStack from "./SwipeStack";
import type { SwipeItem } from "./SwipeCard";
import { useRestaurants } from "../contexts/LikedRestaurantsContext";
import { CUISINE_CATEGORIES } from "../data/cuisineCategories";
import {
  type HomeRestaurantDetail,
  filterHomeRestaurantsForSwipeDeck,
  shuffleForHomeDeck,
} from "../data/homeRestaurants";
import {
  resolveHomeGoogleMapsUrl,
  resolveHomeWebsiteUrl,
} from "../lib/venueDisplay";

// Home 画面では「Other」はチップに出さない。カフェはスワイプ対象外のためチップにも出さない
const CUISINE_OPTIONS = ["All", ...CUISINE_CATEGORIES.filter((c) => c !== "Cafe")] as const;

function buildSwipeDeck(rows: HomeRestaurantDetail[]): SwipeItem[] {
  return rows.map(homeRowToSwipeItem);
}

function homeRowToSwipeItem(r: HomeRestaurantDetail): SwipeItem {
  return {
    id: r.id,
    title: r.title,
    location: r.location,
    category: r.category,
    /** サンプル画像は使わない。表示は SwipeCard が Places から取得 */
    image: "",
    images: [],
    description: r.description,
    cuisineType: r.cuisineType,
    priceRange: r.priceRange,
    rating: r.rating,
    openingHours: r.openingHours,
    lat: r.lat,
    lng: r.lng,
    websiteUrl: resolveHomeWebsiteUrl(r),
    googleMapsUrl: resolveHomeGoogleMapsUrl(r),
    ...(r.googlePlaceId && { googlePlaceId: r.googlePlaceId }),
  };
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("Home");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("All");
  const [swipeIndex, setSwipeIndex] = useState(0);
  const { addLikedRestaurant } = useRestaurants();

  /** Places 写真が取れる店だけスワイプに載せる（未取得中は null） */
  const [photoReadyIds, setPhotoReadyIds] = useState<Set<number> | null>(null);

  /** ハイドレーション後にシャッフル（useLayoutEffect だと属性ずれの原因になりやすい） */
  const [wardDeck, setWardDeck] = useState<SwipeItem[]>(() =>
    buildSwipeDeck(filterHomeRestaurantsForSwipeDeck()),
  );

  useEffect(() => {
    setWardDeck(buildSwipeDeck(shuffleForHomeDeck(filterHomeRestaurantsForSwipeDeck())));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/places/swipe-ready-ids");
        if (!res.ok) {
          if (!cancelled) {
            setPhotoReadyIds(new Set());
          }
          return;
        }
        const data = (await res.json()) as { ids?: number[] };
        if (!cancelled) {
          setPhotoReadyIds(new Set(data.ids ?? []));
        }
      } catch {
        if (!cancelled) {
          setPhotoReadyIds(new Set());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRestaurants = useMemo(() => {
    const withPhotos =
      photoReadyIds === null ? [] : wardDeck.filter((r) => photoReadyIds.has(r.id));
    const list =
      selectedCuisine === "All"
        ? withPhotos
        : withPhotos.filter((r) => r.cuisineType === selectedCuisine);
    return list;
  }, [selectedCuisine, wardDeck, photoReadyIds]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        {activeTab === "Home" ? (
          <div className="flex h-full flex-col">
            <Header />
            <div className="flex shrink-0 overflow-x-auto border-b border-white/8 px-4 py-3">
              <div className="flex gap-2">
                {CUISINE_OPTIONS.map((cuisine) => {
                  const isActive = selectedCuisine === cuisine;
                  return (
                    <motion.button
                      key={cuisine}
                      className={`relative rounded-full px-3.5 py-2 text-[0.8rem] font-medium tracking-wide transition-shadow ${
                        isActive
                          ? "text-[#0e1210]"
                          : "border border-white/12 bg-white/5 text-[#a8b89a]"
                      }`}
                      onClick={() => {
                        setSelectedCuisine(cuisine);
                        setSwipeIndex(0);
                      }}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {isActive ? (
                        <motion.span
                          className="absolute inset-0 rounded-full bg-[#a8b89a] shadow-[0_6px_20px_-6px_rgba(168,184,154,0.45)]"
                          layoutId="cuisine-chip"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      ) : null}
                      <span className="relative z-10">{cuisine}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden touch-none">
              {photoReadyIds === null ? (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#8a9688]">
                  読み込み中…
                </div>
              ) : (
                <SwipeStack
                  items={filteredRestaurants}
                  index={swipeIndex}
                  onIndexChange={setSwipeIndex}
                  onLikeRestaurant={(item) => {
                    addLikedRestaurant({
                      id: String(item.id),
                      name: item.title,
                      location: item.location,
                      image: item.image,
                      description: item.description,
                      cuisineType: item.cuisineType,
                      priceRange: item.priceRange,
                      rating: item.rating,
                      openingHours: item.openingHours,
                      ...(typeof item.lat === "number" && { lat: item.lat }),
                      ...(typeof item.lng === "number" && { lng: item.lng }),
                      ...(item.images?.length && { images: item.images.slice(0, 5) }),
                      ...(item.websiteUrl?.trim() && { websiteUrl: item.websiteUrl.trim() }),
                      ...(item.googleMapsUrl?.trim() && { googleMapsUrl: item.googleMapsUrl.trim() }),
                    });
                  }}
                  onExcludeRestaurant={(item) => {
                    setPhotoReadyIds((prev) => {
                      if (!prev) {
                        return prev;
                      }
                      const next = new Set(prev);
                      next.delete(item.id);
                      return next;
                    });
                  }}
                />
              )}
            </div>
          </div>
        ) : activeTab === "Map" ? (
          <MapScreen />
        ) : activeTab === "List" ? (
          <ListScreen />
        ) : (
          <ProfileScreen />
        )}
      </div>
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
