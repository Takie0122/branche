"use client";

import { useEffect, useState, type ReactNode } from "react";
import HowToIntro, {
  hasSeenHowToIntro,
  markHowToIntroSeen,
} from "./onboarding/HowToIntro";

type OnboardingGateProps = {
  children: ReactNode;
};

/** 初回起動時に操作方法イントロを表示（アンケートはプロフィールから任意） */
export default function OnboardingGate({ children }: OnboardingGateProps) {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowIntro(!hasSeenHowToIntro());
  }, []);

  return (
    <div className="relative h-full">
      {children}
      {/* SSR/初回クライアント描画を一致させ、マウント後にだけイントロを出す */}
      {mounted ? (
        <HowToIntro
          open={showIntro}
          onDismiss={() => {
            markHowToIntroSeen();
            setShowIntro(false);
          }}
        />
      ) : null}
    </div>
  );
}
