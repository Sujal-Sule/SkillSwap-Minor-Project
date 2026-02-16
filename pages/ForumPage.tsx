import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from "../components/icons";

const ForumPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "General Discussion",
    "Skill Exchange",
    "Project Showcase",
    "Career Advice",
    "Resources",
  ];

  const forumPosts = [
    {
      id: 1,
      title: "Best resources for learning React in 2026?",
      author: "Krishna Sule",
      category: "Resources",
      replies: 24,
      views: 1205,
      timeAgo: "2 hours ago",
      avatar: "SC",
    },
    {
      id: 2,
      title: "Looking for a mentor in System Design",
      author: "Sahil Dubey",
      category: "Skill Exchange",
      replies: 8,
      views: 450,
      timeAgo: "5 hours ago",
      avatar: "AJ",
    },
    {
      id: 3,
      title: "Showcase: Built a real-time collab tool using WebSocket",
      author: "Shivam Thakur",
      category: "Project Showcase",
      replies: 45,
      views: 3400,
      timeAgo: "1 day ago",
      avatar: "DK",
    },
    {
      id: 4,
      title: "How to handle burnout while learning to code?",
      author: "Rehan Shah",
      category: "General Discussion",
      replies: 56,
      views: 2800,
      timeAgo: "2 days ago",
      avatar: "ED",
    },
    {
      id: 5,
      title: "Transitioning from Marketing to UX Design - Tips?",
      author: "Sakshi",
      category: "Career Advice",
      replies: 12,
      views: 890,
      timeAgo: "3 days ago",
      avatar: "MB",
    },
  ];

  const filteredPosts =
    activeCategory === "All"
      ? forumPosts
      : forumPosts.filter((post) => post.category === activeCategory);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
              Community Forum
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Discuss, share, and grow with the community.
            </p>
          </div>
          <button className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/30">
            <PlusCircleIcon className="w-5 h-5" />
            New Discussion
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0">
                  {post.avatar}
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {post.author} • {post.timeAgo}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors mb-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      {post.replies} replies
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path
                          fillRule="evenodd"
                          d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {post.views} views
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
