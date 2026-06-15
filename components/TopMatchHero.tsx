import React from "react";
import type { User, Skill } from "../types";
import SkillTag from "./SkillTag";

interface TopMatchHeroProps {
  user: User;
  matchingSkills: Skill[];
  actionButton: React.ReactNode;
  onClick?: () => void;
}

const TopMatchHero: React.FC<TopMatchHeroProps> = ({
  user,
  matchingSkills,
  actionButton,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-10 rounded-[28px] bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/40 shadow-sm backdrop-blur-md relative group overflow-hidden cursor-pointer w-full transition-all duration-300 hover:shadow-md hover:border-slate-300/40 dark:hover:border-slate-700/40"
    >
      {/* Dynamic Ambient Glow Mesh */}
      <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500/20 to-sky-500/0 blur-[60px] pointer-events-none -z-10 group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/0 blur-[60px] pointer-events-none -z-10 group-hover:scale-110 transition-transform duration-700" />

      {/* Avatar Column */}
      <div className="relative shrink-0">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg border-4 border-slate-200/40 dark:border-slate-800/40 group-hover:scale-105 transition-transform duration-300 bg-background"
        />
        {user.isOnline && (
          <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-slate-100 dark:border-slate-900 rounded-full shadow-lg"></span>
        )}
      </div>

      {/* Content Column */}
      <div className="flex-1 text-center md:text-left min-w-0 w-full">
        <div className="flex flex-col md:flex-row items-center md:justify-start gap-3 mb-3">
          <h3 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            {user.name}
          </h3>
          <span className="px-3 py-1 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-sky-500/20 shadow-sm">
            Top Match
          </span>
        </div>

        <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-6 max-w-2xl mx-auto md:mx-0 font-medium">
          {user.bio}
        </p>

        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {matchingSkills.map((skill) => (
            <SkillTag key={skill.id} skill={skill} variant="learn" />
          ))}
        </div>
      </div>

      {/* CTA Column */}
      <div className="w-full md:w-auto shrink-0 flex flex-col gap-3 min-w-[200px] mt-4 md:mt-0">
        <div className="scale-105 origin-center transition-transform hover:scale-110">
          {actionButton}
        </div>
        <p className="text-xs text-text-muted text-center font-bold tracking-wide uppercase">
          Highest Match Score
        </p>
      </div>
    </div>
  );
};

export default TopMatchHero;
