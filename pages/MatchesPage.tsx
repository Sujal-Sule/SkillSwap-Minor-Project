import React, { useMemo, useState } from 'react';
import type { User, Skill, ConnectionRequest } from '../types';
import SkillTag from '../components/SkillTag';
import { ChatBubbleLeftRightIcon, PlusIcon, MagnifyingGlassIcon } from '../components/icons';
import GlowingUserCard from '../components/GlowingUserCard';
import GlowBorderCard from '../components/GlowBorderCard';
import UserProfileModal from '../components/UserProfileModal';
import { categories } from '../data/categories';

interface MatchesPageProps {
    currentUser: User;
    users: User[];
    allUsers: User[]; // New prop for lookup
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
        const connectedUserIds = new Set(currentUser.connections);

        // Show everyone except the current user (connected users will show "Chat" button)
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

        // Logic Change: 
        // "Top Matches" (Glowing) should ONLY be users who teach something the current user wants to learn (Direct Match).
        // Users who only want to learn from the current user (Reverse Match) or have no skill match go to "Other".
        const directMatches = sortedMatches.filter(m => m.matchingSkills.length > 0);
        const nonDirectMatches = sortedMatches.filter(m => m.matchingSkills.length === 0);

        // Take up to 3 direct matches for the spotlight
        const top = directMatches.slice(0, 3);

        // The rest of the direct matches + all non-direct matches go to the standard list
        const others = [...directMatches.slice(3), ...nonDirectMatches];

        return { topMatches: top, otherMatches: others };

    }, [currentUser, users, categoryFilter, searchTerm, onlineStatusFilter, tokenRangeFilter]);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    const getButtonState = (user: User) => {
        const isConnected = currentUser.connections.includes(user.id);
        if (isConnected) {
            return (
                <button
                    onClick={(e) => handleActionClick(e, () => startChat(user))}
                    className="w-full flex items-center justify-center bg-sky-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-sky-700 transition-colors"
                >
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                    Chat
                </button>
            );
        }

        const incomingRequest = connectionRequests.find(r => r.status === 'pending' && r.senderId === user.id && r.receiverId === currentUser.id);
        if (incomingRequest) {
            return (
                <div className="flex gap-2">
                    <button onClick={(e) => handleActionClick(e, () => handleRequest(incomingRequest.id, 'accepted'))} className="flex-1 w-full px-4 py-2 text-sm font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Accept</button>
                    <button onClick={(e) => handleActionClick(e, () => handleRequest(incomingRequest.id, 'declined'))} className="flex-1 w-full px-4 py-2 text-sm font-semibold bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition-colors">Decline</button>
                </div>
            );
        }

        const hasPendingRequest = connectionRequests.some(
            r => r.status === 'pending' &&
                (r.senderId === currentUser.id && r.receiverId === user.id)
        );

        if (hasPendingRequest) {
            return (
                <button
                    disabled
                    className="w-full flex items-center justify-center bg-slate-700 text-slate-400 font-bold py-2.5 px-4 rounded-lg cursor-not-allowed"
                >
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
                className={`w-full flex items-center justify-center font-bold py-2.5 px-4 rounded-lg transition-colors ${isProcessing
                    ? 'bg-slate-700 text-slate-400 cursor-wait'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
            >
                {isProcessing ? (
                    <span className="flex items-center">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                    </span>
                ) : (
                    <>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Request
                    </>
                )}
            </button>
        );
    };

    const renderUserCardContent = (user: User, matchingSkills: Skill[]) => (
        <>
            <div>
                <div className="flex items-center mb-4">
                    <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-slate-600" />
                    <div>
                        <h3 className="text-xl font-bold text-white">{user.name}</h3>
                        {/* Online tag removed as per request */}
                    </div>
                </div>
                <p className="text-slate-400 mb-4 text-sm line-clamp-2">{user.bio}</p>
                <div>
                    <h4 className="font-semibold mb-2 text-slate-300">Matching Skills:</h4>
                    <div className="flex flex-wrap min-h-[2.5rem] items-center">
                        {matchingSkills.length > 0 ? (
                            matchingSkills.map(skill => (
                                <SkillTag key={skill.id} skill={skill} variant="learn" />
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 italic px-1">No direct skill matches</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-6">
                {getButtonState(user)}
            </div>
        </>
    );

    const allMatches = [...topMatches, ...otherMatches];

    const pageTitle = categoryFilter
        ? `Mentors for ${categories.find(c => c.id === categoryFilter)?.name}`
        : "Your Top Matches";

    const noMatchesMessage = () => {
        return (
            <>
                <p className="text-slate-400">No users found.</p>
                <p className="text-slate-500 mt-2">Try adjusting your filters to see more results.</p>
            </>
        )
    };


    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-slate-100 mb-6">{pageTitle}</h1>

            {/* Filter Bar */}
            <div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div>
                        <label htmlFor="search-matches" className="block text-sm font-medium text-slate-400 mb-1">Search by Name or Bio</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                id="search-matches"
                                type="text"
                                placeholder="e.g., 'React' or 'David'"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-700"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label htmlFor="category-filter" className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                        <select
                            id="category-filter"
                            value={categoryFilter || ''}
                            onChange={(e) => setCategoryFilter(e.target.value || null)}
                            className="w-full bg-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-700 h-10"
                        >
                            <option value="">All Categories</option>
                            {categories.filter(c => c.id !== 'c5').map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Online Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 h-10 items-center">
                            <button
                                onClick={() => setOnlineStatusFilter('all')}
                                className={`flex-1 text-sm py-1 rounded-md transition-colors duration-200 ${onlineStatusFilter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setOnlineStatusFilter('online')}
                                className={`flex-1 text-sm py-1 rounded-md transition-colors duration-200 ${onlineStatusFilter === 'online' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                            >
                                Online
                            </button>
                        </div>
                    </div>

                    {/* Token Balance Filter */}
                    <div>
                        <label htmlFor="token-filter" className="block text-sm font-medium text-slate-400 mb-1">Token Balance</label>
                        <select
                            id="token-filter"
                            value={tokenRangeFilter}
                            onChange={(e) => setTokenRangeFilter(e.target.value)}
                            className="w-full bg-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-700 h-10"
                        >
                            <option value="any">Any</option>
                            <option value="5">5+</option>
                            <option value="10">10+</option>
                            <option value="20">20+</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topMatches.map(({ user, matchingSkills }) => (
                    <GlowBorderCard key={user.id} onClick={() => setSelectedUser(user)}>
                        <div
                            className="p-6 flex flex-col justify-between h-full relative cursor-pointer"
                        >
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg border border-white/20">
                                Top Match
                            </div>
                            {renderUserCardContent(user, matchingSkills)}
                        </div>
                    </GlowBorderCard>
                ))}
                {otherMatches.map(({ user, matchingSkills }) => (
                    <div
                        key={user.id}
                        className="bg-slate-800 rounded-xl shadow-md border border-slate-700 p-6 flex flex-col justify-between transition-transform transform hover:-translate-y-1 cursor-pointer hover:bg-slate-700/50"
                        onClick={() => setSelectedUser(user)}
                    >
                        {renderUserCardContent(user, matchingSkills)}
                    </div>
                ))}
                {allMatches.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-800 rounded-xl border border-dashed border-slate-700">
                        {noMatchesMessage()}
                    </div>
                )}
            </div>

            <UserProfileModal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                users={allUsers} // Pass ALL users for complete rater lookup
            />
        </div>
    );
};

export default MatchesPage;