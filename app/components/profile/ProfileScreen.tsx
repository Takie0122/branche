"use client";

import { useState } from "react";
import { useRestaurants, type Restaurant } from "../../contexts/LikedRestaurantsContext";

type ProfileTab = "Liked" | "Favorites" | "Visited";

function RestaurantList({
  items,
  onFavorite,
  showFavoriteButton,
}: {
  items: Restaurant[];
  onFavorite?: (id: string) => void;
  showFavoriteButton?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-[#f8f6f1] p-5 text-sm text-[#6b7280] shadow-sm">
        まだレストランがありません。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((restaurant) => (
        <article
          className="flex items-center gap-3 rounded-2xl bg-[#f8f6f1] p-3 shadow-sm"
          key={restaurant.id}
        >
          <img
            alt={restaurant.name}
            className="h-16 w-16 rounded-xl object-cover"
            draggable={false}
            src={restaurant.image}
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-brand text-xl text-[#1c1c1c]">{restaurant.name}</h3>
            <p className="truncate text-sm text-[#6b7280]">{restaurant.location || "Location unavailable"}</p>
          </div>
          {showFavoriteButton ? (
            <button
              className="rounded-full bg-[#1f6f54] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2a7d60]"
              onClick={() => onFavorite?.(restaurant.id)}
              type="button"
            >
              Favorite
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("Liked");
  const {
    likedRestaurants,
    favoriteRestaurants,
    visitedRestaurants,
    toggleFavoriteRestaurant,
  } = useRestaurants();

  const listTitle = activeTab === "Liked" ? "Liked Restaurants" : activeTab === "Favorites" ? "Favorites" : "Visited";
  const listItems =
    activeTab === "Liked"
      ? likedRestaurants
      : activeTab === "Favorites"
        ? favoriteRestaurants
        : visitedRestaurants;

  return (
    <div className="flex h-full flex-col bg-[#f5f3ee]">
      <header className="px-5 pb-3 pt-5">
        <h1 className="font-brand text-3xl text-[#0f3d2e]">Profile</h1>
      </header>

      <section className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="mb-4 rounded-2xl bg-[#f8f6f1] p-3 shadow-sm">
          <div className="mb-3 flex gap-2">
            {(["Liked", "Favorites", "Visited"] as const).map((tab) => (
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === tab ? "bg-[#0f3d2e] text-[#f8f6f1]" : "bg-[#ece7dc] text-[#6b7280]"
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <h2 className="text-sm font-semibold tracking-wide text-[#1f6f54]">{listTitle}</h2>
        </div>

        <RestaurantList
          items={listItems}
          onFavorite={(id) => {
            const result = toggleFavoriteRestaurant(id);
            if (!result.success && result.message) {
              window.alert(result.message);
            }
          }}
          showFavoriteButton={activeTab === "Liked"}
        />
      </section>
    </div>
  );
}
