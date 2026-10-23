"use client";

import { motion } from "framer-motion";

const tabs = ["Home", "Map", "List", "Profile"] as const;
type TabId = (typeof tabs)[number];

function TabIcon({ tab }: { tab: TabId }) {
  const common = "h-[1.3rem] w-[1.3rem] transition-transform duration-200";
  switch (tab) {
    case "Home":
      return (
        <svg aria-hidden className={common} fill="none" viewBox="0 0 24 24">
          <path
            className="stroke-current"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.7}
            d="M4.5 10.5 12 4l7.5 6.5M6.75 9.75v8a.75.75 0 0 0 .75.75H10v-3c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v3h2.5a.75.75 0 0 0 .75-.75v-8"
          />
        </svg>
      );
    case "Map":
      return (
        <svg aria-hidden className={common} fill="none" viewBox="0 0 24 24">
          <path
            className="stroke-current"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.7}
            d="M12 21s6-4.72 6-11.25a6 6 0 1 0-12 0C6 16.28 12 21 12 21Z"
          />
          <circle className="fill-current" cx={12} cy={9.75} r={1.5} />
        </svg>
      );
    case "List":
      return (
        <svg aria-hidden className={common} fill="none" viewBox="0 0 24 24">
          <path
            className="stroke-current"
            strokeLinecap="round"
            strokeWidth={1.7}
            d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M4.5 6.75h.01M4.5 12h.01m0 5.25h.01"
          />
        </svg>
      );
    case "Profile":
      return (
        <svg aria-hidden className={common} fill="none" viewBox="0 0 24 24">
          <path
            className="stroke-current"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.7}
            d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a7.5 7.5 0 0 1 15 0"
          />
        </svg>
      );
    default:
      return null;
  }
}

type BottomTabBarProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

export default function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <footer className="sticky bottom-0 left-0 right-0 z-30 px-4 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-1.5 md:pb-5">
      <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#161d18]/92 px-1.5 py-1.5 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <nav aria-label="Main tabs" className="relative grid grid-cols-4 gap-0">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <motion.button
                className={`relative z-10 flex flex-col items-center justify-center rounded-[14px] py-2.5 text-[0.68rem] font-medium tracking-wide transition-colors ${
                  isActive ? "text-[#e8efe6]" : "text-[#6f7a70]"
                }`}
                key={tab}
                onClick={() => onTabChange(tab)}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive ? (
                  <motion.span
                    className="absolute inset-x-1 inset-y-0.5 -z-10 rounded-[14px] bg-[#2a362e] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    layoutId="bottom-tab-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                ) : null}
                <span className={`mb-0.5 ${isActive ? "text-[#a8b89a]" : ""}`}>
                  <TabIcon tab={tab} />
                </span>
                <span className="relative z-10">{tab}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}

export type { TabId };
