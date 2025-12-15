import React, { useState, useEffect, useRef } from 'react';
import type { User, ConnectionRequest, Session, Rating, Message, Skill, TokenTransaction } from './types';
import { AuthContext } from './context/AuthContext';
import { users as initialUsers, connectionRequests as initialConnectionRequests, ratings as initialRatings, sessions as initialSessions, messages as initialMessages, tokenTransactions as initialTokenTransactions, skills as initialSkills } from './data/mockData';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import CoachPage from './pages/CoachPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import UserProfilePage from './pages/UserProfilePage';
import RatingModal from './components/RatingModal';
import Modal from './components/Modal';
import ScheduleSessionModal from './components/ScheduleSessionModal';
import LiveSessionPage from './pages/LiveSessionPage';
import LoadingScreen from './components/LoadingScreen';
import EditProfileModal from './components/EditProfileModal';
import Dock from './components/Dock';
import { HomeIcon, MagnifyingGlassIcon, UserCircleIcon, ChatBubbleLeftRightIcon, SparklesIcon, ShieldCheckIcon, BellIcon, PlusCircleIcon } from './components/icons';
// Import the auth wrappers
import { signInWithGooglePopup, loginWithEmailAndPasswordService, registerWithEmailAndPassword } from './services/authServices';
import { api } from './services/api';


import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children, currentUser, isAdmin, logout, theme, toggleTheme, navItems }: any) => {
    const location = useLocation();
    const currentPageId = navItems.find((item: any) => item.path === location.pathname)?.id || '';

    return (
        <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
            <Header
                currentUser={currentUser}
                isAdmin={isAdmin}
                logout={logout}
                theme={theme}
                toggleTheme={toggleTheme}
                navItems={navItems}
                currentPage={currentPageId} // Pass currentPageId for Header's active state
                setCurrentPage={() => { }} // No-op, navigation handled by Router
            />

            {!isAdmin && (
                <Dock
                    navItems={navItems}
                    currentPage={currentPageId} // Pass currentPageId for Dock's active state
                    setCurrentPage={() => { }} // No-op, navigation handled by Router
                />
            )}

            <main className={`pt-28 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8`}>
                {children}
            </main>
        </div>
    )
}

const App: React.FC = () => {
    // Consume Auth Context
    const {
        currentUser,
        isAdmin,
        loading: authLoading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateUser
    } = React.useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    // State relevant to specific pages - simpler to keep here for this refactor than moving all to context or pages
    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [ratings, setRatings] = useState<Rating[]>(initialRatings);
    const [messages, setMessages] = useState<Message[]>([]);
    const [tokenTransactions, setTokenTransactions] = useState<TokenTransaction[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>(initialSkills);
    const [sessionToRate, setSessionToRate] = useState<Session | null>(null);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    // Data Fetching
    const fetchData = async () => {
        if (!currentUser) return;
        try {
            const [usersRes, sessionsRes, connectionsRes, transactionsRes, ratingsRes] = await Promise.all([
                api.get('/users/'),
                api.get('/sessions/my'),
                api.get('/connections/'),
                api.get('/users/transactions'),
                api.get(`/users/${currentUser.id}/ratings`)
            ]);
            setAllUsers(usersRes.map((u: any) => ({ ...u, id: u._id || u.id })));
            setSessions(sessionsRes.map((s: any) => ({
                ...s,
                id: s._id || s.id,
                scheduledTime: new Date(s.scheduledTime.endsWith('Z') ? s.scheduledTime : s.scheduledTime + 'Z'),
                startedAt: s.startedAt ? new Date(s.startedAt.endsWith('Z') ? s.startedAt : s.startedAt + 'Z') : undefined
            })));
            setConnectionRequests(connectionsRes.map((c: any) => ({ ...c, id: c._id || c.id })));
            setTokenTransactions(transactionsRes.map((t: any) => ({ ...t, id: t._id || t.id, timestamp: new Date(t.timestamp) })));
            setRatings(ratingsRes.map((r: any) => ({ ...r, id: r._id || r.id })));
        } catch (e) {
            console.error("Failed to fetch data", e);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    useEffect(() => {
        // Simulate asset loading (UI splash)
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const addNewSkill = (newSkill: Skill) => {
        setAllSkills(prev => [...prev, newSkill]);
    };

    const handleUpdateUser = (updatedUser: User) => {
        updateUser(updatedUser);
        // Also update local list if contained
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        setIsEditingProfile(false);
    };


    const removeUser = (userId: string) => {
        setAllUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    };

    const sendConnectionRequest = async (receiverId: string) => {
        if (!currentUser) return;
        try {
            await api.post('/connections/request', { receiverId });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to send request", error);
        }
    };

    const handleConnectionRequest = async (requestId: string, newStatus: 'accepted' | 'declined') => {
        try {
            if (newStatus === 'accepted') {
                await api.put(`/connections/${requestId}/accept`);
                // Refresh current user to update connections list locally
                const meRes = await api.get('/users/me');
                if (meRes) {
                    updateUser({ ...meRes, id: meRes._id || meRes.id });
                }
            } else {
                // decline endpoint not implemented explicitly, ignoring
            }
            fetchData();
        } catch (error) {
            console.error("Failed to handle request", error);
        }
    };

    const cancelConnectionRequest = async (requestId: string) => {
        try {
            await api.delete(`/connections/${requestId}`);
            setConnectionRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error("Failed to cancel request", error);
        }
    };


    const handleOpenRatingModal = (session: Session) => {
        setSessionToRate(session);
    };

    const handleCloseRatingModal = () => {
        setSessionToRate(null);
    };

    const handleSubmitRating = async (sessionId: string, stars: number, feedback: string) => {
        if (!currentUser || !sessionToRate) return;

        try {
            await api.post(`/sessions/${sessionId}/rate`, { stars, feedback });
            fetchData(); // Refresh to get updated session status and new rating
            handleCloseRatingModal();
        } catch (error) {
            console.error("Failed to submit rating", error);
        }
    };

    // -- WebSocket & Chat Logic --
    const ws = useRef<WebSocket | null>(null);

    const fetchMessages = async () => {
        try {
            const msgs = await api.get('/chat/');
            // Ensure dates are Date objects
            const parsedMsgs = msgs.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp),
                id: m._id || m.id
            }));
            setMessages(parsedMsgs);
        } catch (e) {
            console.error("Failed to fetch messages", e);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchMessages();

            // Connect WebSocket
            const socketUrl = `ws://localhost:8000/chat/ws/${currentUser.id}`;
            ws.current = new WebSocket(socketUrl);

            ws.current.onopen = () => {
                console.log("WebSocket connected for user:", currentUser.id);
                // Flush queued signals
                while (signalQueue.length) {
                    const e = signalQueue.shift();
                    if (e) {
                        const payload = {
                            receiverId: e.detail.target,
                            text: JSON.stringify(e.detail),
                            messageType: 'signal'
                        };
                        ws.current?.send(JSON.stringify(payload));
                        console.log("Flushed queued signal", e.detail);
                    }
                }
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // Handle WebRTC Signals directly
                if (data.messageType === 'signal') {
                    if (data.text) {
                        try {
                            const signalPayload = JSON.parse(data.text);
                            // Verify target matches current user (should be guaranteed by backend routing but good for sanity)
                            // The backend sent it to us, so we are the target.
                            // But the signal payload has 'target' field?
                            // e.detail structure from LiveSession was: { target, sender, payload }
                            // We wrapped it in text.
                            window.dispatchEvent(new CustomEvent('webrtc-signal', { detail: signalPayload }));
                        } catch (e) {
                            console.error("Failed to parse signal payload", e);
                        }
                    }
                    return; // Do not process as chat message
                }

                console.log("WS Received:", data); // DEBUG LOG

                // Parse session data if present
                const sessionData = data.session ? {
                    ...data.session,
                    id: data.session._id || data.session.id,
                    scheduledTime: new Date(data.session.scheduledTime.endsWith('Z') ? data.session.scheduledTime : data.session.scheduledTime + 'Z'),
                    startedAt: data.session.startedAt ? new Date(data.session.startedAt.endsWith('Z') ? data.session.startedAt : data.session.startedAt + 'Z') : undefined
                } : undefined;

                const parsedMessage: Message = {
                    ...data,
                    timestamp: new Date(data.timestamp),
                    id: data._id || data.id,
                    session: sessionData,
                    isRead: data.isRead ?? false // Ensure isRead is set, default to false
                };

                setMessages(prev => {
                    // Avoid duplicates if we sent it and got it back (server echoes messages)
                    if (prev.some(m => m.id === parsedMessage.id)) return prev;
                    return [...prev, parsedMessage];
                });

                // Refresh data if it's a session-related message or a session card
                if (parsedMessage.session || parsedMessage.messageType === 'session_card') {
                    fetchData();
                }
            };

            ws.current.onclose = () => {
                console.log("WebSocket Disconnected");
            };

            // WebRTC Signal Sender Listener
            const signalQueue: CustomEvent[] = []; // Simple queue for this session
            const handleWebRTCSend = (e: CustomEvent) => {
                const payload = {
                    receiverId: e.detail.target,
                    text: JSON.stringify(e.detail),
                    messageType: 'signal'
                };

                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify(payload));
                } else {
                    console.warn("WS not ready to send signal, queuing...", e.detail);
                    signalQueue.push(e); // Keep event to retry logic or push payload?
                    // Better to just retry sending if we hook into onopen
                }
            };
            window.addEventListener('send-webrtc-signal', handleWebRTCSend as EventListener);

            // Signal that transport is ready
            (window as any).SKILLSWAP_SIGNAL_READY = true;
            window.dispatchEvent(new CustomEvent('skillswap-signal-ready'));

            return () => {
                (window as any).SKILLSWAP_SIGNAL_READY = false;
                window.removeEventListener('send-webrtc-signal', handleWebRTCSend as EventListener);
                if (ws.current) {
                    // ...

                    console.log("WebSocket Disconnected");
                    ws.current.close();
                }
            };
        }
    }, [currentUser?.id]); // Only reconnect if user ID changes, not just any user data update

    const handleSendMessage = async (text: string, receiverId: string) => {
        if (!currentUser || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

        const payload = {
            receiverId,
            text,
            messageType: 'text'
        };
        ws.current.send(JSON.stringify(payload));

        // Optimistic update (optional, but we get echo back from server anyway)
        // We'll rely on the server echo for now to ensure consistency
    };

    const handleProposeSession = async (teacher: User, skill: Skill, time: Date, duration: number) => {
        if (!currentUser) return;
        try {
            const newSession = await api.post('/sessions/', {
                studentId: currentUser.id,
                teacherId: teacher.id,
                skill: skill,
                scheduledTime: time,
                duration: duration,
                cost: 1
            });

            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                const payload = {
                    receiverId: teacher.id,
                    text: `Proposed a session: ${skill.name} (${duration} mins)`,
                    messageType: 'session_card',
                    session: { ...newSession, id: newSession._id || newSession.id }
                };
                ws.current.send(JSON.stringify(payload));
            }

            fetchData();
            setIsScheduling(false);
        } catch (error) {
            console.error("Failed to propose session", error);
        }
    };

    const handleSessionResponse = async (sessionId: string, response: 'accepted' | 'declined') => {
        try {
            if (response === 'accepted') {
                const updatedSession = await api.put(`/sessions/${sessionId}/accept`);

                // Notify via WebSocket
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    const payload = {
                        receiverId: updatedSession.proposerId, // Notify the person who proposed
                        text: `Accepted session request!`,
                        messageType: 'text', // Simple text for now, or could be 'session_update'
                        session: updatedSession
                    };
                    ws.current.send(JSON.stringify(payload));
                }
            } else {
                const updatedSession = await api.put(`/sessions/${sessionId}/decline`);

                // Notify via WebSocket
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    const payload = {
                        receiverId: updatedSession.studentId, // Notify the student (proposer)
                        text: `Declined session request.`,
                        messageType: 'text',
                        session: updatedSession
                    };
                    ws.current.send(JSON.stringify(payload));
                }
            }
            fetchData();
        } catch (error) {
            console.error("Failed to respond to session", error);
        }
    };

    const handleCompleteSession = async (sessionId: string) => {
        try {
            await api.put(`/sessions/${sessionId}/complete`);
            // Refresh current user to update token count
            const meRes = await api.get('/users/me');
            if (meRes) {
                updateUser({ ...meRes, id: meRes._id || meRes.id });
            }
            fetchData();

            // Open rating modal if we have the session object locally
            const justCompletedSession = sessions.find(s => s.id === sessionId);
            if (justCompletedSession) {
                setSessionToRate(justCompletedSession);
            }
        } catch (error) {
            console.error("Failed to complete session", error);
        }
    };

    const startLiveSession = (session: Session) => {
        setActiveSession(session);
        // Note: We need to navigate to live session route, handling below
    };

    const endLiveSession = () => {
        setActiveSession(null);
        // Note: navigate to dashboard
    };

    // Auth Wrappers using Context
    // We can define handlers that just call context functions and then redirect

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Google Login Error:", error);
        }
    };

    const handleEmailLogin = async (emailOrUsername: string, password: string) => {
        try {
            await loginWithEmail(emailOrUsername, password);
        } catch (error) {
            console.error("Login Failed:", error);
        }
    };

    const handleEmailSignup = async (email: string, password: string, username: string) => {
        try {
            await signupWithEmail(email, password, username);
        } catch (error) {
            console.error("Signup Failed:", error);
        }
    };

    const startChat = (user: User) => {
        setActiveChatPartner(user);
        // We will need navigation to chat
    };

    const handleMarkAsRead = async (partnerId: string) => {
        if (!currentUser) return;
        try {
            await api.put(`/chat/${partnerId}/read`);
            setMessages(prev => prev.map(m =>
                (m.senderId === partnerId && m.receiverId === currentUser.id)
                    ? { ...m, isRead: true }
                    : m
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleClearChat = async (partnerId: string) => {
        if (!currentUser) return;
        try {
            await api.delete(`/chat/${partnerId}`);
            setMessages(prev => prev.filter(m =>
                !((m.senderId === currentUser.id && m.receiverId === partnerId) ||
                    (m.senderId === partnerId && m.receiverId === currentUser.id))
            ));
        } catch (error) {
            console.error("Failed to clear chat", error);
        }
    };

    const targetUserForRating = sessionToRate ? allUsers.find(u => u.id === (sessionToRate.studentId === currentUser?.id ? sessionToRate.teacherId : sessionToRate.studentId)) : null;

    const pendingRequestsCount = currentUser ? connectionRequests.filter(
        r => r.receiverId === currentUser.id && r.status === 'pending'
    ).length : 0;

    const unreadMessagesCount = currentUser ? messages.filter(
        m => m.receiverId === currentUser.id && !m.isRead
    ).length : 0;

    const userNavItems = [
        { id: 'dashboard', path: '/', label: 'Dashboard', icon: HomeIcon, count: 0 },
        { id: 'matches', path: '/matches', label: 'Matches', icon: MagnifyingGlassIcon, count: 0 },
        { id: 'notifications', path: '/notifications', label: 'Notifications', icon: BellIcon, count: pendingRequestsCount },
        { id: 'chat', path: '/chat', label: 'Chat', icon: ChatBubbleLeftRightIcon, count: unreadMessagesCount },
        { id: 'coach', path: '/coach', label: 'AI Coach', icon: SparklesIcon, count: 0 },
        { id: 'profile', path: '/profile', label: 'Profile', icon: UserCircleIcon, count: 0 },
    ];

    const adminNavItems = [
        { id: 'admin', path: '/admin', label: 'Admin Panel', icon: ShieldCheckIcon, count: 0 },
    ];

    if (isLoading || authLoading) {
        return <LoadingScreen />;
    }

    if (!hasStarted) {
        return <LandingPage onGetStarted={() => setHasStarted(true)} />;
    }

    if (!currentUser) {
        return <LoginPage onGoogleLogin={handleGoogleLogin} onEmailLogin={handleEmailLogin} onSignup={handleEmailSignup} />;
    }

    // Wrappers for navigation actions
    const NavigationWrapper = ({ children }: any) => {
        const navigate = useNavigate();

        // This effect handles the "event" based navigation from the internal logic functions
        // Ideally we would rewrite startChat etc to use navigate(), but passing navigate to them is hard inside the component body without heavy rewrites.
        // Instead, we can redefine them here or just let the pages use `Link` where possible.
        // For `startChat` which is used in MatchesPage, we pass a wrapper.

        const startChatWithNav = (user: User) => {
            setActiveChatPartner(user);
            navigate('/chat');
        };

        const startLiveSessionWithNav = (session: Session) => {
            setActiveSession(session);
            navigate(`/session/${session.id}`);
        };

        const viewProfileWithNav = (user: User) => {
            setViewingProfile(user);
            navigate(`/user/${user.id}`);
        };

        return children({ startChatWithNav, startLiveSessionWithNav, viewProfileWithNav, navigate });
    }


    return (
        <Router>
            <NavigationWrapper>{({ startChatWithNav, startLiveSessionWithNav, viewProfileWithNav, navigate }: any) => (
                <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
                    <Routes>
                        {/* Live Session Route (no header/dock usually, or simplified) */}
                        <Route path="/session/:sessionId" element={
                            activeSession ? (
                                <LiveSessionPage
                                    session={activeSession}
                                    currentUser={currentUser}
                                    otherUser={allUsers.find(u => u.id === (activeSession.studentId === currentUser.id ? activeSession.teacherId : activeSession.studentId))!}
                                    onEndSession={async () => {
                                        await handleCompleteSession(activeSession.id);
                                        setActiveSession(null);
                                        navigate('/');
                                    }}
                                />
                            ) : <Navigate to="/" />
                        } />

                        {/* All other pages with Layout */}
                        <Route path="*" element={
                            <Layout
                                currentUser={currentUser}
                                isAdmin={isAdmin}
                                logout={logout}
                                theme={theme}
                                toggleTheme={toggleTheme}
                                navItems={isAdmin ? adminNavItems : userNavItems}
                            >
                                <Routes>
                                    <Route path="/" element={isAdmin ? <Navigate to="/admin" replace /> : <DashboardPage sessions={sessions} ratings={ratings} users={allUsers.filter(u => !u.isAdmin)} openRatingModal={handleOpenRatingModal} completeSession={handleCompleteSession} startLiveSession={startLiveSessionWithNav} currentUser={currentUser!} sendConnectionRequest={sendConnectionRequest} connectionRequests={connectionRequests} startChat={startChatWithNav} onCategorySelect={(cat) => { setCategoryFilter(cat); navigate('/matches'); }} />} />

                                    <Route path="/matches" element={
                                        <MatchesPage
                                            currentUser={currentUser!}
                                            users={allUsers.filter(u => u.id !== currentUser?.id && !u.isAdmin)}
                                            allUsers={allUsers} // Pass full list for lookups
                                            startChat={startChatWithNav}
                                            connectionRequests={connectionRequests}
                                            sendConnectionRequest={sendConnectionRequest}
                                            categoryFilter={categoryFilter}
                                            setCategoryFilter={setCategoryFilter}
                                            handleRequest={handleConnectionRequest}
                                        />
                                    } />

                                    <Route path="/notifications" element={
                                        <NotificationsPage
                                            requests={connectionRequests}
                                            handleRequest={handleConnectionRequest}
                                            cancelRequest={cancelConnectionRequest}
                                            users={allUsers}
                                            currentUserId={currentUser!.id}
                                            viewUserProfile={viewProfileWithNav}
                                        />
                                    } />

                                    <Route path="/chat" element={
                                        <ChatPage
                                            currentUser={currentUser!}
                                            allUsers={allUsers}
                                            activeChatPartner={activeChatPartner}
                                            setActiveChatPartner={setActiveChatPartner}
                                            messages={messages}
                                            sessions={sessions}
                                            sendMessage={handleSendMessage}
                                            openSchedulingModal={() => setIsScheduling(true)}
                                            handleSessionResponse={handleSessionResponse}
                                            markAsRead={handleMarkAsRead}
                                            clearChat={handleClearChat}
                                            setCurrentPage={(page) => {
                                                // Backward compatibility if ChatPage tries to nav
                                                if (page === 'dashboard') navigate('/');
                                            }}
                                        />
                                    } />

                                    <Route path="/coach" element={<CoachPage />} />

                                    <Route path="/profile" element={<ProfilePage ratings={ratings} users={allUsers} tokenTransactions={tokenTransactions} allSkills={allSkills} addNewSkill={addNewSkill} openEditModal={() => setIsEditingProfile(true)} />} />

                                    <Route path="/user/:userId" element={
                                        viewingProfile ? (
                                            <UserProfilePage user={viewingProfile} goBack={() => navigate(-1)} ratings={ratings} users={allUsers} />
                                        ) : <Navigate to="/" />
                                    } />

                                    <Route path="/admin" element={
                                        isAdmin ? <AdminDashboardPage /> : <Navigate to="/" />
                                    } />
                                </Routes>
                            </Layout>
                        } />
                    </Routes>

                    {/* Modals outside routes so they can overlay */}
                    {sessionToRate && targetUserForRating && (
                        <RatingModal
                            isOpen={!!sessionToRate}
                            onClose={handleCloseRatingModal}
                            session={sessionToRate}
                            targetUser={targetUserForRating}
                            onSubmit={handleSubmitRating}
                            // Custom placeholder based on role
                            placeholder={
                                sessionToRate.teacherId === currentUser?.id
                                    ? `How was your experience teaching ${sessionToRate.skill.name} to ${targetUserForRating.name}?`
                                    : `How was your experience learning ${sessionToRate.skill.name} from ${targetUserForRating.name}?`
                            }
                            title={
                                sessionToRate.teacherId === currentUser?.id
                                    ? `Rate your teaching session with ${targetUserForRating.name}`
                                    : `Rate your learning session with ${targetUserForRating.name}`
                            }
                        />
                    )}

                    {isScheduling && activeChatPartner && (
                        <ScheduleSessionModal
                            isOpen={isScheduling}
                            onClose={() => setIsScheduling(false)}
                            currentUser={currentUser}
                            targetUser={activeChatPartner}
                            onSubmit={handleProposeSession}
                        />
                    )}
                    {isEditingProfile && currentUser && (
                        <EditProfileModal
                            isOpen={isEditingProfile}
                            onClose={() => setIsEditingProfile(false)}
                            user={currentUser}
                            onSave={async (updatedUser) => {
                                await updateUser(updatedUser);
                                setIsEditingProfile(false);
                            }}
                            allSkills={allSkills}
                            addNewSkill={addNewSkill}
                        />
                    )}
                </div>
            )}
            </NavigationWrapper>
        </Router>
    );
};

export default App;