import React from "react";
import type { User } from "../types";
import { motion, LayoutGroup } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { NavLink, useNavigate } from "react-router-dom";

interface NavItem {
  id: string; // doubling as path segment usually or mappable
  path: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  count: number;
}

interface HeaderProps {
  currentUser?: User;
  isAdmin: boolean;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  navItems: NavItem[];
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  isAdmin,
  logout,
  theme,
  toggleTheme,
  navItems,
}) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-4 left-4 right-4 z-40 max-w-7xl mx-auto">
      <div
        className="w-full rounded-[24px] bg-background/95 dark:bg-background/90 backdrop-blur-md border border-slate-200/20 dark:border-slate-800/10 transition-all duration-300 shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.03)]"
      >
        <div className="flex items-center justify-between h-20 px-8">
          {/* Left side: Logo and Nav */}
          <div className="flex items-center gap-12">
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer hover:opacity-80 transition-opacity flex items-center"
            >
              <Logo size={56} />
            </div>
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-5 py-2 text-sm font-bold rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center ${
                      isActive
                        ? "text-sky-600 dark:text-sky-400 bg-background shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),_inset_-3px_-3px_6px_rgba(255,255,255,0.03)] border border-slate-200/10 dark:border-slate-800/10"
                        : "text-text-muted hover:text-text-primary hover:shadow-[3px_3px_6px_rgba(163,177,198,0.25),_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:hover:shadow-[3px_3px_6px_rgba(0,0,0,0.35),_-3px_-3px_6px_rgba(255,255,255,0.02)] border border-transparent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <span className="relative z-10 flex items-center gap-2">
                      {item.label}
                      {item.count > 0 && (
                        <span className="relative flex items-center justify-center h-4 min-w-[1rem] px-1 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                          {item.count > 9 ? "9+" : item.count}
                          <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75"></span>
                        </span>
                      )}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-6">
            {/* Token Balance - Gamified */}
            {!isAdmin && currentUser && (
              <div className="hidden sm:flex items-center gap-2.5 bg-background rounded-full px-5 py-2 border border-slate-200/10 dark:border-slate-800/10 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.45),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[11px] font-bold text-white shadow-[2px_2px_5px_rgba(217,119,6,0.35),_inset_-2px_-2px_4px_rgba(255,255,255,0.2)]">
                  S
                </div>
                <span className="text-sm font-bold text-text-primary">
                  {currentUser.tokens}{" "}
                  <span className="text-text-muted font-normal ml-0.5">
                    Tokens
                  </span>
                </span>
              </div>
            )}

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800/50 hidden sm:block"></div>

            {/* Theme Toggle */}
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            {/* Profile & Logout or Login */}
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => navigate("/profile")}
                >
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-bold text-text-primary group-hover:text-sky-500 transition-colors">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-text-muted">Free Plan</div>
                  </div>
                  <div className="relative">
                    <img
                      className="h-10 w-10 rounded-full object-cover border-2 border-border group-hover:border-sky-500 transition-colors shadow-md"
                      src={
                        currentUser.avatarUrl ||
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                          currentUser.id
                      }
                      alt={currentUser.name}
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full"></div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-background text-text-muted hover:text-rose-500 border border-slate-200/10 dark:border-slate-800/10 shadow-[3px_3px_8px_rgba(163,177,198,0.3),_-3px_-3px_8px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),_-3px_-3px_8px_rgba(255,255,255,0.02)] active:scale-95 transition-all"
                  title="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 bg-background hover:bg-slate-100 text-sky-600 dark:text-sky-400 text-sm font-extrabold rounded-full border border-slate-200/10 dark:border-slate-800/10 shadow-[3px_3px_8px_rgba(163,177,198,0.35),_-3px_-3px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.02)] transition-all active:scale-95"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
