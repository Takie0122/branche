"use client";

import CategoryCard, { type CategoryItem } from "./CategoryCard";

const categories: CategoryItem[] = [
  {
    name: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Movie",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Book",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Cafe",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Travel",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  },
];

export default function CategoryScreen() {
  return (
    <div className="relative h-full overflow-hidden bg-[#f5f3ee]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")',
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex h-16 items-center justify-between px-4">
          <h1 className="font-brand text-2xl text-[#0f3d2e]">Branche</h1>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7e1d3] text-[#0f3d2e] shadow-sm"
            type="button"
          >
            <span className="text-base">◯</span>
          </button>
        </header>

        <div className="px-4 pb-1">
          <input
            className="w-full rounded-full bg-[#f1efe8] px-4 py-3 text-sm text-[#1c1c1c] placeholder:text-[#6b7280]"
            placeholder="検索"
            type="text"
          />
        </div>

        <div className="hide-scrollbar flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 p-4">
            {categories.map((item) => (
              <CategoryCard item={item} key={item.name} />
            ))}
          </div>
        </div>
      </div>

      <button
        className="absolute bottom-24 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-green-800 text-3xl font-light text-white shadow-xl"
        type="button"
      >
        +
      </button>
    </div>
  );
}
