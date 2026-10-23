"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Restaurant = {
  id: string;
  name: string;
  location: string;
  image: string;
  liked: boolean;
  favorited: boolean;
  description?: string;
  cuisineType?: string;
  priceRange?: string;
  rating?: string;
  openingHours?: string;
  lat?: number;
  lng?: number;
  images?: string[];
  websiteUrl?: string;
  googleMapsUrl?: string;
};

type RestaurantsState = {
  likedRestaurants: Restaurant[];
  favoriteRestaurants: Restaurant[];
  visitedRestaurants: Restaurant[];
};

type RestaurantsContextValue = RestaurantsState & {
  addLikedRestaurant: (restaurant: Omit<Restaurant, "liked" | "favorited">) => void;
  /** すでに好きな店を「いいね＋お気に入り」として一括登録 */
  addFavoriteRestaurant: (restaurant: Omit<Restaurant, "liked" | "favorited">) => void;
  toggleFavoriteRestaurant: (restaurantId: string) => { success: boolean; message?: string };
  unlikeRestaurant: (restaurantId: string) => void;
  addVisitedRestaurant: (restaurant: Omit<Restaurant, "liked" | "favorited">) => void;
  /** いいね・お気に入りをすべて消去（訪問履歴は残す） */
  resetLikesAndFavorites: () => void;
  /** 空欄の説明・ジャンルなどを、すでにある値は残して埋める */
  fillRestaurantDetails: (
    restaurantId: string,
    details: Partial<
      Pick<Restaurant, "description" | "cuisineType" | "priceRange" | "rating" | "openingHours" | "websiteUrl">
    >,
  ) => void;
};

const STORAGE_KEY = "branche:restaurants-state";
const LEGACY_LIKED_KEY = "branche:liked-restaurants";

const RestaurantsContext = createContext<RestaurantsContextValue | undefined>(undefined);

const initialState: RestaurantsState = {
  likedRestaurants: [],
  favoriteRestaurants: [],
  visitedRestaurants: [],
};

function syncFavorites(likedRestaurants: Restaurant[]) {
  return likedRestaurants.filter((restaurant) => restaurant.favorited);
}

function toRestaurant(input: Omit<Restaurant, "liked" | "favorited">): Restaurant {
  return {
    ...input,
    liked: true,
    favorited: false,
  };
}

function addUniqueVisited(list: Restaurant[], item: Omit<Restaurant, "liked" | "favorited">) {
  if (list.some((entry) => entry.id === item.id)) {
    return list;
  }
  return [
    {
      ...item,
      liked: false,
      favorited: false,
    },
    ...list,
  ];
}

export function RestaurantsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RestaurantsState>(initialState);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      if (storedValue) {
        const parsed = JSON.parse(storedValue) as Partial<RestaurantsState>;
        const likedRestaurants = Array.isArray(parsed.likedRestaurants)
          ? parsed.likedRestaurants
              .map((restaurant: Record<string, unknown>) => ({
                id: String(restaurant.id),
                name: String(restaurant.name ?? ""),
                location: String(restaurant.location ?? ""),
                image: String(restaurant.image ?? ""),
                liked: Boolean(restaurant.liked),
                favorited: Boolean(restaurant.favorited),
                ...(restaurant.description != null && { description: String(restaurant.description) }),
                ...(restaurant.cuisineType != null && { cuisineType: String(restaurant.cuisineType) }),
                ...(restaurant.priceRange != null && { priceRange: String(restaurant.priceRange) }),
                ...(restaurant.rating != null && { rating: String(restaurant.rating) }),
                ...(restaurant.openingHours != null && { openingHours: String(restaurant.openingHours) }),
                ...(typeof restaurant.lat === "number" && { lat: restaurant.lat }),
                ...(typeof restaurant.lng === "number" && { lng: restaurant.lng }),
                ...(Array.isArray(restaurant.images) &&
                  restaurant.images.length > 0 && {
                    images: restaurant.images.map((u) => String(u)),
                  }),
                ...(restaurant.websiteUrl != null && { websiteUrl: String(restaurant.websiteUrl) }),
                ...(restaurant.googleMapsUrl != null && {
                  googleMapsUrl: String(restaurant.googleMapsUrl),
                }),
              }))
              .filter((restaurant) => Boolean(restaurant.id && restaurant.name))
          : [];
        const visitedRestaurants = Array.isArray(parsed.visitedRestaurants)
          ? parsed.visitedRestaurants
              .map((restaurant: Record<string, unknown>) => ({
                id: String(restaurant.id),
                name: String(restaurant.name ?? ""),
                location: String(restaurant.location ?? ""),
                image: String(restaurant.image ?? ""),
                liked: false,
                favorited: false,
              }))
              .filter((restaurant) => Boolean(restaurant.id && restaurant.name))
          : [];
        setState({
          likedRestaurants,
          favoriteRestaurants: syncFavorites(likedRestaurants),
          visitedRestaurants,
        });
        return;
      }

      const legacyValue = window.localStorage.getItem(LEGACY_LIKED_KEY);
      if (legacyValue) {
        const parsedLegacy = JSON.parse(legacyValue) as Array<{
          id: string | number;
          name: string;
          location: string;
          image: string;
        }>;
        if (Array.isArray(parsedLegacy)) {
          const likedRestaurants = parsedLegacy
            .map((restaurant) => ({
              id: String(restaurant.id),
              name: restaurant.name,
              location: restaurant.location,
              image: restaurant.image,
              liked: true,
              favorited: false,
            }))
            .filter((restaurant) => Boolean(restaurant.id && restaurant.name));
          setState({
            likedRestaurants,
            favoriteRestaurants: syncFavorites(likedRestaurants),
            visitedRestaurants: [],
          });
        }
      }
    } catch {
      // keep empty state if parsing fails
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addLikedRestaurant = useCallback((restaurantInput: Omit<Restaurant, "liked" | "favorited">) => {
    const restaurant = toRestaurant(restaurantInput);
    setState((prev) => {
      const existing = prev.likedRestaurants.find((item) => item.id === restaurant.id);
      const likedRestaurants = existing
        ? prev.likedRestaurants.map((item) =>
            item.id === restaurant.id
              ? {
                  ...item,
                  ...restaurant,
                  liked: true,
                  favorited: false,
                  lat: restaurant.lat ?? item.lat,
                  lng: restaurant.lng ?? item.lng,
                  images: restaurant.images?.length ? restaurant.images : item.images,
                  websiteUrl: restaurant.websiteUrl ?? item.websiteUrl,
                  googleMapsUrl: restaurant.googleMapsUrl ?? item.googleMapsUrl,
                }
              : item
          )
        : [restaurant, ...prev.likedRestaurants];

      return {
        ...prev,
        likedRestaurants,
        favoriteRestaurants: syncFavorites(likedRestaurants),
      };
    });
  }, []);

  const addFavoriteRestaurant = useCallback((restaurantInput: Omit<Restaurant, "liked" | "favorited">) => {
    setState((prev) => {
      const existing = prev.likedRestaurants.find((item) => item.id === restaurantInput.id);
      const nextItem: Restaurant = {
        ...toRestaurant(restaurantInput),
        liked: false,
        favorited: true,
        ...(existing
          ? {
              images: restaurantInput.images?.length ? restaurantInput.images : existing.images,
              websiteUrl: restaurantInput.websiteUrl ?? existing.websiteUrl,
              googleMapsUrl: restaurantInput.googleMapsUrl ?? existing.googleMapsUrl,
              lat: restaurantInput.lat ?? existing.lat,
              lng: restaurantInput.lng ?? existing.lng,
            }
          : {}),
      };
      const likedRestaurants = existing
        ? prev.likedRestaurants.map((item) => (item.id === restaurantInput.id ? { ...item, ...nextItem } : item))
        : [nextItem, ...prev.likedRestaurants];

      return {
        ...prev,
        likedRestaurants,
        favoriteRestaurants: syncFavorites(likedRestaurants),
      };
    });
  }, []);

  const toggleFavoriteRestaurant = useCallback((restaurantId: string) => {
    let result: { success: boolean; message?: string } = { success: false };
    setState((prev) => {
      const target = prev.likedRestaurants.find((item) => item.id === restaurantId);
      if (!target || (!target.liked && !target.favorited)) {
        result = { success: false, message: "Like first to add to favorites" };
        return prev;
      }
      const nextFavorited = !target.favorited;
      const likedRestaurants = prev.likedRestaurants.map((item) =>
        item.id === restaurantId
          ? { ...item, favorited: nextFavorited, liked: !nextFavorited }
          : item
      );
      result = { success: true };
      return {
        ...prev,
        likedRestaurants,
        favoriteRestaurants: syncFavorites(likedRestaurants),
      };
    });
    return result;
  }, []);

  const unlikeRestaurant = useCallback((restaurantId: string) => {
    setState((prev) => {
      const likedRestaurants = prev.likedRestaurants.map((item) =>
        item.id === restaurantId ? { ...item, liked: false, favorited: false } : item
      );
      return {
        ...prev,
        likedRestaurants,
        favoriteRestaurants: syncFavorites(likedRestaurants),
      };
    });
  }, []);

  const addVisitedRestaurant = useCallback((restaurant: Omit<Restaurant, "liked" | "favorited">) => {
    setState((prev) => ({
      ...prev,
      visitedRestaurants: addUniqueVisited(prev.visitedRestaurants, restaurant),
    }));
  }, []);

  const fillRestaurantDetails = useCallback(
    (
      restaurantId: string,
      details: Partial<
        Pick<Restaurant, "description" | "cuisineType" | "priceRange" | "rating" | "openingHours" | "websiteUrl">
      >,
    ) => {
      const keys = ["description", "cuisineType", "priceRange", "rating", "openingHours", "websiteUrl"] as const;
      setState((prev) => {
        const target = prev.likedRestaurants.find((item) => item.id === restaurantId);
        if (!target) {
          return prev;
        }
        const patch: Partial<Restaurant> = {};
        for (const key of keys) {
          const incoming = details[key]?.trim();
          if (incoming && !target[key]?.trim()) {
            patch[key] = incoming;
          }
        }
        if (Object.keys(patch).length === 0) {
          return prev;
        }
        const likedRestaurants = prev.likedRestaurants.map((item) =>
          item.id === restaurantId ? { ...item, ...patch } : item,
        );
        return {
          ...prev,
          likedRestaurants,
          favoriteRestaurants: syncFavorites(likedRestaurants),
        };
      });
    },
    [],
  );

  const resetLikesAndFavorites = useCallback(() => {
    try {
      window.localStorage.removeItem(LEGACY_LIKED_KEY);
    } catch {
      // ignore
    }
    setState((prev) => ({
      ...prev,
      likedRestaurants: [],
      favoriteRestaurants: [],
    }));
  }, []);

  const value = useMemo(
    () => ({
      likedRestaurants: state.likedRestaurants,
      favoriteRestaurants: state.favoriteRestaurants,
      visitedRestaurants: state.visitedRestaurants,
      addLikedRestaurant,
      addFavoriteRestaurant,
      toggleFavoriteRestaurant,
      unlikeRestaurant,
      addVisitedRestaurant,
      resetLikesAndFavorites,
      fillRestaurantDetails,
    }),
    [
      state,
      addLikedRestaurant,
      addFavoriteRestaurant,
      toggleFavoriteRestaurant,
      unlikeRestaurant,
      addVisitedRestaurant,
      resetLikesAndFavorites,
      fillRestaurantDetails,
    ]
  );

  return <RestaurantsContext.Provider value={value}>{children}</RestaurantsContext.Provider>;
}

export function useRestaurants() {
  const context = useContext(RestaurantsContext);
  if (!context) {
    throw new Error("useRestaurants must be used inside RestaurantsProvider");
  }
  return context;
}

