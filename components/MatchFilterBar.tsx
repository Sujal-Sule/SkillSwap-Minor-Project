import React from "react";
import { motion } from "framer-motion";
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
            className="block w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all shadow-sm group-hover:bg-surface-hover"
            placeholder="Search by name, skill, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Online Toggle */}
          <div className="bg-surface p-1 rounded-lg border border-border flex">
            <button
              onClick={() => setOnlineStatusFilter("all")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                onlineStatusFilter === "all"
                  ? "bg-slate-700 text-white shadow-sm dark:bg-slate-600"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setOnlineStatusFilter("online")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                onlineStatusFilter === "online"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
              </span>
            </button>
          </div>

          {/* Token Filter */}
          <select
            value={tokenRangeFilter}
            onChange={(e) => setTokenRangeFilter(e.target.value)}
            className="bg-surface border border-border text-text-primary text-sm rounded-xl focus:ring-sky-500 focus:border-sky-500 block p-2.5 px-4 outline-none hover:bg-surface-hover transition-colors cursor-pointer appearance-none shadow-sm"
          >
            <option value="any">Any Tokens</option>
            <option value="5">5+ Tokens</option>
            <option value="10">10+ Tokens</option>
            <option value="20">20+ Tokens</option>
          </select>
        </div>
      </div>

      {/* Categories Row */}
      <div className="flex flex-wrap gap-2 text-sm justify-center md:justify-start">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`px-4 py-2 rounded-full border transition-all duration-300 ${
            !categoryFilter
              ? "bg-text-primary text-background border-text-primary font-semibold shadow-lg shadow-text-primary/10 scale-105"
              : "bg-transparent text-text-muted border-border hover:border-text-secondary hover:text-text-primary"
          }`}
        >
          All Skills
        </button>
        {categories
          .filter((c) => c.id !== "c5")
          .map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-full border transition-all duration-300 ${
                categoryFilter === cat.id
                  ? `bg-${cat.color}-500 text-white border-${cat.color}-500 font-semibold shadow-lg shadow-${cat.color}-500/20 scale-105`
                  : "bg-transparent text-text-muted border-border hover:border-text-secondary hover:text-text-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>
    </div>
  );
};

export default MatchFilterBar;
