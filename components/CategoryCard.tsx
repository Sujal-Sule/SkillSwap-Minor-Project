import React from "react";
import type { Category } from "../types";

interface CategoryCardProps {
  category: Category;
  onClick?: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const lightColorClasses: Record<string, string> = {
    sky: "from-sky-100 to-white border-sky-200 text-sky-700",
    purple: "from-purple-100 to-white border-purple-200 text-purple-700",
    emerald: "from-emerald-100 to-white border-emerald-200 text-emerald-700",
    rose: "from-rose-100 to-white border-rose-200 text-rose-700",
    slate: "from-slate-100 to-white border-slate-200 text-slate-700",
  };

  const darkColorClasses: Record<string, string> = {
    sky: "dark:from-sky-500/30 dark:to-slate-900/10 dark:border-sky-500/50 dark:text-sky-300",
    purple:
      "dark:from-purple-500/30 dark:to-slate-900/10 dark:border-purple-500/50 dark:text-purple-300",
    emerald:
      "dark:from-emerald-500/30 dark:to-slate-900/10 dark:border-emerald-500/50 dark:text-emerald-300",
    rose: "dark:from-rose-500/30 dark:to-slate-900/10 dark:border-rose-500/50 dark:text-rose-300",
    slate:
      "dark:from-slate-500/30 dark:to-slate-900/10 dark:border-slate-500/50 dark:text-slate-300",
  };

  const cardClass = `${lightColorClasses[category.color] || lightColorClasses.slate} ${darkColorClasses[category.color] || darkColorClasses.slate}`;
  const hoverClass =
    "hover:border-slate-400/50 dark:hover:border-white/50 hover:shadow-lg hover:-translate-y-1";

  return (
    <button
      onClick={() => onClick?.(category.id)}
      className={`group relative p-8 rounded-2xl bg-gradient-to-br border overflow-hidden transition-all duration-200 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 ${cardClass} ${hoverClass}`}
    >
      <div className="relative z-10">
        <category.icon className="w-11 h-11 mb-4" />
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
          {category.name}
        </h3>
      </div>
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full transition-transform duration-500 group-hover:scale-[8]"></div>
    </button>
  );
};

export default CategoryCard;
