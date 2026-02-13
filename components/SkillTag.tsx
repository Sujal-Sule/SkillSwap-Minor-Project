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
            teach: 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
            learn: 'bg-transparent text-sky-600 dark:text-sky-400 border border-sky-400 dark:border-sky-500'
        },
        purple: {
            teach: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
            learn: 'bg-transparent text-purple-600 dark:text-purple-400 border border-purple-400 dark:border-purple-500'
        },
        emerald: {
            teach: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
            learn: 'bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-400 dark:border-emerald-500'
        },
        rose: {
            teach: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',
            learn: 'bg-transparent text-rose-600 dark:text-rose-400 border border-rose-400 dark:border-rose-500'
        },
        slate: {
            teach: 'bg-slate-200 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300',
            learn: 'bg-transparent text-slate-600 dark:text-slate-400 border border-slate-400 dark:border-slate-500'
        }
    };

    const tagClass = colorClasses[color as keyof typeof colorClasses][variant] || colorClasses.slate.teach;

    // Dynamic shadow color based on category
    const shadowColor = {
        sky: 'hover:shadow-sky-500/25',
        purple: 'hover:shadow-purple-500/25',
        emerald: 'hover:shadow-emerald-500/25',
        rose: 'hover:shadow-rose-500/25',
        slate: 'hover:shadow-slate-500/25'
    }[color as string] || 'hover:shadow-slate-500/25';

    return (
        <motion.span
            className={`inline-block text-sm font-medium mr-2 mb-2 px-4 py-1.5 rounded-full transition-shadow duration-300 cursor-default ${tagClass} ${shadowColor} hover:shadow-lg ${className}`}
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {skill.name}
        </motion.span>
    );
};

export default SkillTag;