/** マップ上のレストラン（Google Maps は緯度経度で配置） */
export type MapRestaurant = {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  /** 互換用。実表示は Places 写真（homeId）を優先 */
  image?: string;
  images?: string[];
  /** homeRestaurantsDetail の id（Places 写真取得用） */
  homeId?: number;
  websiteUrl?: string;
  googleMapsUrl?: string;
  rating: number;
  category?: string;
};
