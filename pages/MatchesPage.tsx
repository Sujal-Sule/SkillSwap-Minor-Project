import React, { useMemo, useState } from 'react';
import type { User, ConnectionRequest } from '../types';
import { ChatBubbleLeftRightIcon, PlusIcon, SparklesIcon } from '../components/icons';
import PremiumUserCard from '../components/PremiumUserCard';
import TopMatchHero from '../components/TopMatchHero';
import MatchFilterBar from '../components/MatchFilterBar';
import UserProfileModal from '../components/UserProfileModal';
import { categories } from '../data/categories';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchesPageProps {
    currentUser: User;
    users: User[];
    allUsers: User[];
    startChat: (user: User) => void;
    connectionRequests: ConnectionRequest[];
    sendConnectionRequest: (receiverId: string) => void;
    categoryFilter: string | null;
    setCategoryFilter: (category: string | null) => void;
    handleRequest: (requestId: string, status: 'accepted' | 'declined') => void;
}

const MatchesPage: React.FC<MatchesPageProps> = ({ currentUser, users, allUsers, startChat, connectionRequests, sendConnectionRequest, categoryFilter, setCategoryFilter, handleRequest }) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [onlineStatusFilter, setOnlineStatusFilter] = useState<'all' | 'online'>('all');
    const [tokenRangeFilter, setTokenRangeFilter] = useState<string>('any'); // 'any', '5', '10', '20'
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const { topMatches, otherMatches } = useMemo(() => {
        // Show everyone except the current user
        let filteredUsers = users.filter(user => user.id !== currentUser.id);

        // 1. Search Term Filter
        if (searchTerm.trim()) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(lowercasedSearchTerm) ||
                user.bio.toLowerCase().includes(lowercasedSearchTerm) ||
                user.teaches.some(skill => skill.name.toLowerCase().includes(lowercasedSearchTerm)) ||
                user.learns.some(skill => skill.name.toLowerCase().includes(lowercasedSearchTerm))
            );
        }

        // 2. Category Filter
        if (categoryFilter) {
            filteredUsers = filteredUsers.filter(user =>
                user.teaches.some(skill => skill.categoryId === categoryFilter)
            );
        }

        // 3. Online Status Filter
        if (onlineStatusFilter === 'online') {
            filteredUsers = filteredUsers.filter(user => user.isOnline);
        }

        // 4. Token Balance Filter
        if (tokenRangeFilter !== 'any') {
            const minTokens = parseInt(tokenRangeFilter);
            filteredUsers = filteredUsers.filter(user => user.tokens >= minTokens);
        }

        const learnSkillIds = new Set(currentUser.learns.map(s => s.id));

        const matchesWithScores = filteredUsers.map(user => {
            const teachesLearnable = user.teaches.filter(skill => learnSkillIds.has(skill.id));
            const learnsTeachable = user.learns.some(skill => currentUser.teaches.some(s => s.id === skill.id));

            let matchScore = teachesLearnable.length * 2;
            if (learnsTeachable) matchScore += 1;

            return {
                user,
                matchScore,
                matchingSkills: teachesLearnable
            };
        });

        const sortedMatches = matchesWithScores.sort((a, b) => b.matchScore - a.matchScore);

        // Logic: Top Matches are those who teach something user wants (Direct Match)
        const directMatches = sortedMatches.filter(m => m.matchingSkills.length > 0);
        const nonDirectMatches = sortedMatches.filter(m => m.matchingSkills.length === 0);

        // Take up to 3 direct matches for the spotlight
        const top = directMatches.slice(0, 3);
        const others = [...directMatches.slice(3), ...nonDirectMatches];

        return { topMatches: top, otherMatches: others };

    }, [currentUser, users, categoryFilter, searchTerm, onlineStatusFilter, tokenRangeFilter]);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    const getButtonState = (user: User, isHero: boolean = false) => {
        const isConnected = currentUser.connections.includes(user.id);
        const baseClasses = "w-full flex items-center justify-center gap-2 font-bold transition-all active:scale-95";

        // Hero buttons are larger/more prominent
        const sizeClasses = isHero ? "py-3 px-8 text-base rounded-xl shadow-xl" : "py-2.5 px-4 text-sm rounded-xl shadow-lg";

        if (isConnected) {
            return (
                <button
                    onClick={(e) => handleActionClick(e, () => startChat(user))}
                    className={`${baseClasses} ${sizeClasses} bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-sky-500/20`}
                >
                    <ChatBubbleLeftRightIcon className={isHero ? "w-6 h-6" : "w-5 h-5"} />
                    Chat Now
                </button>
            );
        }

        const incomingRequest = connectionRequests.find(r => r.status === 'pending' && r.senderId === user.id && r.receiverId === currentUser.id);
        if (incomingRequest) {
            return (
                <div className="flex gap-2">
                    <button onClick={(e) => handleActionClick(e, () => handleRequest(incomingRequest.id, 'accepted'))} className={`flex-1 ${sizeClasses} bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20`}>Accept</button>
                    <button onClick={(e) => handleActionClick(e, () => handleRequest(incomingRequest.id, 'declined'))} className={`flex-1 ${sizeClasses} bg-slate-700 text-slate-300 hover:bg-slate-600`}>Decline</button>
                </div>
            );
        }

        const hasPendingRequest = connectionRequests.some(
            r => r.status === 'pending' &&
                (r.senderId === currentUser.id && r.receiverId === user.id)
        );

        if (hasPendingRequest) {
            return (
                <button disabled className={`${baseClasses} ${sizeClasses} bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed`}>
                    Request Sent
                </button>
            );
        }

        const isProcessing = processingId === user.id;

        return (
            <button
                disabled={isProcessing}
                onClick={(e) => {
                    handleActionClick(e, async () => {
                        setProcessingId(user.id);
                        await sendConnectionRequest(user.id);
                        setProcessingId(null);
                    });
                }}
                className={`${baseClasses} ${sizeClasses} ${isProcessing
                    ? 'bg-slate-800 text-slate-500 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-orange-500/20'
                    }`}
            >
                {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <PlusIcon className={isHero ? "w-6 h-6 mr-2" : "w-5 h-5 mr-2"} />
                        Connect
                    </>
                )}
            </button>
        );
    };

    const pageTitle = categoryFilter
        ? `${categories.find(c => c.id === categoryFilter)?.name} Mentors`
        : "Discover Mentors";

    return (
        <div className="pt-36 pb-20 px-6 max-w-[1240px] mx-auto min-h-screen">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">{pageTitle}</h1>
                <p className="text-slate-400 text-lg">Find the perfect partner to swap skills with.</p>
            </motion.div>

            {/* Filter Bar */}
            <MatchFilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                onlineStatusFilter={onlineStatusFilter}
                setOnlineStatusFilter={setOnlineStatusFilter}
                tokenRangeFilter={tokenRangeFilter}
                setTokenRangeFilter={setTokenRangeFilter}
            />

            <AnimatePresence mode="wait">
                <div className="flex flex-col gap-16 md:gap-20">
                    {/* Top Matches Section */}
                    {topMatches.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <SparklesIcon className="w-6 h-6 text-amber-400" />
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">Top Matches For You</h2>
                            </div>
                            <div className="flex flex-col gap-8">
                                {topMatches.map(({ user, matchingSkills }) => (
                                    <TopMatchHero
                                        key={user.id}
                                        user={user}
                                        matchingSkills={matchingSkills}
                                        actionButton={getButtonState(user, true)}
                                        onClick={() => setSelectedUser(user)}
                                    />
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* All Members Section */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {otherMatches.length > 0 && (
                            <div className="mb-8 pl-1 border-l-4 border-sky-500/50">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-200 pl-3">All Members</h2>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {otherMatches.map(({ user, matchingSkills }) => (
                                <PremiumUserCard
                                    key={user.id}
                                    user={user}
                                    matchingSkills={matchingSkills}
                                    actionButton={getButtonState(user, false)}
                                    onClick={() => setSelectedUser(user)}
                                />
                            ))}
                        </div>

                        {topMatches.length === 0 && otherMatches.length === 0 && (
                            <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700/50">
                                <p className="text-slate-400 text-lg mb-2">No matches found.</p>
                                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => {
                                        setCategoryFilter(null);
                                        setSearchTerm('');
                                        setOnlineStatusFilter('all');
                                    }}
                                    className="mt-6 text-sky-400 hover:text-sky-300 font-medium hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </motion.section>
                </div>
            </AnimatePresence>

            <UserProfileModal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                users={allUsers}
            />
        </div>
    );
};

export default MatchesPage;