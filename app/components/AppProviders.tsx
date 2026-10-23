"use client";

import type { ReactNode } from "react";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { RestaurantsProvider } from "../contexts/LikedRestaurantsContext";

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <RestaurantsProvider>
      <OnboardingProvider>{children}</OnboardingProvider>
    </RestaurantsProvider>
  );
}
