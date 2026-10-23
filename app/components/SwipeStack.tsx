"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import SwipeCard, { type SwipeItem } from "./SwipeCard";

type SwipeStackProps = {
  items: SwipeItem[];
  index: number;
  onIndexChange: (nextIndex: number) => void;
  onLikeRestaurant?: (item: SwipeItem) => void;
  /** 写真が取れなかった店をデッキから外す */
  onExcludeRestaurant?: (item: SwipeItem) => void;
};

export default function SwipeStack({
  items,
  index,
  onIndexChange,
  onLikeRestaurant,
  onExcludeRestaurant,
}: SwipeStackProps) {
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "next">("next");
  const [likePulseId, setLikePulseId] = useState<number | null>(null);
  const [nopePulseId, setNopePulseId] = useState<number | null>(null);

  const statusText = useMemo(() => {
    if (items.length === 0) return "0 / 0";
    const cardNumber = (index % items.length) + 1;
    return `${cardNumber} / ${items.length}`;
  }, [index, items.length]);

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-[#6b7280]">
        No cards found for this category.
      </div>
    );
  }

  const currentItem = items[index % items.length];
  const nextItem = items[(index + 1) % items.length];

  const handleAction = (direction: "left" | "right" | "next") => {
    if (direction === "right") {
      setLikePulseId((prev) => (prev === null ? 1 : prev + 1));
      onLikeRestaurant?.(currentItem);
    }
    if (direction === "left") {
      setNopePulseId((prev) => (prev === null ? 1 : prev + 1));
    }
    setExitDirection(direction);
    onIndexChange(index + 1);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
        <motion.div
          className="absolute right-5 top-5 z-30 rounded-full border border-white/12 bg-[#0e1210]/75 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#a8b89a] backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.92, y: -8 }}
          key={statusText}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        >
          {statusText}
        </motion.div>

      {nextItem ? <SwipeCard item={nextItem} onAction={handleAction} /> : null}

      <AnimatePresence mode="wait">
        <SwipeCard
          canSwipe
          exitDirection={exitDirection}
          isTop
          item={currentItem}
          key={`${currentItem.id}-${index}`}
          onAction={handleAction}
          onNoPhoto={() => {
            onExcludeRestaurant?.(currentItem);
          }}
        />
      </AnimatePresence>

      <AnimatePresence>
        {likePulseId !== null ? (
          <motion.div
            key={likePulseId}
            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: [0.88, 1.04, 1], opacity: [0, 0.92, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onAnimationComplete={() => setLikePulseId(null)}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#a8b89a]/35 bg-[#0e1210]/85">
              <svg
                aria-hidden="true"
                className="h-10 w-10 text-[#a8b89a]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  className="fill-current"
                  d="M12.2 3.2c4.8 1.1 8.1 5.6 7.6 10.6-.4 4.2-3.6 7.5-7.6 8.2-4.1-.6-7.4-4-7.8-8.3-.5-4.9 2.7-9.3 7.8-10.5Z"
                />
              </svg>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {nopePulseId !== null ? (
          <motion.div
            key={nopePulseId}
            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.9, 1.03, 1], opacity: [0, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            onAnimationComplete={() => setNopePulseId(null)}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-[#0e1210]/85">
              <svg
                aria-hidden="true"
                className="h-10 w-10 rotate-[28deg] text-[#6f7a70]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  className="fill-current"
                  d="M12.2 3.2c4.8 1.1 8.1 5.6 7.6 10.6-.4 4.2-3.6 7.5-7.6 8.2-4.1-.6-7.4-4-7.8-8.3-.5-4.9 2.7-9.3 7.8-10.5Z"
                />
              </svg>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
