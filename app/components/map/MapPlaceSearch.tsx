"use client";

import { useEffect, useState } from "react";

export type PlaceSearchHit = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
};

type MapPlaceSearchProps = {
  savedIds: ReadonlySet<string>;
  onPick: (hit: PlaceSearchHit) => void;
};

export default function MapPlaceSearch({ savedIds, onPick }: MapPlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PlaceSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settledQuery, setSettledQuery] = useState("");

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setError(null);
      setLoading(false);
      setSettledQuery("");
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void (async () => {
        try {
          const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`);
          const data = (await res.json()) as { results?: PlaceSearchHit[]; error?: string };
          if (cancelled) {
            return;
          }
          if (!res.ok) {
            setHits([]);
            setSettledQuery(q);
            setError("検索に失敗しました。しばらくしてから再度お試しください。");
            return;
          }
          setHits(data.results ?? []);
          setSettledQuery(q);
        } catch {
          if (!cancelled) {
            setHits([]);
            setSettledQuery(q);
            setError("ネットワークエラーです。");
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
    }, 380);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="mt-2">
      <label className="sr-only" htmlFor="map-place-search">
        店名で検索
      </label>
      <input
        autoComplete="off"
        className="w-full rounded-full border border-[#e4ddd0] bg-white/90 px-4 py-2.5 text-sm text-[#1c1c1c] outline-none placeholder:text-[#8a8478] focus:border-[#1f6f54]"
        id="map-place-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="気に入ってる店を検索"
        type="search"
        value={query}
      />
      {loading ? <p className="px-3 pt-2 text-xs text-[#6b7280]">検索中…</p> : null}
      {error ? <p className="px-3 pt-2 text-xs text-[#9b4d4d]">{error}</p> : null}
      {!loading && !error && settledQuery === query.trim() && query.trim().length >= 2 && hits.length === 0 ? (
        <p className="px-3 pt-2 text-xs text-[#6b7280]">見つかりませんでした。</p>
      ) : null}
      {hits.length > 0 ? (
        <ul className="mt-2 max-h-52 space-y-1 overflow-y-auto">
          {hits.map((hit) => {
            const saved = savedIds.has(hit.placeId);
            return (
              <li key={hit.placeId}>
                <button
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left active:bg-[#efeae0]"
                  onClick={() => {
                    onPick(hit);
                    setQuery("");
                    setHits([]);
                  }}
                  onMouseDown={(event) => {
                    // 検索欄からフォーカスが外れると、次のクリックが届かないことがある
                    event.preventDefault();
                  }}
                  onTouchEnd={(event) => {
                    // iPhone ではキーボードを閉じる操作にタップが使われ、click が飛ばない
                    event.preventDefault();
                    onPick(hit);
                    setQuery("");
                    setHits([]);
                  }}
                  type="button"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#1c1c1c]">{hit.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-[#6b7280]">{hit.address}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-[#1f6f54]">
                    {saved ? "追加済み" : "開く"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
