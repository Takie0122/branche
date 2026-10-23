"use client";

import { motion, type PanInfo, useDragControls, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { buildGoogleMapsPlaceSearchUrl } from "../lib/venueDisplay";

function isSampleImageUrl(url: string | undefined): boolean {
  return Boolean(url?.includes("images.unsplash.com"));
}

export type SwipeItem = {
  id: number;
  title: string;
  location: string;
  category: string;
  image: string;
  /** 最大5枚。未指定時は `image` のみ */
  images?: string[];
  description?: string;
  cuisineType?: string;
  priceRange?: string;
  rating?: string;
  address?: string;
  openingHours?: string;
  longDescription?: string;
  /** マップ連携・いいね保存用（ホームデータ由来の店舗） */
  lat?: number;
  lng?: number;
  websiteUrl?: string;
  googleMapsUrl?: string;
  googlePlaceId?: string;
};

type SwipeDirection = "left" | "right" | "next";

type SwipeCardProps = {
  item: SwipeItem;
  onAction: (direction: SwipeDirection) => void;
  isTop?: boolean;
  exitDirection?: "left" | "right" | "next";
  canSwipe?: boolean;
  /** Places 写真が取れなかったとき（デッキから除外用） */
  onNoPhoto?: () => void;
};

export default function SwipeCard({
  item,
  onAction,
  isTop = false,
  exitDirection = "next",
  canSwipe = true,
  onNoPhoto,
}: SwipeCardProps) {
  /** 表カード。Places 取得後に差し替える（サンプル画像は使わない） */
  const [topGallery, setTopGallery] = useState<string[] | null>(null);
  const [topPlacesMode, setTopPlacesMode] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [attributionsPerPhoto, setAttributionsPerPhoto] = useState<string[][]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());
  const onNoPhotoRef = useRef(onNoPhoto);
  onNoPhotoRef.current = onNoPhoto;

  const itemGallery = useMemo(() => {
    const fromImages = (item.images ?? []).filter((src) => src && !isSampleImageUrl(src));
    if (fromImages.length > 0) {
      return fromImages.slice(0, 5);
    }
    if (item.image && !isSampleImageUrl(item.image)) {
      return [item.image];
    }
    return [];
  }, [item.images, item.image]);

  const PLACES_FETCH_TIMEOUT_MS = 5_000;

  const mapsHref = useMemo(() => {
    if (item.googleMapsUrl?.trim()) {
      return item.googleMapsUrl.trim();
    }
    const title = item.title?.trim() ?? "";
    const loc = item.location?.trim() ?? "";
    if (title && loc) {
      return buildGoogleMapsPlaceSearchUrl({
        title,
        location: loc,
        googlePlaceId: item.googlePlaceId,
      });
    }
    if (typeof item.lat === "number" && typeof item.lng === "number") {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.lat},${item.lng}`)}`;
    }
    return null;
  }, [item.googleMapsUrl, item.googlePlaceId, item.lat, item.lng, item.title, item.location]);

  useEffect(() => {
    setPhotoIndex(0);
    setFailedUrls(new Set());
  }, [item.id]);

  useEffect(() => {
    if (!isTop) {
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), PLACES_FETCH_TIMEOUT_MS);

    // サンプルは出さず、Places が取れたら差し替える
    setTopGallery(itemGallery);
    setTopPlacesMode(false);
    setAttributionsPerPhoto([]);
    setPlacesLoading(true);

    void (async () => {
      try {
        const r = await fetch("/api/places/config", { signal: controller.signal });
        const cfg = (await r.json()) as { googlePlacesPhotosEnabled?: boolean };
        if (cancelled) {
          return;
        }
        if (!cfg.googlePlacesPhotosEnabled) {
          if (!cancelled) {
            onNoPhotoRef.current?.();
          }
          return;
        }
        const attrRes = await fetch(`/api/places/photo-attributions?homeId=${item.id}`, {
          signal: controller.signal,
        });
        if (cancelled) {
          return;
        }
        if (!attrRes.ok) {
          if (!cancelled) {
            onNoPhotoRef.current?.();
          }
          return;
        }
        const j = (await attrRes.json()) as {
          photos?: { htmlAttributions?: string[] }[];
        };
        const metas = j.photos ?? [];
        if (cancelled) {
          return;
        }
        if (metas.length === 0) {
          onNoPhotoRef.current?.();
          return;
        }
        setTopPlacesMode(true);
        setPhotoIndex(0);
        setFailedUrls(new Set());
        setTopGallery(metas.map((_, i) => `/api/places/photo?homeId=${item.id}&index=${i}`));
        setAttributionsPerPhoto(metas.map((p) => p.htmlAttributions ?? []));
      } catch {
        // タイムアウト・ネットワークエラー時は写真なし（サンプルは出さない）
        if (!cancelled) {
          onNoPhotoRef.current?.();
        }
      } finally {
        if (!cancelled) {
          setPlacesLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isTop, item.id, itemGallery]);

  const markImageFailed = (src: string) => {
    setFailedUrls((prev) => {
      if (prev.has(src)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  };

  useEffect(() => {
    if (!isTop || !topPlacesMode || !topGallery?.length) {
      return;
    }
    if (topGallery.every((url) => failedUrls.has(url))) {
      setTopPlacesMode(false);
      setTopGallery([]);
      setAttributionsPerPhoto([]);
      onNoPhotoRef.current?.();
    }
  }, [failedUrls, isTop, topGallery, topPlacesMode]);

  const stripGallery = isTop ? (topGallery ?? itemGallery) : itemGallery;
  const activeGallery = useMemo(() => {
    return stripGallery.filter((src) => src && !failedUrls.has(src) && !isSampleImageUrl(src));
  }, [stripGallery, failedUrls]);

  useEffect(() => {
    if (activeGallery.length === 0) {
      setPhotoIndex(0);
      return;
    }
    if (photoIndex >= activeGallery.length) {
      setPhotoIndex(Math.max(0, activeGallery.length - 1));
    }
  }, [activeGallery.length, photoIndex]);

  const showTopHeroPulse = isTop && placesLoading && activeGallery.length === 0;
  const heroDisplaySrc = activeGallery[photoIndex];
  const placesPhotoIndex = topPlacesMode && heroDisplaySrc ? stripGallery.indexOf(heroDisplaySrc) : -1;

  const handleImageError = (src: string) => {
    markImageFailed(src);
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-12, 0, 12]);
  const dragControls = useDragControls();

  const likeOpacity = useTransform(x, [20, 170], [0, 1]);
  const nopeOpacity = useTransform(x, [-170, -20], [1, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!canSwipe) {
      return;
    }
    if (info.offset.x > 120 || info.velocity.x > 500) {
      onAction("right");
      return;
    }
    if (info.offset.x < -120 || info.velocity.x < -500) {
      onAction("left");
    }
  };

  const startHeroDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isTop || !canSwipe) {
      return;
    }
    // 詳細パネルのスクロールと干渉しないよう、写真エリアからのみスワイプ開始
    dragControls.start(event);
  };

  return (
    <motion.div
      className="absolute inset-0"
      animate={{ scale: isTop ? 1 : 0.96, opacity: isTop ? 1 : 0.82, y: isTop ? 0 : 10 }}
      drag={isTop && canSwipe ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragControls={dragControls}
      dragElastic={0.9}
      dragListener={false}
      dragMomentum
      exit={
        exitDirection === "right"
          ? {
              x: 1000,
              rotate: 20,
              scale: 1.05,
              opacity: 0,
              transition: { duration: 0.42, ease: "easeOut" },
            }
          : exitDirection === "left"
            ? { x: -1000, opacity: 0, transition: { duration: 0.38, ease: "easeOut" } }
            : { opacity: 0, transition: { duration: 0.28, ease: "easeOut" } }
      }
      initial={isTop ? { scale: 0.95, y: 48, opacity: 0.95 } : { scale: 0.93, y: 28, opacity: 0.75 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 26,
        mass: 0.95,
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#161d18] shadow-[0_28px_90px_-20px_rgba(0,0,0,0.55)]">
        <div
          className={`relative h-[68%] w-full overflow-hidden ${isTop && canSwipe ? "cursor-grab active:cursor-grabbing touch-none" : ""}`}
          onPointerDown={startHeroDrag}
        >
          {showTopHeroPulse || (!heroDisplaySrc && onNoPhoto) ? (
            <div
              aria-hidden
              className="card-loading-shimmer h-full w-full"
            />
          ) : heroDisplaySrc ? (
            <img
              alt={item.title}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
              src={heroDisplaySrc}
              onError={() => handleImageError(heroDisplaySrc)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1a221c] text-sm text-[#6f7a70]">
              No photo
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end pointer-events-none">
            <div className="w-full space-y-2.5 px-3.5 pb-3.5 pt-16">
              {activeGallery.length > 1 ? (
                <div
                  className="hide-scrollbar flex gap-1.5 overflow-x-auto pointer-events-auto"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {activeGallery.map((src, i) => (
                    <motion.button
                      className={`relative h-11 w-[4.25rem] shrink-0 overflow-hidden rounded-lg border transition-[box-shadow,opacity] ${
                        photoIndex === i
                          ? "border-white/90 opacity-100 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)]"
                          : "border-white/30 opacity-75"
                      }`}
                      key={`${item.id}-g-${src}-${i}`}
                      onClick={() => setPhotoIndex(i)}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.94 }}
                    >
                      <img
                        alt=""
                        className="h-full w-full object-cover"
                        draggable={false}
                        src={src}
                        onError={() => handleImageError(src)}
                      />
                    </motion.button>
                  ))}
                </div>
              ) : null}
              <div className="rounded-xl border border-white/12 bg-[#0e1210]/72 px-3.5 py-3 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <h2 className="font-brand min-w-0 flex-1 text-lg font-medium leading-snug tracking-tight text-[#e8efe6] line-clamp-2 sm:text-xl">
                    {item.title}
                  </h2>
                  <span className="mt-0.5 shrink-0 rounded-full border border-white/15 bg-white/8 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#a8b89a]">
                    {item.category}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-[#8a9688] line-clamp-2 sm:text-sm">
                  {[item.location, item.priceRange].filter(Boolean).join("  ·  ") || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="relative h-[32%] overflow-y-auto overscroll-contain bg-[#141a16] px-5 py-4"
          style={{ touchAction: "pan-y" }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {item.description ? (
            <p className="text-sm leading-6 text-[#c5cfc0]">{item.description}</p>
          ) : null}

          {(item.websiteUrl?.trim() || mapsHref) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.websiteUrl?.trim() ? (
                <a
                  className="inline-flex items-center rounded-full bg-[#6b7f5e] px-3.5 py-1.5 text-xs font-medium text-[#0e1210] transition active:scale-[0.97]"
                  href={item.websiteUrl.trim()}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  公式サイト
                </a>
              ) : null}
              {mapsHref ? (
                <a
                  className="inline-flex items-center rounded-full border border-white/20 bg-transparent px-3.5 py-1.5 text-xs font-medium text-[#a8b89a] transition active:scale-[0.97]"
                  href={mapsHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Googleマップ
                </a>
              ) : null}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-white/8 bg-[#1a221c] px-3 py-2.5">
              <p className="text-[#6f7a70]">価格帯</p>
              <p className="mt-0.5 font-medium text-[#e8efe6]">{item.priceRange || "未設定"}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#1a221c] px-3 py-2.5">
              <p className="text-[#6f7a70]">評価</p>
              <p className="mt-0.5 font-medium text-[#e8efe6]">★ {item.rating || "未設定"}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#1a221c] px-3 py-2.5">
              <p className="text-[#6f7a70]">ジャンル</p>
              <p className="mt-0.5 font-medium text-[#e8efe6]">{item.cuisineType || "未設定"}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#1a221c] px-3 py-2.5">
              <p className="text-[#6f7a70]">営業時間</p>
              <p className="mt-0.5 font-medium text-[#e8efe6]">{item.openingHours || "未設定"}</p>
            </div>
          </div>
          {isTop &&
          topPlacesMode &&
          placesPhotoIndex >= 0 &&
          (attributionsPerPhoto[placesPhotoIndex]?.length ?? 0) > 0 ? (
            <p
              className="mt-3 border-t border-white/8 pt-3 text-[10px] leading-relaxed text-[#5a635a] [&_a]:text-[#8a9688] [&_a]:underline"
              dangerouslySetInnerHTML={{
                __html: attributionsPerPhoto[placesPhotoIndex]!.join(" "),
              }}
            />
          ) : null}
        </div>
      </div>

      {isTop && canSwipe ? (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1a2a1c]/55 backdrop-blur-[2px]"
            style={{ opacity: likeOpacity }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#a8b89a]/40 bg-[#0e1210]/80">
              <svg aria-hidden className="h-9 w-9 text-[#a8b89a]" fill="none" viewBox="0 0 24 24">
                <path
                  className="fill-current"
                  d="M12.2 3.2c4.8 1.1 8.1 5.6 7.6 10.6-.4 4.2-3.6 7.5-7.6 8.2-4.1-.6-7.4-4-7.8-8.3-.5-4.9 2.7-9.3 7.8-10.5Z"
                />
              </svg>
            </div>
            <p className="font-brand mt-3 text-3xl font-medium tracking-wide text-[#e8efe6]">Like</p>
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0c0a]/62 backdrop-blur-[2px]"
            style={{ opacity: nopeOpacity }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-[#0e1210]/80">
              <svg aria-hidden className="h-9 w-9 rotate-[28deg] text-[#6f7a70]" fill="none" viewBox="0 0 24 24">
                <path
                  className="fill-current"
                  d="M12.2 3.2c4.8 1.1 8.1 5.6 7.6 10.6-.4 4.2-3.6 7.5-7.6 8.2-4.1-.6-7.4-4-7.8-8.3-.5-4.9 2.7-9.3 7.8-10.5Z"
                />
              </svg>
            </div>
            <p className="font-brand mt-3 text-3xl font-medium tracking-wide text-[#c5cfc0]">Fall</p>
          </motion.div>
        </>
      ) : null}
    </motion.div>
  );
}
