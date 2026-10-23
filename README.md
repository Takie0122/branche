This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Google Maps（マップタブ）

1. [Google Cloud Console](https://console.cloud.google.com/) で課金を有効化し、**Maps JavaScript API** を有効にする。
2. API キーを作成し、**アプリケーションの制限**（HTTP リファラー）に `http://localhost:3000/*` などを追加する。
3. プロジェクト直下に `.env.local` を作成:

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=あなたのキー
```

4. `npm run dev` を再起動する。

マップタブで Google マップが表示されます。キー未設定時は案内メッセージのみ表示されます。

## Google Places（ホームの店舗写真）

スワイプカードの画像は、**Places API** が使えると Google の店舗写真を表示できます（API キー未設定時は従来のストック写真）。

1. [Google Cloud Console](https://console.cloud.google.com/) で **Places API**（Legacy の Place Details / Find Place / Place Photo を含むプロダクト）を有効にする。
2. `.env.local` に **`GOOGLE_PLACES_API_KEY`** を追加する（開発だけなら既存の `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` と同じキーでも可。その場合は Maps と同様にリファラー制限でクライアント用、サーバー用でキーを分けると安全）。
3. 店舗は `app/data/homeRestaurants.ts` の **店名＋住所** で Find Place から解決します。ズレを減らしたい行だけ **`googlePlaceId`**（`ChIJ…`）を手で足すと確実です。
4. 写真の**帰属表示**は Google の HTML をカード上に出しています。[利用ポリシー](https://developers.google.com/maps/documentation/places/web-service/policies)に従って運用してください。

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
