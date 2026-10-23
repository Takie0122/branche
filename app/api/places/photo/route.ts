import { type NextRequest, NextResponse } from "next/server";
import {
  getPlacePhotosMetaForHomeId,
  getPlacePhotosMetaForPlaceId,
  getPlacesApiKey,
  MAX_PLACE_PHOTOS,
} from "@/app/lib/placesPhoto";

/**
 * Google Places の店舗写真をプロキシ（API キーはサーバーのみ）。
 * Query: homeId（カタログ）または placeId（開始前お気に入り）、index = 0..4（既定 0）
 */
export async function GET(req: NextRequest) {
  const key = getPlacesApiKey();
  if (!key) {
    return new NextResponse("Places API key not configured", { status: 501 });
  }

  const indexParam = req.nextUrl.searchParams.get("index") ?? "0";
  const index = Number(indexParam);
  if (!Number.isInteger(index) || index < 0 || index >= MAX_PLACE_PHOTOS) {
    return new NextResponse("invalid index", { status: 400 });
  }

  const placeId = req.nextUrl.searchParams.get("placeId")?.trim();
  const homeIdParam = req.nextUrl.searchParams.get("homeId");

  let photos;
  if (placeId) {
    photos = await getPlacePhotosMetaForPlaceId(placeId);
  } else if (homeIdParam) {
    const homeId = Number(homeIdParam);
    if (!Number.isFinite(homeId)) {
      return new NextResponse("invalid homeId", { status: 400 });
    }
    photos = await getPlacePhotosMetaForHomeId(homeId);
  } else {
    return new NextResponse("homeId or placeId required", { status: 400 });
  }

  const meta = photos?.[index];
  if (!meta) {
    return new NextResponse("Photo not available", { status: 404 });
  }

  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${encodeURIComponent(meta.photoReference)}&key=${key}`;
  const imgRes = await fetch(photoUrl);
  if (!imgRes.ok) {
    return new NextResponse("Upstream photo error", { status: 502 });
  }

  const buf = await imgRes.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": imgRes.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
