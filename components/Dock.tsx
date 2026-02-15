import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  count: number;
}

interface DockProps {
  navItems: NavItem[];
}

const Dock: React.FC<DockProps> = ({ navItems }) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.id}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  isActive
                    ? "text-sky-500 dark:text-sky-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <item.icon
                    className={`w-6 h-6 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                  />
                  {item.count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-0.5 w-8 h-1 bg-sky-500 rounded-b-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Dock;
