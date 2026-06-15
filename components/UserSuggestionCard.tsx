import React, { useState } from "react";
import type { User } from "../types";
import { PlusIcon } from "./icons";

interface UserSuggestionCardProps {
  user: User;
  onConnect: (userId: string) => void;
}

const UserSuggestionCard: React.FC<UserSuggestionCardProps> = ({
  user,
  onConnect,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    onConnect(user.id);
    setTimeout(() => setIsConnecting(false), 1000);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl text-center flex flex-col items-center hover:shadow-md hover:border-slate-200/80 dark:hover:border-slate-700/80 transition-all duration-300">
      <div className="relative mb-4">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-20 h-20 rounded-full border-2 border-slate-100 dark:border-slate-800 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {user.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-[pulse_2s_infinite]"></div>
        )}
      </div>
      
      <p className="font-bold text-slate-850 dark:text-slate-100 text-sm mb-1 line-clamp-1">
        {user.name}
      </p>
      
      <p className="text-xs text-text-muted mb-4 line-clamp-2 min-h-[2rem] px-2">
        {user.bio || "No biography added yet."}
      </p>

      {user.teaches && user.teaches.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mb-5">
          {user.teaches.slice(0, 2).map((skill) => (
            <span
              key={skill.id}
              className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-slate-800/40 text-slate-650 dark:text-slate-400 border border-slate-100 dark:border-slate-800 rounded-full"
            >
              {skill.name}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full flex items-center justify-center mt-auto bg-slate-950 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold py-2 px-3 rounded-xl transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
      >
        {isConnecting ? (
          <svg
            className="animate-spin h-3.5 w-3.5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <>
            <PlusIcon className="w-3.5 h-3.5 mr-1" />
            Connect
          </>
        )}
      </button>
    </div>
  );
};

export default UserSuggestionCard;
