import type { MapRestaurant } from "../components/map/mapTypes";
import {
  resolveHomeGoogleMapsUrl,
  resolveHomeWebsiteUrl,
} from "../lib/venueDisplay";

/**
 * 実在店ベースのシードデータ（名前・所在地・座標は公開情報に基づく）。
 * 画像はジャンルに合わせたイラスト用ストック（実店舗の公式写真ではない）。Places 写真APIと差し替え可能。
 * 任意で Google Places の place_id を紐づけられる（将来の詳細取得用）。
 */
export type HomeRestaurantDetail = {
  id: number;
  title: string;
  location: string;
  category: string;
  image: string;
  description: string;
  cuisineType: string;
  priceRange: string;
  rating: string;
  openingHours: string;
  lat: number;
  lng: number;
  /** 後から Places Details を叩くとき用（未設定でも可） */
  googlePlaceId?: string;
  /** 最大5枚想定。省略時は `image` とジャンル別ストックで補完（`@/app/lib/venueDisplay`） */
  images?: string[];
  /** 公式サイトなど */
  websiteUrl?: string;
  /** 店舗の Google マップ（未指定時は店名＋住所から自動生成） */
  googleMapsUrl?: string;
};

export const homeRestaurantsDetail: HomeRestaurantDetail[] = [
  // Italian (4)
  {
    id: 1,
    title: "Pizzeria e Trattoria da ISA",
    location: "東京都目黒区上目黒1-29-4",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    description:
      "中目黒の人気ピッツェリア。薪窯ナポリピザが看板。予約推奨のことが多い名店です。",
    cuisineType: "Italian",
    priceRange: "$$",
    rating: "4.5",
    openingHours: "11:30–15:00 / 18:00–22:00",
    lat: 35.643_55,
    lng: 139.698_85,
  },
  {
    id: 2,
    title: "Savoy Tomato and Cheese",
    location: "東京都港区麻布十番3-3-13",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1600&q=80",
    description: "麻布十番のマルゲリータが名物のピザ専門店。カウンター中心のコンパクトな店舗です。",
    cuisineType: "Italian",
    priceRange: "$$",
    rating: "4.4",
    openingHours: "11:30–14:30 / 17:30–21:30",
    lat: 35.653_740_5,
    lng: 139.735_275_8,
    googlePlaceId: "ChIJg5dFuqGLGGAR3GhOVSXuTmA",
  },
  {
    id: 3,
    title: "L'Antica Pizzeria da Michele Aoyama",
    location: "東京都港区南青山5-15-4",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80",
    description: "ナポリ発のピッツェリアの青山店。シンプルなマルゲリータ・マリナーラが人気です。",
    cuisineType: "Italian",
    priceRange: "$$",
    rating: "4.3",
    openingHours: "11:00–22:00",
    lat: 35.664_85,
    lng: 139.713_95,
  },
  {
    id: 4,
    title: "Obicà Mozzarella Bar",
    location: "東京都港区六本木6-10-1 六本木ヒルズ",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80",
    description: "六本木ヒルズ内のイタリアン。水牛モッツァレラを使った料理が特徴です。",
    cuisineType: "Italian",
    priceRange: "$$$",
    rating: "4.2",
    openingHours: "11:00–23:00",
    lat: 35.660_45,
    lng: 139.729_35,
    googlePlaceId: "ChIJcWdN_naLGGAR4b_jIqfloYw",
  },
  // Japanese (4)
  {
    id: 5,
    title: "すきやばし次郎 本店",
    location: "東京都中央区銀座4-2-15",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80",
    description: "銀座の江戸前鮨。予約が取りにくい世界的に有名な鮨店です。",
    cuisineType: "Japanese",
    priceRange: "$$$$",
    rating: "4.8",
    openingHours: "昼・夜（要予約）",
    lat: 35.672_35,
    lng: 139.764_85,
  },
  {
    id: 6,
    title: "焼鳥 おみ乃",
    location: "東京都台東区寿3-19-5",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1600&q=80",
    description: "人形町エリアの焼鳥店。地鶏を炭火で。ミシュラン掲載歴のある人気店です。",
    cuisineType: "Japanese",
    priceRange: "$$$",
    rating: "4.6",
    openingHours: "17:00–23:00",
    lat: 35.702_15,
    lng: 139.788_55,
  },
  {
    id: 7,
    title: "とんかつ まい泉 青山本店",
    location: "東京都渋谷区神宮前3-5-1",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1600&q=80",
    description: "青山のとんかつ老舗。ロース・ヒレかつが定番でテイクアウトも人気です。",
    cuisineType: "Japanese",
    priceRange: "$$",
    rating: "4.4",
    openingHours: "11:00–21:00",
    lat: 35.664_25,
    lng: 139.712_45,
  },
  {
    id: 8,
    title: "AFURI 原宿",
    location: "東京都渋谷区神宮前3-63-1",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=1600&q=80",
    description: "柚子香るスープが特徴のラーメン店。原宿駅近の店舗です。",
    cuisineType: "Japanese",
    priceRange: "$",
    rating: "4.2",
    openingHours: "11:00–23:00",
    lat: 35.668_95,
    lng: 139.702_55,
    googlePlaceId: "ChIJba17TbqMGGARFtDV6hkZbcs",
  },
  // Chinese (4)
  {
    id: 9,
    title: "鼎泰豊 銀座店",
    location: "東京都中央区銀座2-5-4 マロニエゲート銀座2",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1600&q=80",
    description: "小籠包で知られる台湾系飲茶。銀座の商業施設内にあります。",
    cuisineType: "Chinese",
    priceRange: "$$",
    rating: "4.3",
    openingHours: "11:00–21:30",
    lat: 35.671_55,
    lng: 139.764_25,
    googlePlaceId: "ChIJCQ5F7OOLGGARv7h9GWCZhmA",
  },
  {
    id: 10,
    title: "聘珍樓 横浜本店",
    location: "神奈川県横浜市中区山下町192",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1600&q=80",
    description: "横浜中華街の老舗広東料理。点心やフカヒレが定番メニューです。",
    cuisineType: "Chinese",
    priceRange: "$$$",
    rating: "4.2",
    openingHours: "11:00–21:00",
    lat: 35.442_25,
    lng: 139.645_65,
  },
  {
    id: 11,
    title: "赤坂 四川飯店",
    location: "東京都港区赤坂2-14-19",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1600&q=80",
    description: "陳建一氏で知られる四川料理の名店。麻婆豆腐など本格的な味わいです。",
    cuisineType: "Chinese",
    priceRange: "$$$",
    rating: "4.4",
    openingHours: "11:30–15:00 / 17:00–21:00",
    lat: 35.67_05,
    lng: 139.737_35,
  },
  {
    id: 12,
    title: "状元樓 本店",
    location: "東京都港区新橋2-16-1",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1600&q=80",
    description: "新橋の老舗中華。広東料理を中心に、宴会利用も多い店です。",
    cuisineType: "Chinese",
    priceRange: "$$",
    rating: "4.0",
    openingHours: "11:30–14:30 / 17:00–22:00",
    lat: 35.665_85,
    lng: 139.757_45,
  },
  // Cafe (4)
  {
    id: 13,
    title: "スターバックス リザーブ ロースタリー 東京",
    location: "東京都目黒区青葉台2-19-23",
    category: "Cafe",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80",
    description: "世界最大級のロースタリー＆カフェ。焙煎・抽出・バーまで体験できます。",
    cuisineType: "Cafe",
    priceRange: "$$",
    rating: "4.5",
    openingHours: "7:00–22:00",
    lat: 35.649_32,
    lng: 139.692_59,
    googlePlaceId: "ChIJq_fYt4iLGGARrOojmQ4IMyE",
  },
  {
    id: 14,
    title: "Blue Bottle Coffee 青山カフェ",
    location: "東京都港区南青山3-13-14",
    category: "Cafe",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80",
    description: "スペシャルティコーヒーの青山店。軽食と共に利用できます。",
    cuisineType: "Cafe",
    priceRange: "$$",
    rating: "4.3",
    openingHours: "8:00–19:00",
    lat: 35.671_25,
    lng: 139.718_65,
  },
  {
    id: 15,
    title: "ONIBUS COFFEE Nakameguro",
    location: "東京都目黒区上目黒2-14-1",
    category: "Cafe",
    image:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=80",
    description: "中目黒のロースター＆カフェ。電車が見える2階席が人気です。",
    cuisineType: "Cafe",
    priceRange: "$",
    rating: "4.4",
    openingHours: "9:00–19:00",
    lat: 35.641_15,
    lng: 139.698_15,
  },
  {
    id: 16,
    title: "Fuglen Tokyo",
    location: "東京都渋谷区富ヶ谷1-16-11",
    category: "Cafe",
    image:
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1600&q=80",
    description: "ノルウェー発のコーヒー＆バー。昼はカフェ、夜はカクテルも楽しめます。",
    cuisineType: "Cafe",
    priceRange: "$$",
    rating: "4.2",
    openingHours: "7:45–翌3:00",
    lat: 35.664_95,
    lng: 139.689_75,
  },
  // French (5)
  {
    id: 17,
    title: "レフェルヴェソンス",
    location: "東京都港区西麻布2-26-3",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    description: "西麻布のフレンチ。野菜を主役にしたコースが特徴のミシュラン掲載店です。",
    cuisineType: "French",
    priceRange: "$$$$",
    rating: "4.7",
    openingHours: "18:00–23:00",
    lat: 35.662_45,
    lng: 139.724_75,
  },
  {
    id: 18,
    title: "エスキス",
    location: "東京都中央区銀座5-4-6",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
    description: "銀座のモダンフレンチ。コース料理とワインのペアリングが人気です。",
    cuisineType: "French",
    priceRange: "$$$$",
    rating: "4.6",
    openingHours: "12:00–15:00 / 18:00–23:00",
    lat: 35.671_35,
    lng: 139.765_55,
  },
  {
    id: 19,
    title: "ベージュ アラン・デュカス 東京",
    location: "東京都中央区銀座3-5-1",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1600&q=80",
    description: "銀座・シャネルビル内のフレンチ。ラグジュアリーな空間とコース料理です。",
    cuisineType: "French",
    priceRange: "$$$$",
    rating: "4.5",
    openingHours: "12:00–14:30 / 18:30–22:00",
    lat: 35.671_85,
    lng: 139.764_95,
    googlePlaceId: "ChIJDxzYF-SLGGARQYB8-Z27qAI",
  },
  {
    id: 20,
    title: "カンテサンス",
    location: "東京都品川区北品川6-7-29",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80",
    description: "北品川のフレンチ。シンプルな盛り付けとソースが特徴の名店です。",
    cuisineType: "French",
    priceRange: "$$$$",
    rating: "4.8",
    openingHours: "12:00–15:00 / 18:30–22:30",
    lat: 35.623_937_2,
    lng: 139.733_109_4,
    googlePlaceId: "ChIJ8T36HxCLGGARvpARPDyaKLA",
  },
  {
    id: 21,
    title: "ル・コントワール・ド・テト",
    location: "東京都港区西麻布4-1-28",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    description: "西麻布のビストロ。カジュアルにフレンチを楽しめるカウンター席があります。",
    cuisineType: "French",
    priceRange: "$$$",
    rating: "4.4",
    openingHours: "18:00–23:00",
    lat: 35.661_95,
    lng: 139.725_15,
  },
  {
    id: 22,
    title: "権八 西麻布",
    location: "東京都港区西麻布1-13-11",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1600&q=80",
    description:
      "西麻布の和食ダイニング。映画『キル・ビル』の舞台モデルとも言われる佇まいで知られる店です。",
    cuisineType: "Japanese",
    priceRange: "$$$",
    rating: "4.1",
    openingHours: "11:30–翌3:30",
    lat: 35.661_35,
    lng: 139.723_25,
  },
  // —— 渋谷・目黒・港エリアを中心に追加 ——
  {
    id: 23,
    title: "CONA 恵比寿店",
    location: "東京都渋谷区恵比寿南1-6-6",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1600&q=80",
    description: "窯焼きナポリピザとワインのカジュアルイタリアン。恵比寿駅から徒歩圏です。",
    cuisineType: "Italian",
    priceRange: "$$",
    rating: "4.1",
    openingHours: "11:30–15:00 / 17:00–23:30",
    lat: 35.646_95,
    lng: 139.710_05,
  },
  {
    id: 24,
    title: "SALVATORE CUOMO 広尾",
    location: "東京都港区南麻布5-15-25",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1600&q=80",
    description: "薪窯ピザとイタリア料理。広尾・南麻布エリアで長く親しまれている店舗です。",
    cuisineType: "Italian",
    priceRange: "$$$",
    rating: "4.0",
    openingHours: "11:30–22:00",
    lat: 35.650_15,
    lng: 139.722_35,
  },
  {
    id: 25,
    title: "イゾラ フェリーチェ 自由が丘",
    location: "東京都目黒区自由が丘2-9-14",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80",
    description: "自由が丘のトラットリア。パスタ・ピザとイタリアワインが楽しめます。",
    cuisineType: "Italian",
    priceRange: "$$",
    rating: "4.2",
    openingHours: "11:30–15:00 / 17:30–22:30",
    lat: 35.607_45,
    lng: 139.668_95,
    googlePlaceId: "ChIJO_tjcx_1GGARasAlSaYwU_o",
  },
  {
    id: 26,
    title: "ピッコロ ボッソ",
    location: "東京都目黒区碑文谷4-18-16",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    description: "碑文谷の路地裏にある小さなイタリアン。季節のコースと自然派ワインが人気です。",
    cuisineType: "Italian",
    priceRange: "$$$",
    rating: "4.3",
    openingHours: "18:00–23:00",
    lat: 35.623_25,
    lng: 139.672_55,
  },
  {
    id: 27,
    title: "PIZZA SLICE 2",
    location: "東京都渋谷区神宮前4-26-28",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1600&q=80",
    description: "アメリカNYスタイルのピザをスライスで。表参道・原宿散策のついでに立ち寄れます。",
    cuisineType: "Italian",
    priceRange: "$",
    rating: "4.0",
    openingHours: "11:00–21:00",
    lat: 35.667_85,
    lng: 139.706_15,
    googlePlaceId: "ChIJz_sTmDyNGGARhsE4g8GJoeY",
  },
  {
    id: 28,
    title: "鳥しき",
    location: "東京都目黒区目黒1-5-32",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1600&q=80",
    description: "目黒の焼鳥店。席数が少なく予約必須のことが多い名店です。",
    cuisineType: "Japanese",
    priceRange: "$$$$",
    rating: "4.7",
    openingHours: "17:00–23:00（要予約）",
    lat: 35.634_05,
    lng: 139.715_25,
  },
  {
    id: 29,
    title: "とんかつ 王龍 ビール山",
    location: "東京都渋谷区恵比寿1-9-5",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1600&q=80",
    description: "恵比寿のとんかつ店。ロース・ヒレとクラフトビールの組み合わせが人気です。",
    cuisineType: "Japanese",
    priceRange: "$$",
    rating: "4.2",
    openingHours: "11:00–15:00 / 17:00–22:00",
    lat: 35.646_15,
    lng: 139.713_35,
  },
  {
    id: 30,
    title: "焼肉 うしごろ 浜松町本店",
    location: "東京都港区浜松町2-6-5",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=1600&q=80",
    description: "厳選和牛の焼肉。浜松町の立地でビジネス利用も多いです。",
    cuisineType: "Japanese",
    priceRange: "$$$",
    rating: "4.4",
    openingHours: "11:30–15:00 / 17:00–23:30",
    lat: 35.656_85,
    lng: 139.756_15,
  },
  {
    id: 31,
    title: "虎ノ門 鮨玄",
    location: "東京都港区西新橋2-15-6 FACE虎ノ門 B1F",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80",
    description: "名店出身の店主が虎ノ門で営む江戸前鮨。落ち着いたカウンターで旬のネタを楽しめます。",
    cuisineType: "Japanese",
    priceRange: "$$$$",
    rating: "4.6",
    openingHours: "12:00–14:30 / 17:30–22:30",
    lat: 35.667_85,
    lng: 139.749_35,
    websiteUrl: "https://toranomonsushigen.com/",
  },
  {
    id: 32,
    title: "てんぷら 山の上 本店",
    location: "東京都港区愛宕1-5-9",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1600&q=80",
    description: "愛宕山麓の天ぷら。季節の食材をさっくりと揚げたコースが評判です。",
    cuisineType: "Japanese",
    priceRange: "$$$$",
    rating: "4.5",
    openingHours: "11:30–15:00 / 17:00–21:30",
    lat: 35.661_95,
    lng: 139.749_25,
  },
  {
    id: 33,
    title: "九州じゃんがららあめん 渋谷店",
    location: "東京都渋谷区渋谷2-10-9",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=1600&q=80",
    description: "豚骨ラーメンの老舗チェーン渋谷店。ぼんしゃん・ぼかし等トッピングが人気です。",
    cuisineType: "Japanese",
    priceRange: "$",
    rating: "4.1",
    openingHours: "11:00–翌4:00",
    lat: 35.659_55,
    lng: 139.702_85,
  },
  {
    id: 34,
    title: "玄蕎麦 野中",
    location: "東京都練馬区中村2-5-11",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80",
    description: "練馬の蕎麦店。石臼挽きそばと天せいろが定番です。",
    cuisineType: "Japanese",
    priceRange: "$$",
    rating: "4.3",
    openingHours: "11:30–15:00 / 17:00–21:00",
    lat: 35.732_557_9,
    lng: 139.645_140_1,
    googlePlaceId: "ChIJp4za36PtGGARpdNRbnOaMBs",
  },
  {
    id: 35,
    title: "焼鳥 よねやま",
    location: "東京都目黒区青葉台2-25-5",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1600&q=80",
    description: "中目黒・青葉台の焼鳥。希少部位と季節串がカウンターで愉しめます。",
    cuisineType: "Japanese",
    priceRange: "$$$",
    rating: "4.4",
    openingHours: "17:00–23:00",
    lat: 35.647_95,
    lng: 139.696_55,
  },
  {
    id: 36,
    title: "麻辣大学 渋谷店",
    location: "東京都渋谷区神南1-15-4",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1600&q=80",
    description: "四川風の麻辣火鍋と定食。渋谷センター街南側エリアにあります。",
    cuisineType: "Chinese",
    priceRange: "$$",
    rating: "4.0",
    openingHours: "11:30–15:00 / 17:00–22:30",
    lat: 35.662_95,
    lng: 139.701_35,
  },
  {
    id: 37,
    title: "添好运 ティム・ホーワン 表参道店",
    location: "東京都港区北青山3-9-5",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1600&q=80",
    description: "香港発の飲茶専門店。点心盛り合わせと焼き物が人気です。",
    cuisineType: "Chinese",
    priceRange: "$$",
    rating: "4.1",
    openingHours: "11:00–21:00",
    lat: 35.664_55,
    lng: 139.712_25,
  },
  {
    id: 38,
    title: "萬州麺館 麻布十番店",
    location: "東京都港区麻布十番1-6-5",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1600&q=80",
    description: "刀削麺と中華料理。麻布十番の路地に面した店舗です。",
    cuisineType: "Chinese",
    priceRange: "$",
    rating: "4.0",
    openingHours: "11:00–21:30",
    lat: 35.654_95,
    lng: 139.735_85,
  },
  {
    id: 39,
    title: "福満園 新橋店",
    location: "東京都港区新橋2-16-1 ニュー新橋ビル",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1600&q=80",
    description: "新橋の四川・北京系中華。ランチセットと餃子がボリューミーです。",
    cuisineType: "Chinese",
    priceRange: "$$",
    rating: "3.9",
    openingHours: "11:00–22:00",
    lat: 35.665_95,
    lng: 139.757_05,
  },
  {
    id: 40,
    title: "燕記 麻布十番",
    location: "東京都港区麻布十番1-4-12",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1600&q=80",
    description: "広東料理と飲茶。麻布十番商店街沿いの老舗風の一軒です。",
    cuisineType: "Chinese",
    priceRange: "$$",
    rating: "4.0",
    openingHours: "11:30–15:00 / 17:00–22:30",
    lat: 35.654_45,
    lng: 139.736_25,
  },
  {
    id: 41,
    title: "イル・ペンティート",
    location: "東京都渋谷区代々木3-1-3",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    description: "代々木のイタリアン。地中海料理と豊富なワインリストが特徴です。",
    cuisineType: "Italian",
    priceRange: "$$$",
    rating: "4.2",
    openingHours: "17:30–23:30",
    lat: 35.682_269_7,
    lng: 139.696_302_6,
    googlePlaceId: "ChIJzyVNns6MGGARh1ocyi0lq30",
  },
  {
    id: 42,
    title: "オーグードゥジュール",
    location: "東京都千代田区四番町4-8",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
    description: "四番町のフレンチ・ビストロ。ランチコースと自然派ワインが人気です。",
    cuisineType: "French",
    priceRange: "$$$",
    rating: "4.3",
    openingHours: "11:30–14:30 / 18:00–23:00",
    lat: 35.688_652_8,
    lng: 139.736_123_5,
    googlePlaceId: "ChIJ1-EeRGGMGGAR2PhwForxWKg",
  },
  {
    id: 43,
    title: "キュイソン",
    location: "東京都港区南青山5-1-25",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1600&q=80",
    description: "青山のモダンフレンチ。職人技のソースと焼き料理が評価されています。",
    cuisineType: "French",
    priceRange: "$$$$",
    rating: "4.5",
    openingHours: "12:00–15:00 / 18:00–22:30",
    lat: 35.663_95,
    lng: 139.712_85,
  },
  {
    id: 44,
    title: "ウィルビー",
    location: "東京都港区南青山6-3-6",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80",
    description: "南青山のコンテンポラリーフレンチ。季節のテイスティングメニューが楽しめます。",
    cuisineType: "French",
    priceRange: "$$$$",
    rating: "4.4",
    openingHours: "12:00–14:30 / 18:00–22:00",
    lat: 35.661_45,
    lng: 139.710_95,
  },
  {
    id: 45,
    title: "マルゼルブ 広尾",
    location: "東京都渋谷区広尾5-9-3",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
    description: "広尾のフレンチレストラン。クラシックな技法に基づくコース料理です。",
    cuisineType: "French",
    priceRange: "$$$$",
    rating: "4.4",
    openingHours: "12:00–14:30 / 18:00–22:00",
    lat: 35.650_85,
    lng: 139.720_15,
  },
  {
    id: 46,
    title: "イニシャル",
    location: "東京都渋谷区広尾5-17-8",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    description: "広尾のビストロ。リーズナブルにフレンチを楽しめるランチが人気です。",
    cuisineType: "French",
    priceRange: "$$$",
    rating: "4.2",
    openingHours: "11:30–14:30 / 18:00–23:00",
    lat: 35.650_25,
    lng: 139.721_85,
  },
  {
    id: 47,
    title: "ミチノ",
    location: "東京都港区六本木5-17-1",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
    description: "六本木のフレンチ。ワインバー気分で小皿料理からコースまで選べます。",
    cuisineType: "French",
    priceRange: "$$$",
    rating: "4.1",
    openingHours: "17:30–23:30",
    lat: 35.661_25,
    lng: 139.735_95,
  },
  {
    id: 48,
    title: "アロマフェリーチェ",
    location: "東京都港区六本木7-17-24",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80",
    description: "六本木のイタリアン。木目調の店内でパスタ・肉料理・ピザを提供します。",
    cuisineType: "Italian",
    priceRange: "$$$",
    rating: "4.0",
    openingHours: "11:30–15:30 / 17:30–23:00",
    lat: 35.664_15,
    lng: 139.729_65,
  },
  {
    id: 49,
    title: "小肥羊 火鍋 六本木店",
    location: "東京都港区赤坂3-15-17",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1600&q=80",
    description: "本格火鍋のチェーン店。麻辣スープとラムしゃぶが人気です。",
    cuisineType: "Chinese",
    priceRange: "$$",
    rating: "4.0",
    openingHours: "11:30–15:00 / 17:00–23:30",
    lat: 35.663_55,
    lng: 139.733_45,
  },
  {
    id: 50,
    title: "油そば 東京油組総本店 渋谷組",
    location: "東京都渋谷区神南1-19-7",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=1600&q=80",
    description: "油そば専門の人気店。もちもち太麺に黒マー油・酢・辣油で味変できます。",
    cuisineType: "Japanese",
    priceRange: "$",
    rating: "4.2",
    openingHours: "11:00–23:00",
    lat: 35.661_85,
    lng: 139.700_55,
  },
  {
    id: 51,
    title: "うどん 硯家 表参道店",
    location: "東京都渋谷区神宮前4-9-2",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1600&q=80",
    description: "讃岐うどんの人気店。かけ・ぶっかけと天ぷらの組み合わせが定番です。",
    cuisineType: "Japanese",
    priceRange: "$",
    rating: "4.1",
    openingHours: "11:00–21:00",
    lat: 35.667_15,
    lng: 139.707_45,
  },
  {
    id: 52,
    title: "焼肉 ジャンボ 白金",
    location: "東京都港区白金台1-1-23",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1600&q=80",
    description: "ホルモンと焼肉の老舗。白金台の住宅街に構える人気店です。",
    cuisineType: "Japanese",
    priceRange: "$$$",
    rating: "4.3",
    openingHours: "17:00–23:00",
    lat: 35.637_65,
    lng: 139.722_95,
  },
  {
    id: 53,
    title: "鮨 銀座おのでら 迎賓館邸",
    location: "東京都港区元麻布3-5-41",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80",
    description: "麻布エリアの高級鮨。迎賓館近くの静かな立地でコースを提供します。",
    cuisineType: "Japanese",
    priceRange: "$$$$",
    rating: "4.6",
    openingHours: "12:00–14:00 / 18:00–22:30（要予約）",
    lat: 35.653_45,
    lng: 139.727_15,
  },
  {
    id: 54,
    title: "ビストロ・ドゥ・マルティナック",
    location: "東京都目黒区中目黒1-1-8",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1600&q=80",
    description: "中目黒のフレンチビストロ。駅近の気軽さでコースとアラカルトを楽しめます。",
    cuisineType: "French",
    priceRange: "$$$",
    rating: "4.2",
    openingHours: "11:30–15:00 / 17:30–23:00",
    lat: 35.644_55,
    lng: 139.698_85,
  },
];

/** ホームのスワイプデッキに使う区（渋谷・目黒・港） */
export const HOME_SCREEN_WARD_KEYWORDS = ["渋谷区", "目黒区", "港区"] as const;

export function isHomeScreenWardLocation(location: string): boolean {
  return HOME_SCREEN_WARD_KEYWORDS.some((ward) => location.includes(ward));
}

/** ホームのスワイプはレストランのみ（カフェは別ジャンルとして含めない） */
export function filterHomeRestaurantsForSwipeDeck(): HomeRestaurantDetail[] {
  return homeRestaurantsDetail.filter(
    (r) => isHomeScreenWardLocation(r.location) && r.category !== "Cafe"
  );
}

/** デッキ順をランダム化。クライアントの useLayoutEffect 内など、ハイドレーション後に呼ぶこと。 */
export function shuffleForHomeDeck<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j]!;
    copy[j] = tmp!;
  }
  return copy;
}

export function getHomeRestaurantDetailById(id: string): HomeRestaurantDetail | undefined {
  const numId = Number(id);
  if (Number.isNaN(numId)) return undefined;
  return homeRestaurantsDetail.find((r) => r.id === numId);
}

/** マップ画面用（ホームと同一データ源）。写真は Places API 側で取得（サンプル画像は付けない） */
export function homeRestaurantsToMapRestaurants(): MapRestaurant[] {
  return homeRestaurantsDetail.map((r) => ({
    id: String(r.id),
    name: r.title,
    location: r.location,
    lat: r.lat,
    lng: r.lng,
    image: "",
    images: [],
    homeId: r.id,
    websiteUrl: resolveHomeWebsiteUrl(r),
    googleMapsUrl: resolveHomeGoogleMapsUrl(r),
    rating: Number.parseFloat(r.rating) || 0,
    category: r.cuisineType,
  }));
}
