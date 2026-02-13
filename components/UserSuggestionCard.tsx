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
    // Simulate async operation
    setTimeout(() => setIsConnecting(false), 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl text-center flex flex-col items-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="relative mb-4">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-24 h-24 rounded-full border-2 border-slate-300 dark:border-slate-600"
        />
        {/* Online status indicator */}
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
      </div>
      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex-1">
        {user.name}
      </p>

      {/* Show shared skills if any */}
      {user.teaches && user.teaches.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {user.teaches.slice(0, 2).map((skill) => (
            <span
              key={skill.id}
              className="text-xs px-2 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 rounded-full"
            >
              {skill.name}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full flex items-center justify-center mt-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <svg
            className="animate-spin h-4 w-4 text-white"
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
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Connect
          </>
        )}
      </button>
    </div>
  );
};

export default UserSuggestionCard;
