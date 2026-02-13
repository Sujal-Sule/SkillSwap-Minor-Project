import React from "react";
import {
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
} from "./icons";

interface CoachStatsPanelProps {
  tokens: number;
  connections: number;
  upcomingSessions: number;
  profileCompletion: number;
}

interface StatCard {
  icon: React.ComponentType<{ className?: string }>;
  value: number | string;
  label: string;
  color: string;
}

const CoachStatsPanel: React.FC<CoachStatsPanelProps> = ({
  tokens,
  connections,
  upcomingSessions,
  profileCompletion,
}) => {
  const stats: StatCard[] = [
    {
      icon: CurrencyDollarIcon,
      value: tokens,
      label: "Tokens",
      color: "text-amber-400",
    },
    {
      icon: UsersIcon,
      value: connections,
      label: "Connections",
      color: "text-sky-400",
    },
    {
      icon: CalendarIcon,
      value: upcomingSessions,
      label: "Sessions",
      color: "text-emerald-400",
    },
    {
      icon: CheckCircleIcon,
      value: `${profileCompletion}%`,
      label: "Profile",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-700">
      <p className="text-xs text-slate-400 mb-3 font-medium">
        Your Learning Context
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg"
            >
              <Icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
              <div className="overflow-hidden">
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 truncate">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoachStatsPanel;
