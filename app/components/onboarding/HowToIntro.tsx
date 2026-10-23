"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "branche:howto-intro-seen-v8";

const STEPS = [
  {
    title: "趣味嗜好を、もう一度つくり直す",
    bullets: [
      "「なんとなく好き」を言葉にし直す場所",
      "カードをめくりながら好みの輪郭を再構築",
      "興味から体験へ、少しずつ育てていく",
    ],
    accent: null,
  },
  {
    title: "気になったら、まず残す",
    bullets: [
      "写真エリアを右スワイプ → 候補リストへ",
      "まだ体験前でも、興味の芽をストック",
      "左スワイプはパス（詳細はスクロールのみ）",
    ],
    accent: "Like",
  },
  {
    title: "体験したら、お気に入りへ",
    bullets: [
      "実際に体験してよかったらお気に入りへ",
      "「気になる候補」と「ほんとうに好き」を分ける",
      "リストやプロフィールから育てていける",
    ],
    accent: null,
  },
  {
    title: "地図とリストで振り返る",
    bullets: [
      "Map で場所を確認",
      "List でジャンル別に整理",
      "自分の趣味嗜好の地図が少しずつできあがる",
    ],
    accent: null,
  },
] as const;

type HowToIntroProps = {
  open: boolean;
  onDismiss: () => void;
};

type Phase = "splash" | "guide";

export default function HowToIntro({ open, onDismiss }: HowToIntroProps) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("splash");
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step]!;

  useEffect(() => {
    if (!open) {
      setStep(0);
      setPhase("splash");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          aria-modal="true"
          className="absolute inset-0 z-[80] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          transition={{ duration: 0.35 }}
        >
          {/* 森の葉フルブリード */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/brand/forest-leaves.png?v=2)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[#0e1210]/55 via-[#0e1210]/45 to-[#0e1210]/88"
          />

          {phase === "splash" ? (
            <motion.div
              className="relative flex h-full flex-col items-center justify-between px-8 pb-12 pt-28"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="flex flex-col items-center text-center">
                <h1 className="font-brand text-[2.75rem] font-medium tracking-[0.06em] text-[#e8efe6]">
                  Branche
                </h1>
                <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-[#c5cfc0]/90">
                  Find your favorites, and discover more.
                </p>
              </div>

              <div className="flex w-full max-w-xs flex-col items-center gap-4">
                <button
                  className="w-full rounded-full bg-[#6b7f5e]/92 px-6 py-3.5 text-sm font-medium tracking-wide text-[#e8efe6] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.55)] backdrop-blur-sm transition active:scale-[0.98]"
                  onClick={() => setPhase("guide")}
                  type="button"
                >
                  はじめる
                </button>
              </div>
            </motion.div>
          ) : null}

          {phase === "guide" ? (
            <motion.div
              className="relative flex h-full flex-col justify-end px-4 pb-10 pt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="w-full max-w-sm self-center overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#0e1210]/78 px-6 pb-6 pt-7 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <p className="font-brand text-sm tracking-[0.08em] text-[#a8b89a]">Branche</p>
                <h2 className="mt-1 font-brand text-2xl leading-snug text-[#e8efe6]">趣味嗜好を育てる</h2>
                <p className="mt-1.5 text-sm text-[#8a9688]">興味から体験へ、ステップで進めます</p>

                <div className="mt-5 min-h-[10rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {current.accent ? (
                        <span className="mb-3 inline-block rounded-full border border-[#a8b89a]/40 px-3 py-1 font-brand text-lg text-[#a8b89a]">
                          {current.accent}
                        </span>
                      ) : (
                        <p className="mb-2 text-xs font-medium tracking-[0.2em] text-[#a8b89a]/90">
                          STEP {step + 1}
                        </p>
                      )}
                      <h3 className="text-lg font-medium leading-snug text-[#e8efe6]">{current.title}</h3>
                      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#a8b89a]">
                        {current.bullets.map((line) => (
                          <li key={line} className="flex gap-2">
                            <span
                              aria-hidden
                              className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-[#6b7f5e]"
                            />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-5 flex items-center justify-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === step ? "w-5 bg-[#a8b89a]" : "w-1.5 bg-[#2a362e]"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-5 flex gap-2.5">
                  {step > 0 ? (
                    <button
                      className="flex-1 rounded-full border border-white/15 bg-transparent px-4 py-3 text-sm font-medium text-[#a8b89a] transition active:scale-[0.98]"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      type="button"
                    >
                      戻る
                    </button>
                  ) : null}
                  <button
                    className="flex-[1.4] rounded-full bg-[#6b7f5e] px-4 py-3 text-sm font-medium text-[#0e1210] transition active:scale-[0.98]"
                    onClick={() => {
                      if (isLast) {
                        onDismiss();
                        return;
                      }
                      setStep((s) => s + 1);
                    }}
                    type="button"
                  >
                    {isLast ? "はじめる" : "次へ"}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function hasSeenHowToIntro(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markHowToIntroSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}
