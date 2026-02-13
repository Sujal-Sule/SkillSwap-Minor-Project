import React from 'react';
import { motion } from 'framer-motion';
import type { User, Skill } from '../types';
import SkillTag from './SkillTag';

interface PremiumUserCardProps {
    user: User;
    matchingSkills: Skill[];
    isTopMatch?: boolean;
    actionButton: React.ReactNode;
    onClick?: () => void;
}

const PremiumUserCard: React.FC<PremiumUserCardProps> = ({
    user,
    matchingSkills,
    isTopMatch = false,
    actionButton,
    onClick
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`relative group rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${isTopMatch
                ? 'bg-slate-800/40 border border-white/10 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20'
                : 'bg-slate-800/40 border border-white/5 hover:bg-slate-800/60'
                }`}
            style={{ boxShadow: isTopMatch ? undefined : '0px 4px 12px rgba(0, 0, 0, 0.25)' }}
        >
            {/* Top Match Gradient Border */}
            {isTopMatch && (
                <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-sky-500 via-purple-500 to-amber-500 opacity-70 group-hover:opacity-100 transition-opacity -z-10">
                    <div className="absolute inset-0 bg-slate-900/90 rounded-3xl" />
                </div>
            )}

            {/* Top Match Badge */}
            {isTopMatch && (
                <div className="absolute top-0 right-0 p-[1px] rounded-bl-2xl bg-gradient-to-br from-sky-500 to-purple-500">
                    <div className="bg-slate-900/90 rounded-bl-2xl px-3 py-1">
                        <span className="text-[10px] font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400 uppercase">
                            Top Match
                        </span>
                    </div>
                </div>
            )}

            <div className="p-5 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                        <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className={`rounded-full object-cover shadow-lg ${isTopMatch ? 'w-16 h-16 ring-2 ring-purple-500/50' : 'w-14 h-14 border border-slate-600'}`}
                        />
                        {user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm"></span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className={`font-bold truncate ${isTopMatch ? 'text-lg text-white' : 'text-base text-slate-200'}`}>
                            {user.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {user.bio}
                        </p>
                    </div>
                </div>

                {/* Skills */}
                <div className="flex-1 mb-6">
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">
                        {matchingSkills.length > 0 ? 'Skills You Learn' : 'Featured Skills'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {(matchingSkills.length > 0 ? matchingSkills : user.teaches.slice(0, 3)).map(skill => (
                            <SkillTag key={skill.id} skill={skill} variant="learn" /> // variant='learn' is usually blue/highlighted
                        ))}
                        {matchingSkills.length === 0 && user.teaches.length > 3 && (
                            <span className="text-[10px] text-slate-500 px-1 py-0.5">+ {user.teaches.length - 3} more</span>
                        )}
                    </div>
                </div>

                {/* Action */}
                <div className="mt-auto pt-4 border-t border-white/5">
                    {actionButton}
                </div>
            </div>
        </motion.div>
    );
};

export default PremiumUserCard;
