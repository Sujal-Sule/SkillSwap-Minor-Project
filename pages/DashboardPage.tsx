import React from 'react';
import type { Session, User, Rating, ConnectionRequest } from '../types';
import { categories } from '../data/categories';
import CategoryCard from '../components/CategoryCard';
import UserSuggestionCard from '../components/UserSuggestionCard';
import SkillTag from '../components/SkillTag';

interface DashboardPageProps {
    sessions: Session[];
    ratings: Rating[];
    users: User[];
    openRatingModal: (session: Session) => void;
    completeSession: (sessionId: string) => void;
    startLiveSession: (session: Session) => void;
    currentUser: User;
    connectionRequests: ConnectionRequest[];
    sendConnectionRequest: (receiverId: string) => void;
    startChat: (user: User) => void;
    onCategorySelect: (categoryId: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ sessions, ratings, users, openRatingModal, completeSession, startLiveSession, currentUser, connectionRequests, sendConnectionRequest, startChat, onCategorySelect }) => {

    if (!currentUser) return null;

    const upcomingSessions = sessions.filter(s => {
        if (s.status !== 'scheduled') return false;
        if (s.studentId !== currentUser.id && s.teacherId !== currentUser.id) return false;

        const scheduledTime = new Date(s.scheduledTime);
        const duration = s.duration || 60;
        const expiryTime = new Date(scheduledTime.getTime() + duration * 60000);

        // Filter out expired sessions
        return new Date() < expiryTime;
    }).sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

    // Suggest users who the current user is not connected with and has no pending requests with
    const connectedUserIds = new Set(currentUser.connections);
    const pendingRequestUserIds = new Set(
        connectionRequests
            .filter(r => r.status === 'pending' && (r.senderId === currentUser.id || r.receiverId === currentUser.id))
            .flatMap(r => [r.senderId, r.receiverId])
    );
    const suggestedUsers = users
        .filter(u => u.id !== currentUser.id && !connectedUserIds.has(u.id) && !pendingRequestUserIds.has(u.id))
        .slice(0, 5); // Limit suggestions

    const getUser = (id: string): User | undefined => users.find(u => u.id === id);

    // Helper to check lock status
    const getSessionAccessState = (session: Session) => {
        const now = new Date();
        const scheduledTime = new Date(session.scheduledTime);
        const unlockTime = new Date(scheduledTime.getTime() - 60 * 60 * 1000); // 1 hour before

        if (now < unlockTime) {
            return { locked: true, message: `Unlocks at ${unlockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
        }
        return { locked: false, message: 'Join Session' };
    };

    return (
        <div className="container mx-auto space-y-12">
            {/* ... (Header and Categories remain same) ... */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
                <p className="text-slate-600 dark:text-slate-400">What will you learn or teach today?</p>
            </div>

            {/* What do you want to learn today? */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">What do you want to learn today?</h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.filter(c => c.id !== 'c5').map(cat => (
                        <CategoryCard key={cat.id} category={cat} onClick={onCategorySelect} />
                    ))}
                </div>
            </div>

            {/* Upcoming Sessions */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Upcoming Sessions</h2>
                {upcomingSessions.length > 0 ? (
                    <div className="flex space-x-6 overflow-x-auto pb-4 -mx-8 px-8">
                        {upcomingSessions.map(session => {
                            const otherPerson = session.studentId === currentUser.id ? getUser(session.teacherId) : getUser(session.studentId);
                            const role = session.studentId === currentUser.id ? 'Learning' : 'Teaching';
                            const { locked, message } = getSessionAccessState(session);

                            if (!otherPerson) return null;
                            return (
                                <div key={session.id} className="w-80 flex-shrink-0 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl backdrop-blur-sm">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <img src={otherPerson.avatarUrl} alt={otherPerson.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{otherPerson.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{role} session</p>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <SkillTag skill={session.skill} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">{new Date(session.scheduledTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                                    <button
                                        onClick={() => startLiveSession(session)}
                                        disabled={locked}
                                        className={`w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${locked
                                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                            : 'bg-sky-600 text-white hover:bg-sky-700'
                                            }`}
                                    >
                                        {locked ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                                </svg>
                                                {message}
                                            </span>
                                        ) : message}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-slate-100 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400">You have no upcoming sessions scheduled.</p>
                    </div>
                )}
            </div>

            {/* Grow your network */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Grow your network</h2>
                {suggestedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {suggestedUsers.map(user => (
                            <UserSuggestionCard
                                key={user.id}
                                user={user}
                                onConnect={() => sendConnectionRequest(user.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-slate-100 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400">We're looking for new people for you to connect with!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;