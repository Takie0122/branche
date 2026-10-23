type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto bg-[#f4f1ea] px-5 pb-4 pt-3">
      {categories.map((category) => {
        const isActive = category === selectedCategory;
        return (
          <button
            key={category}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 active:scale-95 ${
              isActive
                ? "bg-[#0f3d2e] text-[#f8f5ef] shadow-[0_8px_20px_rgba(15,61,46,0.2)]"
                : "bg-[#e8f3ef] text-[#1f6f54] hover:bg-[#dcebe5]"
            }`}
            onClick={() => onSelectCategory(category)}
            type="button"
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
