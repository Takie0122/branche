import { type NextRequest, NextResponse } from "next/server";
import { getPlacesApiKey } from "@/app/lib/placesPhoto";

export type PlaceSearchHit = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
};

/** 店名などで Places Text Search（開始前のお気に入り登録用） */
export async function GET(req: NextRequest) {
  const apiKey = getPlacesApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Places API not configured" }, { status: 501 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] as PlaceSearchHit[] });
  }

  const lat = Number(req.nextUrl.searchParams.get("lat") ?? "35.681236");
  const lng = Number(req.nextUrl.searchParams.get("lng") ?? "139.767125");
  const location =
    Number.isFinite(lat) && Number.isFinite(lng) ? `${lat},${lng}` : "35.681236,139.767125";

  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", q);
  url.searchParams.set("type", "restaurant");
  url.searchParams.set("language", "ja");
  url.searchParams.set("region", "jp");
  url.searchParams.set("location", location);
  url.searchParams.set("radius", "50000");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = (await res.json()) as {
    status: string;
    results?: {
      place_id?: string;
      name?: string;
      formatted_address?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
      rating?: number;
    }[];
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return NextResponse.json(
      { error: "Places search failed", status: data.status, results: [] as PlaceSearchHit[] },
      { status: 502 },
    );
  }

  const results: PlaceSearchHit[] = (data.results ?? [])
    .filter((r) => r.place_id && r.name && typeof r.geometry?.location?.lat === "number")
    .slice(0, 8)
    .map((r) => ({
      placeId: r.place_id!,
      name: r.name!,
      address: r.formatted_address ?? "",
      lat: r.geometry!.location!.lat!,
      lng: r.geometry!.location!.lng!,
      ...(typeof r.rating === "number" ? { rating: r.rating } : {}),
    }));

  return NextResponse.json({ results });
}
