import React from "react";

const AdminLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outer spinning ring */}
        <div className="absolute w-full h-full border-4 border-slate-200 dark:border-slate-700 rounded-full animate-[spin_3s_linear_infinite]"></div>

        {/* Inner pulsing ring with gradient */}
        <div className="absolute w-24 h-24 border-t-4 border-b-4 border-sky-500 rounded-full animate-spin shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>

        {/* Central Logo / Core */}
        <div className="absolute w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-700 z-10 animate-pulse">
          <svg
            className="w-8 h-8 text-sky-500 dark:text-sky-400 drop-shadow-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
      </div>

      {/* Loading text with typewriter effect or simple fade */}
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wider animate-pulse">
          INITIALIZING ADMIN CORE
        </h2>
        <div className="flex gap-1 justify-center">
          <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-75"></span>
          <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-150"></span>
          <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-300"></span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-light mt-2">
          Fetching platform metrics...
        </p>
      </div>
    </div>
  );
};

export default AdminLoader;
