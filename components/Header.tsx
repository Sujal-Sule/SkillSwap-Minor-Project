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
    <header className="fixed top-0 left-0 right-0 z-40">
      <div
        className="glassy-nav-container w-full shadow-sm backdrop-blur-xl border-b border-white/10 dark:border-slate-700/50"
        style={{
          backgroundColor: "var(--sw-surface)", // Use surface token but with opacity handled by class
        }}
      >
        <div className="flex items-center justify-between h-20 px-8">
          {/* Left side: Logo and Nav */}
          <div className="flex items-center gap-12">
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Logo size={36} />
            </div>
            <LayoutGroup>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `relative px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200 active:scale-95 ${
                        isActive
                          ? "text-nav-text-active"
                          : "text-text-muted hover:text-text-primary hover:bg-surface-highlight/10"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="relative z-10 flex items-center gap-2">
                          {item.label}
                          {item.count > 0 && (
                            <span className="relative flex items-center justify-center h-4 min-w-[1rem] px-1 text-[10px] bg-rose-500 text-white rounded-full">
                              {item.count > 9 ? "9+" : item.count}
                              <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75"></span>
                            </span>
                          )}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="active-nav-pill"
                            className="absolute inset-0 bg-nav-active rounded-full shadow-sm shadow-sky-500/10"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </LayoutGroup>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-6">
            {/* Token Balance - Gamified */}
            {!isAdmin && currentUser && (
              <div className="hidden sm:flex items-center gap-2.5 bg-surface/50 rounded-full px-5 py-2 border border-amber-500/30 shadow-lg shadow-amber-500/20">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[11px] font-bold text-white shadow-inner shadow-amber-900/50">
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

            <div className="h-8 w-px bg-border hidden sm:block"></div>

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
                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all"
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
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-full shadow-lg shadow-sky-500/25 transition-all active:scale-95"
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
