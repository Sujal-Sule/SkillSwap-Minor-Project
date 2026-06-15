import React from "react";
import { motion } from "framer-motion";
import type { User, Skill } from "../types";
import SkillTag from "./SkillTag";

interface PremiumUserCardProps {
  user: User;
  matchingSkills: Skill[];
  isTopMatch?: boolean;
  actionButton: React.ReactNode;
  onClick?: () => void;
}

const PremiumUserCard: React.FC<PremiumUserCardProps> = ({
  user,
  matchingSkills,
  isTopMatch = false,
  actionButton,
  onClick,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`relative group rounded-[22px] overflow-hidden cursor-pointer transition-all duration-300 ${
        isTopMatch
          ? "bg-gradient-to-b from-sky-500/5 to-purple-500/5 dark:from-sky-500/10 dark:to-purple-500/10 border border-sky-500/20 shadow-sm"
          : "bg-slate-100/40 dark:bg-slate-900/30 border border-slate-200/20 dark:border-slate-800/30 shadow-sm hover:bg-slate-100/60 dark:hover:bg-slate-900/40 hover:border-slate-300/40 dark:hover:border-slate-700/40 hover:shadow-md"
      }`}
      style={{ boxShadow: isTopMatch ? undefined : undefined }}
    >
      {/* Top Match Badge */}
      {isTopMatch && (
        <div className="absolute top-0 right-0 p-[1px] rounded-bl-2xl bg-gradient-to-br from-sky-500/30 to-purple-500/30">
          <div className="bg-background/90 rounded-bl-2xl px-3 py-1">
            <span className="text-[10px] font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-purple-500 uppercase">
              Top Match
            </span>
          </div>
        </div>
      )}

      <div className="p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className={`rounded-full object-cover shadow-md ${isTopMatch ? "w-16 h-16 border-2 border-purple-500/30" : "w-14 h-14 border border-slate-200/40 dark:border-slate-800/40"}`}
            />
            {user.isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-100 dark:border-slate-900 rounded-full shadow-sm"></span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-bold truncate ${isTopMatch ? "text-lg text-text-primary" : "text-base text-text-primary"}`}
            >
              {user.name}
            </h3>
            <p className="text-xs text-text-muted line-clamp-2 mt-1 leading-relaxed font-medium">
              {user.bio}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div className="flex-1 mb-6">
          <div className="text-[10px] uppercase font-bold text-text-muted mb-2 tracking-wider">
            {matchingSkills.length > 0 ? "Skills You Learn" : "Featured Skills"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(matchingSkills.length > 0
              ? matchingSkills
              : user.teaches.slice(0, 3)
            ).map((skill) => (
              <SkillTag key={skill.id} skill={skill} variant="learn" />
            ))}
            {matchingSkills.length === 0 && user.teaches.length > 3 && (
              <span className="text-[10px] text-text-muted px-1 py-0.5 font-semibold">
                + {user.teaches.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="mt-auto pt-4 border-t border-slate-200/20 dark:border-slate-800/20">
          {actionButton}
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumUserCard;
