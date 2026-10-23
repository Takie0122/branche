import { NextResponse } from "next/server";
import { filterHomeRestaurantsForSwipeDeck } from "@/app/data/homeRestaurants";
import { getPlacePhotosMetaForHomeId, isPlacesPhotoConfigured } from "@/app/lib/placesPhoto";

/** ホームスワイプに載せてよい（Places 写真が取れる）店の id 一覧 */
export async function GET() {
  if (!isPlacesPhotoConfigured()) {
    return NextResponse.json({ ids: [] as number[] });
  }

  const candidates = filterHomeRestaurantsForSwipeDeck();
  const flags = await Promise.all(
    candidates.map(async (row) => {
      const photos = await getPlacePhotosMetaForHomeId(row.id);
      return photos && photos.length > 0 ? row.id : null;
    }),
  );
  const ids = flags.filter((id): id is number => id !== null);

  return NextResponse.json({ ids });
}
