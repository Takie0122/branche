"use client";

import { motion } from "framer-motion";

type CategoryItem = {
  name: string;
  image: string;
};

type CategoryCardProps = {
  item: CategoryItem;
};

export default function CategoryCard({ item }: CategoryCardProps) {
  return (
    <motion.button
      className="overflow-hidden rounded-2xl shadow-md"
      onClick={() => console.log(item.name)}
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative aspect-[4/5] w-full">
        <img
          alt={item.name}
          className="h-full w-full object-cover"
          draggable={false}
          src={item.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-base font-semibold text-white">{item.name}</p>
        </div>
      </div>
    </motion.button>
  );
}

export type { CategoryItem };
