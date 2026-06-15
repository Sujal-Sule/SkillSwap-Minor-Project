import React from 'react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);


const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-8 flex items-center bg-slate-200/60 dark:bg-slate-800/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.35)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] rounded-full p-1 transition-colors duration-300 focus:outline-none"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <motion.div
                className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-900 shadow-[2px_2px_5px_rgba(163,177,198,0.55),_-2px_-2px_5px_rgba(255,255,255,0.95)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.45),_-2px_-2px_5px_rgba(255,255,255,0.03)] flex items-center justify-center border border-slate-200/10 dark:border-slate-800/10"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                style={{
                    marginLeft: theme === 'dark' ? 'auto' : '0',
                    marginRight: theme === 'light' ? 'auto' : '0',
                }}
            >
                {theme === 'dark' ?
                    <MoonIcon className="w-4 h-4 text-slate-300" /> :
                    <SunIcon className="w-4 h-4 text-amber-500" />
                }
            </motion.div>
        </button>
    );
};

export default ThemeToggle;