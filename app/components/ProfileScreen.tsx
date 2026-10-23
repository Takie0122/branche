"use client";

import { useState } from "react";
import OnboardingSurvey from "./onboarding/OnboardingSurvey";
import RestaurantCard from "./RestaurantCard";
import { useRestaurants } from "../contexts/LikedRestaurantsContext";

export default function ProfileScreen() {
  const { likedRestaurants, toggleFavoriteRestaurant, unlikeRestaurant, resetLikesAndFavorites } =
    useRestaurants();
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyMountKey, setSurveyMountKey] = useState(0);

  const likedOnlyRestaurants = likedRestaurants.filter((r) => r.liked && !r.favorited);
  const favoriteRestaurants = likedRestaurants.filter((r) => r.favorited);

  return (
    <div className="flex h-full flex-col bg-[#0e1210]">
      <section className="px-5 pb-4 pt-5">
        <h1 className="font-brand text-3xl font-medium text-[#e8efe6]">Takuma Adachi</h1>
        <p className="mt-1 text-sm text-[#8a9688]">Tokyo, Japan</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-[#161d18] p-3">
            <p className="text-xs text-[#6f7a70]">Liked</p>
            <p className="mt-1 text-2xl font-medium text-[#e8efe6]">{likedOnlyRestaurants.length}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#161d18] p-3">
            <p className="text-xs text-[#6f7a70]">Favorite</p>
            <p className="mt-1 text-2xl font-medium text-[#e8efe6]">{favoriteRestaurants.length}</p>
          </div>
        </div>

        <button
          className="mt-3 w-full rounded-2xl border border-white/12 bg-[#1a221c] px-4 py-3 text-left text-sm font-medium text-[#a8b89a] transition-colors active:bg-[#222c24]"
          onClick={() => {
            setSurveyMountKey((k) => k + 1);
            setSurveyOpen(true);
          }}
          type="button"
        >
          好みのアンケート（任意）
        </button>

        <button
          className="mt-4 w-full rounded-2xl border border-white/10 bg-[#161d18] px-4 py-3 text-left text-sm font-medium text-[#6f7a70] transition-colors active:bg-[#1a221c]"
          onClick={() => {
            if (
              window.confirm(
                "いいねとお気に入りをすべて削除します。よろしいですか？"
              )
            ) {
              resetLikesAndFavorites();
            }
          }}
          type="button"
        >
          いいね・お気に入りをリセット
        </button>
      </section>

      {surveyOpen ? (
        <div
          className="fixed inset-0 z-[200] flex justify-center bg-black/55 p-0 md:p-7"
          role="dialog"
          aria-modal="true"
          aria-label="好みのアンケート"
        >
          <div className="hide-scrollbar flex h-full w-full max-w-none overflow-hidden rounded-none border-0 bg-[#0e1210] shadow-none md:max-w-[820px] md:rounded-[24px] md:border md:border-white/10 md:shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <OnboardingSurvey
              key={surveyMountKey}
              onClose={() => setSurveyOpen(false)}
              onCompleted={() => setSurveyOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <section className="hide-scrollbar flex-1 overflow-y-auto scroll-smooth px-4 pb-24">
        <div className="mb-5">
          <h2 className="mb-3 text-sm font-medium tracking-wide text-[#a8b89a]">Favorites</h2>
          {favoriteRestaurants.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[#161d18] p-5 text-sm text-[#6f7a70]">
              No favorites yet
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={`favorite-${restaurant.id}`}
                  onRemoveFromFavorites={(id) => toggleFavoriteRestaurant(id)}
                  restaurant={restaurant}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium tracking-wide text-[#a8b89a]">Liked</h2>
          {likedOnlyRestaurants.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[#161d18] p-5 text-sm text-[#6f7a70]">
              No liked restaurants yet
            </div>
          ) : (
            <div className="space-y-3">
              {likedOnlyRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={`liked-${restaurant.id}`}
                  onRemoveFromLiked={(id) => unlikeRestaurant(id)}
                  restaurant={restaurant}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
