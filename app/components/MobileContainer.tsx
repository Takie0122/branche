import type { ReactNode } from "react";

type MobileContainerProps = {
  children: ReactNode;
};

/**
 * モバイル（<768px）: 全画面・枠なし
 * デスクトップ（≥768px）: 従来のスマホ風フレーム
 */
export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="min-h-[100dvh] p-0 md:p-7">
      <div
        className={[
          "relative mx-auto h-[100dvh] w-full overflow-hidden bg-[#0e1210]",
          "max-w-none rounded-none border-0 shadow-none",
          "md:max-w-[820px] md:rounded-[28px] md:border md:border-white/10",
          "md:shadow-[0_32px_96px_-24px_rgba(0,0,0,0.55),0_12px_40px_-12px_rgba(0,0,0,0.35)]",
        ].join(" ")}
      >
        {/* 葉のテーマ背景（アプリ内にうっすら） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.28] md:rounded-[28px]"
          style={{
            backgroundImage: "url(/brand/forest-leaves.png?v=2)",
            filter: "saturate(0.8) brightness(0.45)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0e1210]/70 via-[#0e1210]/88 to-[#0e1210] md:rounded-[28px]"
        />
        <div className="relative z-[1] h-full">{children}</div>
      </div>
    </div>
  );
}
