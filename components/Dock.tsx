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
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden max-w-lg mx-auto rounded-[20px] bg-background/95 dark:bg-background/90 backdrop-blur-md border border-slate-200/20 dark:border-slate-800/10 transition-all duration-300 shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.03)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.id}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-[85%] px-1"
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-300 w-full h-full ${
                  isActive
                    ? "text-sky-600 dark:text-sky-400 bg-background shadow-[inset_2px_2px_4px_rgba(163,177,198,0.4),_inset_-2px_-2px_4px_rgba(255,255,255,0.85)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),_inset_-2px_-2px_4px_rgba(255,255,255,0.03)] border border-slate-200/10 dark:border-slate-800/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <item.icon
                    className={`w-5.5 h-5.5 ${isActive ? "stroke-2" : "stroke-1.5"}`}
                  />
                  {item.count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-955">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold mt-0.5">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Dock;
