import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import type { User, Message, Session } from '../types';
// FIX: Imported `ChatBubbleLeftRightIcon` to resolve usage error.
import { PaperAirplaneIcon, AcademicCapIcon, MicrophoneIcon, SparklesIcon, Cog6ToothIcon, MagnifyingGlassIcon, VideoCameraIcon, EllipsisVerticalIcon, ChatBubbleLeftRightIcon } from '../components/icons';

interface ChatPageProps {
    currentUser: User;
    allUsers: User[];
    activeChatPartner: User | null;
    setActiveChatPartner: (user: User | null) => void;
    messages: Message[];
    sessions: Session[];
    sendMessage: (text: string, receiverId: string) => void;
    openSchedulingModal: () => void;
    handleSessionResponse: (sessionId: string, response: 'accepted' | 'declined') => void;
    setCurrentPage: (page: string) => void;
    markAsRead: (partnerId: string) => void;
    clearChat: (partnerId: string) => void;
}

const formatRelativeTime = (date: Date) => {
    // Ensure date is valid
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 'Recently';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // If future date or invalid, fallback
    if (diffMs < 0) {
        return 'Just now';
    }

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return seconds === 1 ? '1s ago' : `${seconds}s ago`;
    if (minutes < 60) return minutes === 1 ? '1m ago' : `${minutes}m ago`;
    if (hours < 24) return hours === 1 ? '1h ago' : `${hours}h ago`;
    if (days < 7) return days === 1 ? '1d ago' : `${days}d ago`;
    return date.toLocaleDateString();
};

const ChatPage: React.FC<ChatPageProps> = ({
    currentUser,
    allUsers,
    activeChatPartner,
    setActiveChatPartner,
    messages,
    sessions,
    sendMessage,
    openSchedulingModal,
    handleSessionResponse,
    setCurrentPage,
    markAsRead,
    clearChat
}) => {
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showMenu, setShowMenu] = useState(false); // For three dots menu
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const conversations = useMemo(() => {
        const convos: { [key: string]: { user: User, lastMessage: Message | null, unreadCount: number } } = {};

        // 1. Add all connections first
        currentUser.connections.forEach(connId => {
            const partner = allUsers.find(u => u.id === connId);
            if (partner) {
                convos[connId] = {
                    user: partner,
                    lastMessage: null,
                    unreadCount: 0
                };
            }
        });

        // 2. Update with actual messages
        messages.forEach(msg => {
            const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
            if (partnerId === currentUser.id) return;

            if (!convos[partnerId]) {
                const partner = allUsers.find(u => u.id === partnerId);
                if (partner) convos[partnerId] = { user: partner, lastMessage: msg, unreadCount: 0 };
                else return;
            }

            const current = convos[partnerId];
            if (!current.lastMessage || msg.timestamp > current.lastMessage.timestamp) {
                current.lastMessage = msg;
            }

            // Count unread: logic is "message from partner" AND "not read"
            if (msg.senderId === partnerId && !msg.isRead) {
                current.unreadCount++;
            }
        });

        return Object.values(convos).sort((a, b) => {
            const timeA = a.lastMessage?.timestamp.getTime() || 0;
            const timeB = b.lastMessage?.timestamp.getTime() || 0;
            return timeB - timeA;
        });
    }, [messages, currentUser.id, currentUser.connections, allUsers]);

    const filteredConversations = conversations.filter(convo =>
        convo.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeConversationMessages = messages.filter(
        msg => (msg.senderId === currentUser.id && msg.receiverId === activeChatPartner?.id) ||
            (msg.senderId === activeChatPartner?.id && msg.receiverId === currentUser.id)
    );

    // Mark as read when active chat changes or new messages arrive
    useEffect(() => {
        if (activeChatPartner) {
            // Check if there are any unread messages from this partner
            const hasUnread = activeConversationMessages.some(m => m.senderId === activeChatPartner.id && !m.isRead);
            if (hasUnread) {
                markAsRead(activeChatPartner.id);
            }
        }
    }, [activeChatPartner, activeConversationMessages, markAsRead]);

    // Close menu when clicking outside (simple fake implementation or just toggle)
    useEffect(() => {
        const handleClickOutside = () => setShowMenu(false);
        if (showMenu) document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showMenu]);

    useLayoutEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, [activeConversationMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeChatPartner) return;
        sendMessage(newMessage, activeChatPartner.id);
        setNewMessage('');
    };

    // ... renderSessionCard logic is same ...
    const renderSessionCard = (session: Session) => {
        const isProposer = session.proposerId === currentUser.id;
        const isPending = session.status === 'proposed';

        return (
            <div className="my-2 p-4 bg-slate-700/50 rounded-lg max-w-sm border border-slate-600">
                <h4 className="font-bold text-white">
                    {isPending ? 'Session Proposed!' : 'Session Scheduled'}
                </h4>
                <p className="text-sm text-slate-300 mt-2">
                    {isProposer
                        ? `You proposed this session. Waiting for response.`
                        : `Proposed a session with you.`}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-600/70 space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Skill:</span>
                        <span className="font-medium text-slate-200">{session.skill.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-medium text-slate-200">{session.duration} minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Date:</span>
                        <span className="font-medium text-slate-200">{new Date(session.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                </div>

                {!isProposer && isPending && (
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => handleSessionResponse(session.id, 'accepted')}
                            className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                            Accept
                        </button>
                        <button
                            onClick={() => handleSessionResponse(session.id, 'declined')}
                            className="flex-1 px-3 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                            Decline
                        </button>
                    </div>
                )}
                {session.status === 'scheduled' && (
                    <div className="mt-4 text-center">
                        <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                            Accepted & Scheduled
                        </span>
                    </div>
                )}
                {session.status === 'declined' && (
                    <div className="mt-4 text-center">
                        <span className="inline-block px-3 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20">
                            Session Declined
                        </span>
                    </div>
                )}
            </div>
        )
    };

    return (
        <div className="h-[calc(100vh-7rem)] w-full bg-slate-900 text-slate-200 flex font-sans">
            {/* Left Panel: Conversation List */}
            <aside className="w-80 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
                <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <h2 className="font-semibold text-white">{currentUser.name}</h2>
                            <p className="text-xs text-emerald-400">Online</p>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-white">
                        <Cog6ToothIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-4 flex-shrink-0">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search for users or conversations"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto">
                    <ul>
                        {filteredConversations.map(({ user, lastMessage, unreadCount }) => (
                            <li key={user.id}>
                                <button
                                    onClick={() => setActiveChatPartner(user)}
                                    className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${activeChatPartner?.id === user.id ? 'bg-slate-900/50' : 'hover:bg-slate-700/50'}`}
                                >
                                    <div className="relative">
                                        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                                        {user.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-800 rounded-full"></span>}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-white truncate">{user.name}</p>
                                            <p className="text-xs text-slate-400 flex-shrink-0">{lastMessage ? formatRelativeTime(lastMessage.timestamp) : 'New'}</p>
                                        </div>
                                        <div className="flex justify-between items-start mt-1">
                                            <p className={`text-sm truncate pr-2 ${unreadCount > 0 ? 'text-white font-medium' : 'text-slate-400'}`}>
                                                {lastMessage ? lastMessage.text : 'Start a conversation'}
                                            </p>
                                            {unreadCount > 0 && (
                                                <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Right Panel: Active Chat */}
            <main className="flex-1 flex flex-col">
                {activeChatPartner ? (
                    <>
                        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={activeChatPartner.avatarUrl} alt={activeChatPartner.name} className="w-10 h-10 rounded-full" />
                                    {activeChatPartner.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full"></span>}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-white">{activeChatPartner.name}</h2>
                                    <p className="text-xs text-slate-400">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 relative">
                                {/* Removed VideoCameraIcon */}
                                <button
                                    className="text-slate-400 hover:text-white"
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                >
                                    <EllipsisVerticalIcon className="w-6 h-6" />
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 top-10 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-50">
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                                            onClick={() => {
                                                if (confirm("Are you sure you want to clear this chat? This cannot be undone.")) {
                                                    clearChat(activeChatPartner.id);
                                                    setShowMenu(false);
                                                }
                                            }}
                                        >
                                            Clear Chat (Delete)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </header>
                        {/* ... rest of render (messages map) can stay similar, just updated ... */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeConversationMessages.map((msg) => {
                                const isSender = msg.senderId === currentUser.id;
                                if (msg.messageType === 'ai_suggestion') {
                                    return (
                                        <div key={msg.id} className="flex justify-center">
                                            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-700/50 border border-slate-600/80 rounded-full text-sky-300 hover:bg-slate-700 transition-colors">
                                                <SparklesIcon className="w-4 h-4" />
                                                <span>{msg.text}</span>
                                            </button>
                                        </div>
                                    )
                                }
                                if (msg.messageType === 'session_card' && msg.session) {
                                    return (
                                        <div key={msg.id} className="flex justify-center">
                                            {renderSessionCard(msg.session)}
                                        </div>
                                    )
                                }
                                return (
                                    <div key={msg.id} className={`flex items-end gap-3 ${isSender ? 'justify-end' : ''}`}>
                                        {!isSender && <img src={activeChatPartner.avatarUrl} alt={activeChatPartner.name} className="w-8 h-8 rounded-full" />}
                                        <div className={`max-w-md px-4 py-2.5 rounded-2xl ${isSender ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-slate-700 flex-shrink-0">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                                <button type="button" onClick={openSchedulingModal} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-sky-300 font-semibold">
                                    <AcademicCapIcon className="w-5 h-5" /> Propose Session
                                </button>
                                <button type="button" className="p-2 text-slate-400 hover:text-white"><MicrophoneIcon className="w-5 h-5" /></button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                                <button type="submit" className="p-2.5 bg-sky-600 text-white rounded-full hover:bg-sky-700 disabled:bg-sky-800" disabled={!newMessage.trim()}>
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                        <div>
                            <ChatBubbleLeftRightIcon className="w-16 h-16 text-slate-700 mx-auto" />
                            <h2 className="mt-4 text-xl font-semibold text-slate-400">Select a conversation</h2>
                            <p className="text-slate-500">Choose from your existing conversations to start chatting.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatPage;