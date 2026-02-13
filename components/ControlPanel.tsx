import React from "react";
import { TokenIcon, UsersIcon, AcademicCapIcon } from "./icons";

interface ControlPanelProps {
  tokens: number;
  profileCompletion: number;
  connections: number;
  upcomingSessions: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  tokens,
  profileCompletion,
  connections,
  upcomingSessions,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1.5fr_auto_1.5fr] gap-8 items-center">
        {/* Left Section: Token Balance */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <TokenIcon className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-900 dark:text-white leading-none mb-1">
              {tokens}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Available Tokens
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-16 bg-slate-200 dark:bg-slate-700"></div>

        {/* Middle Section: Connections & Sessions */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-2">
              <UsersIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none mb-1">
              {connections}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connections
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-2">
              <AcademicCapIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none mb-1">
              {upcomingSessions}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sessions
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-16 bg-slate-200 dark:bg-slate-700"></div>

        {/* Right Section: Profile Optimization */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {profileCompletion === 100
                ? "Profile Optimized"
                : "Profile Strength"}
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {profileCompletion}%
            </p>
          </div>
          <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          {profileCompletion < 100 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">
              {100 - profileCompletion}% to complete
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
