import React from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from './icons';
import { categories } from '../data/categories';

interface MatchFilterBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    categoryFilter: string | null;
    setCategoryFilter: (category: string | null) => void;
    onlineStatusFilter: 'all' | 'online';
    setOnlineStatusFilter: (status: 'all' | 'online') => void;
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
    setTokenRangeFilter
}) => {
    return (
        <div className="space-y-6 mb-10">
            {/* Top Row: Search and Quick Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-start">
                {/* Search Input */}
                <div className="relative w-full md:max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-500 group-focus-within:text-sky-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all shadow-sm group-hover:bg-slate-800/80"
                        placeholder="Search by name, skill, or bio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Online Toggle */}
                    <div className="bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 flex">
                        <button
                            onClick={() => setOnlineStatusFilter('all')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${onlineStatusFilter === 'all'
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setOnlineStatusFilter('online')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${onlineStatusFilter === 'online'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
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
                        className="bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm rounded-xl focus:ring-sky-500 focus:border-sky-500 block p-2.5 px-4 outline-none hover:bg-slate-800/80 transition-colors cursor-pointer appearance-none"
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
                    className={`px-4 py-2 rounded-full border transition-all duration-300 ${!categoryFilter
                        ? 'bg-white text-slate-900 border-white font-semibold shadow-lg shadow-white/10 scale-105'
                        : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                        }`}
                >
                    All Skills
                </button>
                {categories.filter(c => c.id !== 'c5').map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-4 py-2 rounded-full border transition-all duration-300 ${categoryFilter === cat.id
                            ? `bg-${cat.color}-500 text-white border-${cat.color}-500 font-semibold shadow-lg shadow-${cat.color}-500/20 scale-105`
                            : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div >
    );
};

export default MatchFilterBar;
