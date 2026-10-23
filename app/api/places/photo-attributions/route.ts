import { type NextRequest, NextResponse } from "next/server";
import { getPlacePhotosMetaForHomeId, getPlacePhotosMetaForPlaceId } from "@/app/lib/placesPhoto";

/** Places 写真ごとの html_attributions（表示義務あり）。最大5件。 */
export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId")?.trim() ?? "";
  const homeIdParam = req.nextUrl.searchParams.get("homeId");

  let list;
  if (placeId) {
    if (placeId.length > 256 || Number.isFinite(Number(placeId))) {
      return NextResponse.json({ error: "invalid placeId" }, { status: 400 });
    }
    list = await getPlacePhotosMetaForPlaceId(placeId);
  } else if (homeIdParam) {
    const homeId = Number(homeIdParam);
    if (!Number.isFinite(homeId)) {
      return NextResponse.json({ error: "invalid homeId" }, { status: 400 });
    }
    list = await getPlacePhotosMetaForHomeId(homeId);
  } else {
    return NextResponse.json({ error: "homeId or placeId required" }, { status: 400 });
  }
  const photos = (list ?? []).map((p) => ({ htmlAttributions: p.htmlAttributions }));

  return NextResponse.json({
    photos,
    /** 後方互換：先頭写真の帰属のみ */
    htmlAttributions: list?.[0]?.htmlAttributions ?? [],
  });
}
