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
      className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-10 rounded-3xl bg-surface border border-border hover:border-sky-500/30 transition-all duration-300 relative group overflow-hidden cursor-pointer w-full shadow-xl"
    >
      {/* Gradient Border Overlay */}
      <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-sky-500 via-purple-500 to-amber-500 opacity-70 group-hover:opacity-100 transition-opacity -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-surface rounded-3xl" />
      </div>

      {/* Avatar Column */}
      <div className="relative shrink-0">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-2xl ring-4 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all bg-surface"
        />
        {user.isOnline && (
          <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-surface rounded-full shadow-lg"></span>
        )}
      </div>

      {/* Content Column */}
      <div className="flex-1 text-center md:text-left min-w-0 w-full">
        <div className="flex flex-col md:flex-row items-center md:justify-start gap-3 mb-3">
          <h3 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            {user.name}
          </h3>
          <span className="px-3 py-1 bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-600 dark:text-sky-300 text-xs font-bold uppercase tracking-wider rounded-full border border-sky-500/30 shadow-lg shadow-sky-500/10">
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
