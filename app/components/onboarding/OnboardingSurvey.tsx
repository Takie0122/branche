"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ONBOARDING_QUESTIONS,
  type UserPreferences,
  type AvoidPreference,
  type BudgetLevel,
  type StylePreference,
  type TravelDistance,
  type UseCase,
} from "../../data/onboardingSurvey";
import { homeRestaurantsDetail } from "../../data/homeRestaurants";
import { useOnboarding } from "../../contexts/OnboardingContext";

const TOTAL_STEPS = 6;
const Q6_MAX_SELECT = 3;

const initialPrefs: UserPreferences = {
  style_preferences: [],
  avoid_preferences: [],
  budget_levels: [],
  use_cases: [],
  travel_distances: [],
  seed_restaurants: [],
};

type OnboardingSurveyProps = {
  /** 途中終了（保存しない） */
  onClose?: () => void;
  /** 「はじめる」で保存が終わった後 */
  onCompleted?: () => void;
};

export default function OnboardingSurvey({ onClose, onCompleted }: OnboardingSurveyProps = {}) {
  const { completeOnboarding } = useOnboarding();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<UserPreferences>(initialPrefs);

  const isFirst = step === 0;
  const isLast = step === TOTAL_STEPS - 1;
  const isQ6 = step === 5;

  const canProceed = () => {
    if (isQ6) return prefs.seed_restaurants.length >= 1;
    const q = ONBOARDING_QUESTIONS[step];
    if (q.id === "q1") return prefs.style_preferences.length >= 1 && prefs.style_preferences.length <= 3;
    if (q.id === "q2") return prefs.avoid_preferences.length >= 1 && prefs.avoid_preferences.length <= 3;
    if (q.id === "q3") return prefs.budget_levels.length >= 1 && prefs.budget_levels.length <= 3;
    if (q.id === "q4") return prefs.use_cases.length >= 1 && prefs.use_cases.length <= 3;
    if (q.id === "q5") return prefs.travel_distances.length >= 1 && prefs.travel_distances.length <= 3;
    return true;
  };

  const handleNext = () => {
    if (isLast) {
      completeOnboarding(prefs);
      onCompleted?.();
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  type MultiKey = "style_preferences" | "avoid_preferences" | "budget_levels" | "use_cases" | "travel_distances";

  const handleMultiToggle = (key: MultiKey, value: string, maxSelect: number) => {
    setPrefs((p) => {
      const arr = [...(p[key] as string[])];
      const hasNone = key === "avoid_preferences" && value === "none";
      if (hasNone) {
        return { ...p, avoid_preferences: ["none" as AvoidPreference] };
      }
      if (key === "avoid_preferences" && arr.includes("none")) {
        arr.length = 0;
      }
      const i = arr.indexOf(value);
      if (i >= 0) {
        arr.splice(i, 1);
      } else if (arr.length < maxSelect) {
        arr.push(
          value as StylePreference & AvoidPreference & BudgetLevel & UseCase & TravelDistance
        );
      }
      return { ...p, [key]: arr };
    });
  };

  const handleSeedToggle = (id: string) => {
    const idStr = String(id);
    setPrefs((p) => {
      const arr = [...p.seed_restaurants];
      const i = arr.indexOf(idStr);
      if (i >= 0) {
        arr.splice(i, 1);
      } else if (arr.length < Q6_MAX_SELECT) {
        arr.push(idStr);
      }
      return { ...p, seed_restaurants: arr };
    });
  };

  return (
    <div className="relative flex h-full min-h-screen flex-col bg-[#f5f3ee]">
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-full border border-[#e8e3d9] bg-[#f8f6f1]/95 px-4 py-2 text-xs font-semibold text-[#0f3d2e] shadow-sm backdrop-blur-sm active:bg-[#ece7dc]"
        >
          閉じる
        </button>
      ) : null}

      {/* プログレス */}
      <div className="shrink-0 px-4 pb-2 pt-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8e3d9]">
          <motion.div
            className="h-full rounded-full bg-[#1f6f54]"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-[#6b7280]">
          {step + 1} / {TOTAL_STEPS}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {!isQ6 ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="py-4"
            >
              {(() => {
                const q = ONBOARDING_QUESTIONS[step];
                if (!q || q.type !== "multi") return null;
                const multiKey: MultiKey =
                  q.id === "q1"
                    ? "style_preferences"
                    : q.id === "q2"
                      ? "avoid_preferences"
                      : q.id === "q3"
                        ? "budget_levels"
                        : q.id === "q4"
                          ? "use_cases"
                          : "travel_distances";
                const selected = prefs[multiKey] as string[];
                return (
                  <>
                    <h2 className="text-lg font-semibold text-[#0f3d2e]">{q.questionJa}</h2>
                    <p className="mt-1 text-xs text-[#6b7280]">最大3つまで選べます</p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {q.options.map((opt) => (
                        <li key={opt.value}>
                          <button
                            type="button"
                            onClick={() => handleMultiToggle(multiKey, opt.value, q.maxSelect)}
                            className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                              selected.includes(opt.value)
                                ? "border-[#1f6f54] bg-[#e8f5e9] text-[#0f3d2e]"
                                : "border-[#e8e3d9] bg-white text-[#374151]"
                            }`}
                          >
                            {opt.labelJa}
                            {selected.includes(opt.value) && (
                              <span className="text-[#1f6f54]" aria-hidden>✓</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </motion.div>
          ) : (
            <motion.div
              key="q6"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="py-4"
            >
              <h2 className="text-lg font-semibold text-[#0f3d2e]">
                気になるお店を3つ選んでください
              </h2>
              <p className="mt-1 text-xs text-[#6b7280]">最大3つまで選べます</p>
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {homeRestaurantsDetail
                  .filter((r) => r.category !== "Cafe")
                  .slice(0, 18)
                  .map((r) => {
                  const selected = prefs.seed_restaurants.includes(String(r.id));
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => handleSeedToggle(String(r.id))}
                        className={`relative w-full overflow-hidden rounded-xl border-2 transition-colors ${
                          selected ? "border-[#1f6f54] ring-2 ring-[#1f6f54]/30" : "border-[#e8e3d9]"
                        }`}
                      >
                        <div className="aspect-[4/3] w-full bg-[#e8e3d9]">
                          <img
                            src={r.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
                          <p className="truncate text-xs font-medium text-white">{r.title}</p>
                          <p className="truncate text-[10px] text-white/80">{r.location}</p>
                        </div>
                        {selected && (
                          <span
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#1f6f54] text-xs text-white"
                            aria-hidden
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ナビ */}
      <div className="flex shrink-0 gap-3 border-t border-[#e8e3d9] bg-[#f8f6f1] px-4 py-4">
        {!isFirst && (
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl border border-[#0f3d2e] px-5 py-3 text-sm font-medium text-[#0f3d2e]"
          >
            戻る
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-opacity ${
            canProceed() ? "bg-[#1f6f54]" : "bg-[#9ca3af]"
          }`}
        >
          {isLast ? "はじめる" : "次へ"}
        </button>
      </div>
    </div>
  );
}
