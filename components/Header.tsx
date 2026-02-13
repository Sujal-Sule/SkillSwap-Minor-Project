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
  currentUser: User;
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
    <header className="fixed top-6 left-0 right-0 px-4 z-40 flex justify-center">
      <div
        className="glassy-nav-container rounded-2xl mx-auto w-full max-w-7xl border border-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl"
        style={{
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
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
                          ? "text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
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
                            className="absolute inset-0 bg-white/15 rounded-full shadow-lg shadow-sky-500/20"
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
            {!isAdmin && (
              <div className="hidden sm:flex items-center gap-2.5 bg-slate-800/50 rounded-full px-5 py-2 border border-amber-500/30 shadow-lg shadow-amber-500/20">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-[11px] font-bold text-white shadow-inner shadow-amber-900/50">
                  S
                </div>
                <span className="text-sm font-bold text-slate-200">
                  {currentUser.tokens}{" "}
                  <span className="text-slate-400 font-normal ml-0.5">
                    Tokens
                  </span>
                </span>
              </div>
            )}

            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-slate-500">Free Plan</div>
                </div>
                <div className="relative">
                  <img
                    className="h-10 w-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-sky-500 transition-colors shadow-md"
                    src={
                      currentUser.avatarUrl ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                        currentUser.id
                    }
                    alt={currentUser.name}
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                </div>
              </div>

              <button
                onClick={logout}
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
