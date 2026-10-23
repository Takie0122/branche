"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AvoidPreference,
  BudgetLevel,
  StylePreference,
  TravelDistance,
  UseCase,
  UserPreferences,
} from "../data/onboardingSurvey";

const STORAGE_KEY_PREFS = "branche:user-preferences";

const defaultPreferences: UserPreferences = {
  style_preferences: [],
  avoid_preferences: [],
  budget_levels: [],
  use_cases: [],
  travel_distances: [],
  seed_restaurants: [],
};

type OnboardingContextValue = {
  onboardingCompleted: boolean;
  userPreferences: UserPreferences;
  completeOnboarding: (prefs: UserPreferences) => void;
  setUserPreferences: (prefs: UserPreferences) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFS);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<UserPreferences> & {
      budget_level?: string;
      travel_distance?: string;
    };
    return {
      style_preferences: (parsed.style_preferences ?? []) as StylePreference[],
      avoid_preferences: (parsed.avoid_preferences ?? []) as AvoidPreference[],
      budget_levels: (parsed.budget_levels ??
        (parsed.budget_level ? [parsed.budget_level] : [])) as BudgetLevel[],
      use_cases: (parsed.use_cases ?? []) as UseCase[],
      travel_distances: (parsed.travel_distances ??
        (parsed.travel_distance ? [parsed.travel_distance] : [])) as TravelDistance[],
      seed_restaurants: (parsed.seed_restaurants ?? []) as string[],
    };
  } catch {
    return defaultPreferences;
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [userPreferences, setUserPreferencesState] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    setUserPreferencesState(loadPreferences());
  }, []);

  const completeOnboarding = useCallback((prefs: UserPreferences) => {
    setUserPreferencesState(prefs);
    setOnboardingCompleted(true);
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, []);

  const setUserPreferences = useCallback((prefs: UserPreferences) => {
    setUserPreferencesState(prefs);
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, []);

  const value: OnboardingContextValue = {
    onboardingCompleted,
    userPreferences,
    completeOnboarding,
    setUserPreferences,
  };

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (ctx === undefined) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
