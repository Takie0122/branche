type FeedCard = {
  id: number;
  title: string;
  category: string;
  image: string;
};

type CardProps = {
  item: FeedCard;
};

function SaveIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export default function Card({ item }: CardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-transform duration-200 active:scale-[0.99]">
      <img alt={item.title} className="h-52 w-full object-cover" src={item.image} />
      <div className="flex items-start justify-between p-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{item.category}</p>
        </div>
        <button
          aria-label={`${item.title} を保存`}
          className="rounded-full p-2 text-gray-600 transition-colors active:bg-gray-100"
          type="button"
        >
          <SaveIcon />
        </button>
      </div>
    </article>
  );
}

export type { FeedCard };
