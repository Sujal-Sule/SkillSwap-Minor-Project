import React from 'react';
import type { User, ConnectionRequest } from '../types';

interface NotificationsPageProps {
    requests: ConnectionRequest[];
    handleRequest: (requestId: string, status: 'accepted' | 'declined') => void;
    cancelRequest: (requestId: string) => void;
    users: User[];
    currentUserId: string;
    viewUserProfile: (user: User) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ requests, handleRequest, cancelRequest, users, currentUserId, viewUserProfile }) => {
    const incoming = requests.filter(r => r.receiverId === currentUserId && r.status === 'pending');
    const outgoing = requests.filter(r => r.senderId === currentUserId && r.status === 'pending');

    const getUser = (id: string): User | undefined => users.find(u => u.id === id);

    return (
        <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Notifications</h1>

            <div className="space-y-8">
                {/* Incoming Requests */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Incoming Requests</h2>
                    {incoming.length > 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
                            {incoming.map(req => {
                                const sender = getUser(req.senderId);
                                if (!sender) return null;
                                return (
                                    <div key={req.id} className="p-4 flex items-center justify-between">
                                        <button onClick={() => viewUserProfile(sender)} className="flex items-center space-x-4 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg p-2 -m-2 transition-colors duration-200">
                                            <img src={sender.avatarUrl} alt={sender.name} className="w-12 h-12 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">{sender.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Wants to connect with you.</p>
                                            </div>
                                        </button>
                                        <div className="flex items-center space-x-3">
                                            <button 
                                                onClick={() => handleRequest(req.id, 'accepted')}
                                                className="px-4 py-2 text-sm font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => handleRequest(req.id, 'declined')}
                                                className="px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <p className="text-slate-500 dark:text-slate-400">You have no new connection requests.</p>
                        </div>
                    )}
                </div>

                {/* Sent Requests */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Sent Requests</h2>
                     {outgoing.length > 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
                            {outgoing.map(req => {
                                const receiver = getUser(req.receiverId);
                                if (!receiver) return null;
                                return (
                                    <div key={req.id} className="p-4 flex items-center justify-between">
                                        <button onClick={() => viewUserProfile(receiver)} className="flex items-center space-x-4 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg p-2 -m-2 transition-colors duration-200">
                                            <img src={receiver.avatarUrl} alt={receiver.name} className="w-12 h-12 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">{receiver.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Invitation sent.</p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => cancelRequest(req.id)}
                                            className="px-4 py-2 text-sm font-semibold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                             <p className="text-slate-500 dark:text-slate-400">You haven't sent any pending requests.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;