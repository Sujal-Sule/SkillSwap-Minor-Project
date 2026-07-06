import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon } from "./icons";
import { categories } from "../data/categories";

interface MatchFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  onlineStatusFilter: "all" | "online";
  setOnlineStatusFilter: (status: "all" | "online") => void;
  tokenRangeFilter: string;
  setTokenRangeFilter: (range: string) => void;
}

const MatchFilterBar: React.FC<MatchFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  onlineStatusFilter,
  setOnlineStatusFilter,
  tokenRangeFilter,
  setTokenRangeFilter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: "any", label: "Any Tokens" },
    { value: "5", label: "5+ Tokens" },
    { value: "10", label: "10+ Tokens" },
    { value: "20", label: "20+ Tokens" },
  ];

  const currentOption = options.find((opt) => opt.value === tokenRangeFilter) || options[0];

  return (
    <div className="space-y-6 mb-10">
      {/* Top Row: Search and Quick Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-start">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-text-muted group-focus-within:text-sky-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3.5 bg-background border border-slate-200/10 dark:border-slate-800/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none transition-all shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.45),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]"
            placeholder="Search by name, skill, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Online Toggle */}
          <div className="bg-background p-1.5 rounded-xl border border-slate-200/10 dark:border-slate-800/10 flex flex-1 md:flex-initial shadow-[inset_2px_2px_5px_rgba(163,177,198,0.35),_inset_-2px_-2px_5px_rgba(255,255,255,0.85)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.45),_inset_-2px_-2px_5px_rgba(255,255,255,0.02)]">
            <button
              onClick={() => setOnlineStatusFilter("all")}
              className={`flex-1 md:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                onlineStatusFilter === "all"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setOnlineStatusFilter("online")}
              className={`flex-1 md:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                onlineStatusFilter === "online"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
              </span>
            </button>
          </div>

          {/* Token Filter */}
          <div className="relative flex-1 md:flex-initial" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="bg-background border border-slate-200/10 dark:border-slate-800/10 text-text-primary text-xs font-bold rounded-xl flex items-center justify-between py-3.5 px-4 w-full md:min-w-[140px] outline-none transition-all cursor-pointer shadow-[3px_3px_8px_rgba(163,177,198,0.35),_-3px_-3px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.02)] hover:scale-[1.02] active:scale-95"
            >
              <span className="truncate">{currentOption.label}</span>
              <svg
                className={`w-4 h-4 ml-1.5 text-text-muted flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2.5 w-full min-w-[150px] bg-[#e8edf2] dark:bg-[#121a2e] rounded-xl border border-slate-200/15 dark:border-slate-800/20 shadow-[8px_8px_16px_rgba(163,177,198,0.45),_-8px_-8px_16px_rgba(255,255,255,0.9)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.55),_-8px_-8px_16px_rgba(255,255,255,0.02)] overflow-hidden z-30"
                >
                  <div className="py-1.5 px-1 space-y-0.5">
                    {options.map((option) => {
                      const isSelected = option.value === tokenRangeFilter;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setTokenRangeFilter(option.value);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                            isSelected
                              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"
                              : "text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/40 hover:translate-x-1"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Categories Row */}
      <div className="flex overflow-x-auto gap-3.5 pb-2 text-sm justify-start -mx-6 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`flex-shrink-0 px-5 py-2.5 text-xs font-bold rounded-full transition-all duration-300 active:scale-95 ${
            !categoryFilter
              ? "text-sky-600 dark:text-sky-400 bg-background shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),_inset_-3px_-3px_6px_rgba(255,255,255,0.03)] border border-slate-200/10 dark:border-slate-800/10"
              : "text-text-muted bg-background shadow-[3px_3px_6px_rgba(163,177,198,0.25),_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.35),_-3px_-3px_6px_rgba(255,255,255,0.02)] border border-transparent hover:text-text-primary"
          }`}
        >
          All Skills
        </button>
        {categories
          .filter((c) => c.id !== "c5")
          .map((cat) => {
            const isActive = categoryFilter === cat.id;
            const activeColorClass = 
              cat.color === "sky" ? "text-sky-500 dark:text-sky-400" :
              cat.color === "emerald" ? "text-emerald-500 dark:text-emerald-400" :
              cat.color === "violet" ? "text-violet-500 dark:text-violet-400" :
              cat.color === "rose" ? "text-rose-500 dark:text-rose-400" :
              "text-amber-500 dark:text-amber-400";

            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex-shrink-0 px-5 py-2.5 text-xs font-bold rounded-full transition-all duration-300 active:scale-95 ${
                  isActive
                    ? `${activeColorClass} bg-background shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),_inset_-3px_-3px_6px_rgba(255,255,255,0.03)] border border-slate-200/10 dark:border-slate-800/10`
                    : "text-text-muted bg-background shadow-[3px_3px_6px_rgba(163,177,198,0.25),_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.35),_-3px_-3px_6px_rgba(255,255,255,0.02)] border border-transparent hover:text-text-primary"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default MatchFilterBar;
