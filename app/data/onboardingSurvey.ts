/**
 * Branche MVP オンボーディングアンケート
 * - UI表示: 日本語
 * - 内部データ: 英語タグ
 * - 30〜60秒で回答できる選択式中心
 */

// ========== 型定義 ==========

/** アンケート回答の保存形式（レコメンドロジックで利用） */
export type UserPreferences = {
  style_preferences: StylePreference[];
  avoid_preferences: AvoidPreference[];
  budget_levels: BudgetLevel[]; // 複数選択・最大3つ
  use_cases: UseCase[];
  travel_distances: TravelDistance[]; // 複数選択・最大3つ
  seed_restaurants: string[]; // レストランID（Q6で選択した最大3件）
};

export type StylePreference =
  | "casual"
  | "stylish"
  | "quiet"
  | "popular"
  | "hidden"
  | "trendy"
  | "luxury";

export type AvoidPreference =
  | "noisy"
  | "chain"
  | "expensive"
  | "long_queue"
  | "too_casual"
  | "none";

export type BudgetLevel = "budget_low" | "budget_mid" | "budget_high" | "budget_luxury";

export type UseCase = "date" | "friends" | "solo" | "business" | "special";

export type TravelDistance = "walk" | "30min" | "60min" | "anywhere";

/** 単一選択肢 */
export type SingleOption<T> = {
  labelJa: string;
  value: T;
};

/** 複数選択肢（maxSelect で上限） */
export type MultiOptionConfig = {
  labelJa: string;
  value: string;
};

/** 質問の種類 */
export type QuestionType = "multi" | "single";

/** 質問1つのUIデータ */
export type QuestionConfig =
  | {
      id: string;
      type: "multi";
      questionJa: string;
      options: MultiOptionConfig[];
      maxSelect: number;
    }
  | {
      id: string;
      type: "single";
      questionJa: string;
      options: SingleOption<string>[];
    };

// ========== アンケート構成（6問） ==========

export const ONBOARDING_QUESTIONS: QuestionConfig[] = [
  {
    id: "q1",
    type: "multi",
    questionJa: "普段よく行くタイプのお店を教えてください",
    maxSelect: 3,
    options: [
      { labelJa: "カジュアルな居酒屋", value: "casual" },
      { labelJa: "おしゃれなレストラン", value: "stylish" },
      { labelJa: "落ち着いた大人のお店", value: "quiet" },
      { labelJa: "コスパの良い人気店", value: "popular" },
      { labelJa: "隠れ家レストラン", value: "hidden" },
      { labelJa: "トレンドのお店", value: "trendy" },
      { labelJa: "高級レストラン", value: "luxury" },
    ],
  },
  {
    id: "q2",
    type: "multi",
    questionJa: "あまり好みではないお店はありますか？",
    maxSelect: 3,
    options: [
      { labelJa: "騒がしいお店", value: "noisy" },
      { labelJa: "チェーン店", value: "chain" },
      { labelJa: "高すぎるお店", value: "expensive" },
      { labelJa: "行列が長いお店", value: "long_queue" },
      { labelJa: "カジュアルすぎるお店", value: "too_casual" },
      { labelJa: "特にない", value: "none" },
    ],
  },
  {
    id: "q3",
    type: "multi",
    questionJa: "普段のディナー予算はどのくらいですか？",
    maxSelect: 3,
    options: [
      { labelJa: "〜2000円", value: "budget_low" },
      { labelJa: "2000円〜5000円", value: "budget_mid" },
      { labelJa: "5000円〜10000円", value: "budget_high" },
      { labelJa: "10000円以上", value: "budget_luxury" },
    ],
  },
  {
    id: "q4",
    type: "multi",
    questionJa: "どんなシーンでお店を探すことが多いですか？",
    maxSelect: 3,
    options: [
      { labelJa: "デート", value: "date" },
      { labelJa: "友達と", value: "friends" },
      { labelJa: "一人ご飯", value: "solo" },
      { labelJa: "接待・会食", value: "business" },
      { labelJa: "特別な日", value: "special" },
    ],
  },
  {
    id: "q5",
    type: "multi",
    questionJa: "お店までどのくらい移動できますか？",
    maxSelect: 3,
    options: [
      { labelJa: "徒歩圏内", value: "walk" },
      { labelJa: "30分以内", value: "30min" },
      { labelJa: "1時間以内", value: "60min" },
      { labelJa: "良さそうならどこでも", value: "anywhere" },
    ],
  },
  // Q6 は別扱い（レストランカード選択）→ 画面側で seed_restaurants を設定
];

// ========== サンプル回答 JSON（レコメンドロジック用の参照例） ==========

export const SAMPLE_USER_PREFERENCES: UserPreferences = {
  style_preferences: ["stylish", "quiet", "hidden"],
  avoid_preferences: ["noisy", "chain"],
  budget_levels: ["budget_mid", "budget_high"],
  use_cases: ["date", "special"],
  travel_distances: ["30min", "60min"],
  seed_restaurants: ["1", "5", "12"],
};

/*
 * 回答データのレコメンドロジックでの利用イメージ:
 *
 * 1. style_preferences → ポジティブ嗜好。レストランの「雰囲気・スタイル」タグとマッチングし、
 *    スコアを加算。casual/stylish/quiet 等で初期レコメンドの方向性を決定。
 *
 * 2. avoid_preferences → ネガティブ嗜好。該当するお店はフィルタまたはスコア減算。
 *    "none" のときは避けたい条件なし。
 *
 * 3. budget_levels → 価格帯フィルタ（複数可）。選択した価格帯のレストランをレコメンド。
 *
 * 4. use_cases → シーンに応じたレコメンド。date なら雰囲気重視、business なら格式などで
 *    ランキングや説明ラベル（「デートにぴったり」）を生成。
 *
 * 5. travel_distances → 地理フィルタ（複数可）。walk/30min/60min/anywhere の組み合わせで範囲を反映。
 *
 * 6. seed_restaurants → コールドスタート解決。user_embedding = average(selected_restaurant_embeddings)
 *    で疑似ベクトルを作成し、類似レストランをレコメンド。説明ラベルは
 *    「〇〇に似たお店」として表示可能。
 */
