"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import type { MapRestaurant } from "./mapTypes";

type MapFocus = {
  id: string;
  lat: number;
  lng: number;
};

type MapViewProps = {
  restaurants: MapRestaurant[];
  selectedRestaurant: MapRestaurant | null;
  onSelectRestaurant: (restaurant: MapRestaurant) => void;
  /** 検索で選んだ店へ地図を寄せる */
  focus?: MapFocus | null;
};

const mapContainerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: 35.681236, lng: 139.767125 }; // 東京駅付近

function computeCenter(restaurants: MapRestaurant[]): google.maps.LatLngLiteral {
  if (restaurants.length === 0) return defaultCenter;
  const sum = restaurants.reduce(
    (acc, r) => ({ lat: acc.lat + r.lat, lng: acc.lng + r.lng }),
    { lat: 0, lng: 0 },
  );
  return {
    lat: sum.lat / restaurants.length,
    lng: sum.lng / restaurants.length,
  };
}

export default function MapView({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  focus = null,
}: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "branche-google-map",
    googleMapsApiKey: apiKey,
  });

  const center = useMemo(
    () => (focus ? { lat: focus.lat, lng: focus.lng } : computeCenter(restaurants)),
    [focus, restaurants],
  );
  const zoom = focus ? 15 : 11;

  useEffect(() => {
    if (!focus || !mapRef.current) {
      return;
    }
    mapRef.current.panTo({ lat: focus.lat, lng: focus.lng });
    mapRef.current.setZoom(15);
  }, [focus]);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: "greedy",
    }),
    [],
  );

  if (!apiKey) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#eae7df] px-6 text-center">
        <p className="text-sm font-medium text-[#1c1c1c]">Google Maps API キーが未設定です</p>
        <p className="text-xs leading-relaxed text-[#6b7280]">
          プロジェクト直下に <code className="rounded bg-black/5 px-1">.env.local</code> を作成し、
          <br />
          <code className="rounded bg-black/5 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=あなたのキー</code>
          <br />
          を設定して開発サーバーを再起動してください。
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#eae7df] px-6 text-center">
        <p className="text-sm text-red-700">
          マップの読み込みに失敗しました。APIキー・請求・Maps JavaScript API の有効化を確認してください。
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#eae7df]">
        <p className="text-sm text-[#6b7280]">地図を読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <GoogleMap
        center={center}
        mapContainerStyle={mapContainerStyle}
        onLoad={(map) => {
          mapRef.current = map;
          if (focus) {
            map.panTo({ lat: focus.lat, lng: focus.lng });
            map.setZoom(15);
          }
        }}
        options={mapOptions}
        zoom={zoom}
      >
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            onClick={() => onSelectRestaurant(restaurant)}
            position={{ lat: restaurant.lat, lng: restaurant.lng }}
            title={restaurant.name}
            icon={
              selectedRestaurant?.id === restaurant.id
                ? {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#14573f",
                    fillOpacity: 1,
                    scale: 10,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                  }
                : undefined
            }
          />
        ))}
      </GoogleMap>
    </div>
  );
}
