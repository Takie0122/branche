const categories = ["All", "Fashion", "Restaurants", "Hotels", "Cafes", "Places"];

export default function CategoryTabs() {
  return (
    <nav className="sticky top-[73px] z-20 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="hide-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth">
        {categories.map((category, index) => (
          <button
            key={category}
            className={`snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              index === 0
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 active:bg-gray-200"
            }`}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  );
}
