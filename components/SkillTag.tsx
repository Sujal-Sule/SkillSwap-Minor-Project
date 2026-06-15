import React from 'react';
import { motion } from 'framer-motion';
import type { Skill } from '../types';
import { categories } from '../data/categories';

interface SkillTagProps {
    skill: Skill;
    variant?: 'teach' | 'learn';
    className?: string;
}

const SkillTag: React.FC<SkillTagProps> = ({ skill, variant = 'teach', className = '' }) => {
    const category = categories.find(c => c.id === skill.categoryId);
    const color = category?.color || 'slate';

    const colorClasses = {
        sky: {
            teach: 'bg-sky-200/40 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-300/30 dark:border-sky-500/20',
            learn: 'bg-sky-500/5 text-sky-600 dark:text-sky-400 border border-sky-500/20 dark:border-sky-500/30'
        },
        purple: {
            teach: 'bg-purple-200/40 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 border border-purple-300/30 dark:border-purple-500/20',
            learn: 'bg-purple-500/5 text-purple-600 dark:text-purple-400 border border-purple-500/20 dark:border-purple-500/30'
        },
        emerald: {
            teach: 'bg-emerald-200/40 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300/30 dark:border-emerald-500/20',
            learn: 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-400/20 dark:border-emerald-500/30'
        },
        rose: {
            teach: 'bg-rose-200/40 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-300/30 dark:border-rose-500/20',
            learn: 'bg-rose-500/5 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30'
        },
        slate: {
            teach: 'bg-slate-200/50 dark:bg-slate-500/10 text-slate-800 dark:text-slate-300 border border-slate-300/30 dark:border-slate-500/20',
            learn: 'bg-slate-500/5 text-slate-600 dark:text-slate-400 border border-slate-400/20 dark:border-slate-500/30'
        }
    };

    const tagClass = colorClasses[color as keyof typeof colorClasses][variant] || colorClasses.slate.teach;

    // Dynamic shadow color based on category
    const shadowColor = {
        sky: 'hover:shadow-sky-500/10',
        purple: 'hover:shadow-purple-500/10',
        emerald: 'hover:shadow-emerald-500/10',
        rose: 'hover:shadow-rose-500/10',
        slate: 'hover:shadow-slate-500/10'
    }[color as string] || 'hover:shadow-slate-500/10';

    return (
        <motion.span
            className={`inline-block text-[11px] font-bold mr-1.5 mb-1.5 px-3 py-1 rounded-full transition-all duration-300 cursor-default ${tagClass} ${shadowColor} hover:shadow-sm ${className}`}
            whileHover={{ y: -1, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
        >
            {skill.name}
        </motion.span>
    );
};

export default SkillTag;