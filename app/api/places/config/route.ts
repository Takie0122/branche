import { NextResponse } from "next/server";
import { isPlacesPhotoConfigured } from "@/app/lib/placesPhoto";

/** クライアントが Places 写真を試すかどうかの判定用（キーは返さない） */
export async function GET() {
  return NextResponse.json({
    googlePlacesPhotosEnabled: isPlacesPhotoConfigured(),
  });
}
