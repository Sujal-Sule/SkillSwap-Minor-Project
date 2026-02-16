import React, {
  useState,
  useEffect,
  useRef,
  Component,
  ReactNode,
  ErrorInfo,
} from "react";
import type {
  User,
  ConnectionRequest,
  Session,
  Rating,
  Message,
  Skill,
  TokenTransaction,
} from "./types";
import { AuthContext } from "./context/AuthContext";
import {
  users as initialUsers,
  connectionRequests as initialConnectionRequests,
  ratings as initialRatings,
  sessions as initialSessions,
  messages as initialMessages,
  tokenTransactions as initialTokenTransactions,
  skills as initialSkills,
} from "./data/mockData";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import CoachPage from "./pages/CoachPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import UserProfilePage from "./pages/UserProfilePage";
import RoadmapPage from "./pages/RoadmapPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import CommunityPage from "./pages/CommunityPage";
import RatingModal from "./components/RatingModal";
import Modal from "./components/Modal";
import ScheduleSessionModal from "./components/ScheduleSessionModal";
import LiveSessionPage from "./pages/LiveSessionPage";
import ScrollToTop from "./components/ScrollToTop";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";

import EditProfileModal from "./components/EditProfileModal";
import Dock from "./components/Dock";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BellIcon,
  PlusCircleIcon,
} from "./components/icons";
// Import the auth wrappers
import {
  signInWithGooglePopup,
  loginWithEmailAndPasswordService,
  registerWithEmailAndPassword,
} from "./services/authServices";
import { api, getWebSocketUrl } from "./services/api";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

const parseAsUTC = (dateString: string) => {
  if (!dateString) return new Date();
  // If explicitly UTC or has timezone offset, parse as is
  if (
    dateString.endsWith("Z") ||
    /[\+\-]\d{2}:\d{2}$/.test(dateString) ||
    /[\+\-]\d{4}$/.test(dateString)
  ) {
    return new Date(dateString);
  }
  // Otherwise assume UTC and append Z
  return new Date(dateString + "Z");
};

const Layout = ({
  children,
  currentUser,
  isAdmin,
  logout,
  theme,
  toggleTheme,
  navItems,
}: any) => {
  const location = useLocation();
  const currentPageId =
    navItems.find((item: any) => item.path === location.pathname)?.id || "";

  return (
    <div className="w-full min-h-screen bg-background text-text-primary font-sans transition-colors duration-300">
      <Header
        currentUser={currentUser}
        isAdmin={isAdmin}
        logout={logout}
        theme={theme}
        toggleTheme={toggleTheme}
        navItems={navItems}
        currentPage={currentPageId} // Pass currentPageId for Header's active state
        setCurrentPage={() => {}} // No-op, navigation handled by Router
      />

      {!isAdmin && (
        <Dock
          navItems={navItems}
          currentPage={currentPageId} // Pass currentPageId for Dock's active state
          setCurrentPage={() => {}} // No-op, navigation handled by Router
        />
      )}

      <main
        className={`${
          location.pathname === "/chat"
            ? "pt-20 px-0 h-[calc(100vh-80px)]"
            : location.pathname === "/coach"
              ? "fixed top-0 left-0 w-full h-full pt-0 z-0 overflow-hidden"
              : "pt-24 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };
  props: any;

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            The application encountered an unexpected error. We've logged the
            details and are looking into it.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-8 py-3 bg-sky-500 text-white rounded-full font-bold shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
          >
            Back to Home
          </button>
          {import.meta.env.DEV && (
            <div className="mt-12 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-left font-mono text-xs max-w-2xl overflow-auto border border-border">
              <p className="text-rose-500 font-bold mb-2">
                {this.state.error?.name}: {this.state.error?.message}
              </p>
              <pre className="text-slate-500">{this.state.error?.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return (this.props as any).children;
  }
}

// Global Nav Wrapper component defined outside to prevent remounts
interface NavigationWrapperProps {
  children: (navProps: {
    startChatWithNav: (user?: User | null) => void;
    startLiveSessionWithNav: (session: Session) => void;
    viewProfileWithNav: (user: User) => void;
    navigate: ReturnType<typeof useNavigate>;
  }) => React.ReactNode;
  setActiveChatPartner: (u: User | null) => void;
  setActiveSession: (s: Session | null) => void;
  setViewingProfile: (u: User | null) => void;
}

const NavigationWrapper: React.FC<NavigationWrapperProps> = ({
  children,
  setActiveChatPartner,
  setActiveSession,
  setViewingProfile,
}) => {
  const navigate = useNavigate();

  const startChatWithNav = (user?: User | null) => {
    setActiveChatPartner(user || null);
    navigate("/chat");
  };

  const startLiveSessionWithNav = (session: Session) => {
    setActiveSession(session);
    navigate(`/session/${session.id}`);
  };

  const viewProfileWithNav = (user: User) => {
    setViewingProfile(user);
    navigate(`/user/${user.id}`);
  };

  return children({
    startChatWithNav,
    startLiveSessionWithNav,
    viewProfileWithNav,
    navigate,
  }) as React.ReactElement;
};

const App: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    loading: authLoading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
    updateUser,
  } = React.useContext(AuthContext);

  // State relevant to specific pages - simpler to keep here for this refactor than moving all to context or pages
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<
    ConnectionRequest[]
  >([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ratings, setRatings] = useState<Rating[]>(initialRatings);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tokenTransactions, setTokenTransactions] = useState<
    TokenTransaction[]
  >([]);
  const [allSkills, setAllSkills] = useState<Skill[]>(initialSkills);
  const [sessionToRate, setSessionToRate] = useState<Session | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as
        | "light"
        | "dark"
        | null;
      if (savedTheme) {
        return savedTheme;
      }
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Data Fetching
  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const [
        usersRes,
        sessionsRes,
        connectionsRes,
        transactionsRes,
        ratingsRes,
      ] = await Promise.all([
        api.get("/users/"),
        api.get("/sessions/my"),
        api.get("/connections/"),
        api.get("/users/transactions"),
        api.get(`/users/${currentUser.id}/ratings`),
      ]);
      setAllUsers(usersRes.map((u: any) => ({ ...u, id: u._id || u.id })));
      setSessions(
        sessionsRes.map((s: any) => ({
          ...s,
          id: s._id || s.id,
          scheduledTime: parseAsUTC(s.scheduledTime),
          startedAt: s.startedAt ? parseAsUTC(s.startedAt) : undefined,
        })),
      );
      setConnectionRequests(
        connectionsRes.map((c: any) => ({ ...c, id: c._id || c.id })),
      );
      setTokenTransactions(
        transactionsRes.map((t: any) => ({
          ...t,
          id: t._id || t.id,
          timestamp: parseAsUTC(t.timestamp),
        })),
      );
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
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const addNewSkill = (newSkill: Skill) => {
    setAllSkills((prev) => [...prev, newSkill]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    updateUser(updatedUser);
    // Also update local list if contained
    setAllUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
    setIsEditingProfile(false);
  };

  const removeUser = (userId: string) => {
    setAllUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  const sendConnectionRequest = async (receiverId: string) => {
    if (!currentUser) return;
    try {
      await api.post("/connections/request", { receiverId });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to send request", error);
    }
  };

  const handleConnectionRequest = async (
    requestId: string,
    newStatus: "accepted" | "declined",
  ) => {
    try {
      if (newStatus === "accepted") {
        await api.put(`/connections/${requestId}/accept`);
        // Refresh current user to update connections list locally
        const meRes = await api.get("/users/me");
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
      setConnectionRequests((prev) => prev.filter((r) => r.id !== requestId));
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

  const handleSubmitRating = async (
    sessionId: string,
    stars: number,
    feedback: string,
  ) => {
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
      const msgs = await api.get("/chat/");
      // Ensure dates are Date objects
      const parsedMsgs = msgs.map((m: any) => ({
        ...m,
        timestamp: parseAsUTC(m.timestamp),
        id: m._id || m.id,
        session: m.session
          ? {
              ...m.session,
              scheduledTime: parseAsUTC(m.session.scheduledTime),
            }
          : undefined,
      }));
      setMessages(parsedMsgs);
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMessages();

      // --- WebSocket with reconnection, heartbeat, and signal dedup ---
      let reconnectAttempts = 0;
      const MAX_RECONNECT_DELAY = 16000;
      let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
      let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
      let intentionallyClosed = false;

      // Signal deduplication — track recently processed signal IDs
      const processedSignalIds = new Set<string>();
      const MAX_SIGNAL_CACHE = 500;

      function isSignalDuplicate(signalId: string): boolean {
        if (!signalId) return false;
        if (processedSignalIds.has(signalId)) return true;
        processedSignalIds.add(signalId);
        if (processedSignalIds.size > MAX_SIGNAL_CACHE) {
          const toKeep = Array.from(processedSignalIds).slice(-400);
          processedSignalIds.clear();
          toKeep.forEach((id) => processedSignalIds.add(id));
        }
        return false;
      }

      // Signal queue for messages sent before WS is open
      const signalQueue: CustomEvent[] = [];

      const handleWebRTCSend = (e: CustomEvent) => {
        const payload = {
          receiverId: e.detail.target,
          text: JSON.stringify(e.detail),
          messageType: "signal",
        };

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(payload));
        } else {
          console.warn("WS not ready to send signal, queuing...");
          signalQueue.push(e);
        }
      };

      function connectWebSocket() {
        if (intentionallyClosed) return;

        const socketUrl = getWebSocketUrl(`chat/ws/${currentUser!.id}`);
        const socket = new WebSocket(socketUrl);
        ws.current = socket;

        socket.onopen = () => {
          console.log("WebSocket connected for user:", currentUser!.id);
          reconnectAttempts = 0;

          // Flush queued signals
          while (signalQueue.length) {
            const e = signalQueue.shift();
            if (e) {
              const payload = {
                receiverId: e.detail.target,
                text: JSON.stringify(e.detail),
                messageType: "signal",
              };
              socket.send(JSON.stringify(payload));
            }
          }

          // Start heartbeat (respond to server pings, send our own pongs pre-emptively)
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          heartbeatInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "pong" }));
            }
          }, 25000);

          // Signal that transport is ready
          (window as any).SKILLSWAP_SIGNAL_READY = true;
          window.dispatchEvent(new CustomEvent("skillswap-signal-ready"));
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);

          // Handle server heartbeat ping
          if (data.type === "ping") {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "pong" }));
            }
            return;
          }

          // Handle WebRTC Signals
          if (data.messageType === "signal") {
            if (data.text) {
              try {
                const signalPayload = JSON.parse(data.text);

                // Deduplicate signals
                if (
                  signalPayload.signalId &&
                  isSignalDuplicate(signalPayload.signalId)
                ) {
                  return;
                }

                window.dispatchEvent(
                  new CustomEvent("webrtc-signal", { detail: signalPayload }),
                );
              } catch (e) {
                console.error("Failed to parse signal payload", e);
              }
            }
            return;
          }

          console.log("WS Received:", data);

          // Parse session data if present
          const sessionData = data.session
            ? {
                ...data.session,
                id: data.session._id || data.session.id,
                scheduledTime: parseAsUTC(data.session.scheduledTime),
                startedAt: data.session.startedAt
                  ? parseAsUTC(data.session.startedAt)
                  : undefined,
              }
            : undefined;

          const parsedMessage: Message = {
            ...data,
            timestamp: parseAsUTC(data.timestamp),
            id: data._id || data.id,
            session: sessionData,
            isRead: data.isRead ?? false,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === parsedMessage.id)) return prev;
            return [...prev, parsedMessage];
          });

          if (
            parsedMessage.session ||
            parsedMessage.messageType === "session_card"
          ) {
            fetchData();
          }
        };

        socket.onclose = (event) => {
          console.log("WebSocket Disconnected", event.code, event.reason);
          (window as any).SKILLSWAP_SIGNAL_READY = false;

          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }

          // Auto-reconnect with exponential backoff (unless intentionally closed)
          if (!intentionallyClosed) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts),
              MAX_RECONNECT_DELAY,
            );
            reconnectAttempts++;
            console.log(
              `WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttempts})`,
            );
            reconnectTimeout = setTimeout(connectWebSocket, delay);
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      }

      // Start connection
      connectWebSocket();

      window.addEventListener(
        "send-webrtc-signal",
        handleWebRTCSend as EventListener,
      );

      return () => {
        intentionallyClosed = true;
        (window as any).SKILLSWAP_SIGNAL_READY = false;
        window.removeEventListener(
          "send-webrtc-signal",
          handleWebRTCSend as EventListener,
        );
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [currentUser?.id]);

  const handleSendMessage = async (text: string, receiverId: string) => {
    if (!currentUser || !ws.current || ws.current.readyState !== WebSocket.OPEN)
      return;

    const payload = {
      receiverId,
      text,
      messageType: "text",
    };
    ws.current.send(JSON.stringify(payload));
  };

  const handleProposeSession = async (
    teacher: User,
    skill: Skill,
    time: Date,
    duration: number,
  ) => {
    if (!currentUser) return;
    try {
      const newSession = await api.post("/sessions/", {
        studentId: currentUser.id,
        teacherId: teacher.id,
        skill: skill,
        scheduledTime: time,
        duration: duration,
        cost: 1,
      });

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const payload = {
          receiverId: teacher.id,
          text: `Proposed a session: ${skill.name} (${duration} mins)`,
          messageType: "session_card",
          session: { ...newSession, id: newSession._id || newSession.id },
        };
        ws.current.send(JSON.stringify(payload));
      }

      fetchData();
      setIsScheduling(false);
    } catch (error) {
      console.error("Failed to propose session", error);
    }
  };

  const handleSessionResponse = async (
    sessionId: string,
    response: "accepted" | "declined",
  ) => {
    try {
      if (response === "accepted") {
        const updatedSession = await api.put(`/sessions/${sessionId}/accept`);

        // Notify via WebSocket
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          const payload = {
            receiverId:
              updatedSession.studentId === currentUser?.id
                ? updatedSession.teacherId
                : updatedSession.studentId,
            text: `Accepted session request!`,
            messageType: "text",
            session: updatedSession,
          };
          ws.current.send(JSON.stringify(payload));
        }
      } else {
        await api.put(`/sessions/${sessionId}/decline`);
      }
      fetchData();
    } catch (error) {
      console.error("Failed to respond to session", error);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await api.put(`/sessions/${sessionId}/complete`);
      const meRes = await api.get("/users/me");
      if (meRes) {
        updateUser({ ...meRes, id: meRes._id || meRes.id });
      }
      fetchData();

      const justCompletedSession = sessions.find((s) => s.id === sessionId);
      if (justCompletedSession) {
        setSessionToRate(justCompletedSession);
      }
    } catch (error) {
      console.error("Failed to complete session", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  const handleEmailLogin = async (
    emailOrUsername: string,
    password: string,
  ) => {
    try {
      await loginWithEmail(emailOrUsername, password);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleEmailSignup = async (
    email: string,
    password: string,
    username: string,
  ) => {
    try {
      await signupWithEmail(email, password, username);
    } catch (error) {
      console.error("Signup Failed:", error);
    }
  };

  const handleMarkAsRead = async (partnerId: string) => {
    if (!currentUser) return;
    try {
      await api.put(`/chat/${partnerId}/read`);
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === partnerId && m.receiverId === currentUser.id
            ? { ...m, isRead: true }
            : m,
        ),
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleClearChat = async (partnerId: string) => {
    if (!currentUser) return;
    try {
      await api.delete(`/chat/${partnerId}`);
      setMessages((prev) =>
        prev.filter(
          (m) =>
            !(
              (m.senderId === currentUser.id && m.receiverId === partnerId) ||
              (m.senderId === partnerId && m.receiverId === currentUser.id)
            ),
        ),
      );
    } catch (error) {
      console.error("Failed to clear chat", error);
    }
  };

  const targetUserForRating = sessionToRate
    ? allUsers.find(
        (u) =>
          u.id ===
          (sessionToRate.studentId === currentUser?.id
            ? sessionToRate.teacherId
            : sessionToRate.studentId),
      )
    : null;

  const pendingRequestsCount = currentUser
    ? connectionRequests.filter(
        (r) => r.receiverId === currentUser.id && r.status === "pending",
      ).length
    : 0;

  const unreadMessagesCount = currentUser
    ? messages.filter((m) => m.receiverId === currentUser.id && !m.isRead)
        .length
    : 0;

  const userNavItems = [
    {
      id: "dashboard",
      path: "/",
      label: "Dashboard",
      icon: HomeIcon,
      count: 0,
    },
    {
      id: "matches",
      path: "/matches",
      label: "Discover",
      icon: MagnifyingGlassIcon,
      count: 0,
    },
    {
      id: "notifications",
      path: "/notifications",
      label: "Notifications",
      icon: BellIcon,
      count: pendingRequestsCount,
    },
    {
      id: "chat",
      path: "/chat",
      label: "Chat",
      icon: ChatBubbleLeftRightIcon,
      count: unreadMessagesCount,
    },
    {
      id: "coach",
      path: "/coach",
      label: "AI Coach",
      icon: SparklesIcon,
      count: 0,
    },
  ];

  const adminNavItems = [
    {
      id: "admin",
      path: "/admin",
      label: "Admin Panel",
      icon: ShieldCheckIcon,
      count: 0,
    },
  ];

  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        <div className="w-full min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
          <NavigationWrapper
            setActiveChatPartner={setActiveChatPartner}
            setActiveSession={setActiveSession}
            setViewingProfile={setViewingProfile}
          >
            {(navProps: any) => (
              <Routes>
                {/* Public Marketing Routes */}
                <Route
                  path="/"
                  element={
                    currentUser ? (
                      isAdmin ? (
                        <Navigate to="/admin" replace />
                      ) : (
                        <Layout
                          currentUser={currentUser}
                          isAdmin={isAdmin}
                          logout={logout}
                          theme={theme}
                          toggleTheme={toggleTheme}
                          navItems={userNavItems}
                        >
                          <DashboardPage
                            sessions={sessions}
                            ratings={ratings}
                            users={allUsers.filter((u) => !u.isAdmin)}
                            openRatingModal={handleOpenRatingModal}
                            completeSession={handleCompleteSession}
                            startLiveSession={navProps.startLiveSessionWithNav}
                            currentUser={currentUser}
                            sendConnectionRequest={sendConnectionRequest}
                            connectionRequests={connectionRequests}
                            startChat={navProps.startChatWithNav}
                            onCategorySelect={(cat) => {
                              setCategoryFilter(cat);
                              navProps.navigate("/matches");
                            }}
                          />
                        </Layout>
                      )
                    ) : (
                      <LandingPage
                        onGetStarted={() => navProps.navigate("/login")}
                      />
                    )
                  }
                />
                <Route
                  path="/roadmap"
                  element={
                    <Layout
                      currentUser={currentUser || undefined}
                      isAdmin={isAdmin}
                      logout={logout}
                      theme={theme}
                      toggleTheme={toggleTheme}
                      navItems={
                        currentUser
                          ? isAdmin
                            ? adminNavItems
                            : userNavItems
                          : []
                      }
                    >
                      <RoadmapPage />
                    </Layout>
                  }
                />
                <Route
                  path="/blog"
                  element={
                    <Layout
                      currentUser={currentUser || undefined}
                      isAdmin={isAdmin}
                      logout={logout}
                      theme={theme}
                      toggleTheme={toggleTheme}
                      navItems={
                        currentUser
                          ? isAdmin
                            ? adminNavItems
                            : userNavItems
                          : []
                      }
                    >
                      <BlogPage />
                    </Layout>
                  }
                />
                <Route
                  path="/blog/:slug"
                  element={
                    <Layout
                      currentUser={currentUser || undefined}
                      isAdmin={isAdmin}
                      logout={logout}
                      theme={theme}
                      toggleTheme={toggleTheme}
                      navItems={
                        currentUser
                          ? isAdmin
                            ? adminNavItems
                            : userNavItems
                          : []
                      }
                    >
                      <BlogPostPage />
                    </Layout>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <Layout
                      currentUser={currentUser || undefined}
                      isAdmin={isAdmin}
                      logout={logout}
                      theme={theme}
                      toggleTheme={toggleTheme}
                      navItems={
                        currentUser
                          ? isAdmin
                            ? adminNavItems
                            : userNavItems
                          : []
                      }
                    >
                      <CommunityPage />
                    </Layout>
                  }
                />

                <Route
                  path="/login"
                  element={
                    currentUser ? (
                      <Navigate to="/" replace />
                    ) : (
                      <LoginPage
                        onGoogleLogin={handleGoogleLogin}
                        onEmailLogin={handleEmailLogin}
                        onSignup={handleEmailSignup}
                      />
                    )
                  }
                />

                {/* Protected Application Routes */}
                <Route
                  path="/matches"
                  element={
                    currentUser ? (
                      <Layout
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                        logout={logout}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        navItems={isAdmin ? adminNavItems : userNavItems}
                      >
                        <MatchesPage
                          currentUser={currentUser}
                          users={allUsers.filter(
                            (u) => u.id !== currentUser.id && !u.isAdmin,
                          )}
                          allUsers={allUsers}
                          startChat={navProps.startChatWithNav}
                          connectionRequests={connectionRequests}
                          sendConnectionRequest={sendConnectionRequest}
                          categoryFilter={categoryFilter}
                          setCategoryFilter={setCategoryFilter}
                          handleRequest={handleConnectionRequest}
                        />
                      </Layout>
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    currentUser ? (
                      <Layout
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                        logout={logout}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        navItems={isAdmin ? adminNavItems : userNavItems}
                      >
                        <NotificationsPage
                          requests={connectionRequests}
                          handleRequest={handleConnectionRequest}
                          cancelRequest={cancelConnectionRequest}
                          users={allUsers}
                          currentUserId={currentUser.id}
                          viewUserProfile={navProps.viewProfileWithNav}
                        />
                      </Layout>
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/chat"
                  element={
                    currentUser ? (
                      <Layout
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                        logout={logout}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        navItems={isAdmin ? adminNavItems : userNavItems}
                      >
                        <ChatPage
                          currentUser={currentUser}
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
                            if (page === "dashboard") navProps.navigate("/");
                          }}
                          onOpenCoach={() => navProps.navigate("/coach")}
                        />
                      </Layout>
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/session/:sessionId"
                  element={
                    currentUser ? (
                      activeSession ? (
                        <LiveSessionPage
                          session={activeSession}
                          currentUser={currentUser}
                          otherUser={
                            allUsers.find(
                              (u) =>
                                u.id ===
                                (activeSession.studentId === currentUser.id
                                  ? activeSession.teacherId
                                  : activeSession.studentId),
                            )!
                          }
                          onEndSession={async () => {
                            await handleCompleteSession(activeSession.id);
                            setActiveSession(null);
                            navProps.navigate("/");
                          }}
                        />
                      ) : (
                        <Navigate to="/" />
                      )
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/coach"
                  element={
                    currentUser ? (
                      <Layout
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                        logout={logout}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        navItems={isAdmin ? adminNavItems : userNavItems}
                      >
                        <CoachPage />
                      </Layout>
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/profile"
                  element={
                    currentUser ? (
                      <Layout
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                        logout={logout}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        navItems={isAdmin ? adminNavItems : userNavItems}
                      >
                        <ProfilePage
                          ratings={ratings}
                          users={allUsers}
                          tokenTransactions={tokenTransactions}
                          allSkills={allSkills}
                          addNewSkill={addNewSkill}
                          openEditModal={() => setIsEditingProfile(true)}
                        />
                      </Layout>
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/user/:userId"
                  element={
                    currentUser ? (
                      <Layout
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                        logout={logout}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        navItems={isAdmin ? adminNavItems : userNavItems}
                      >
                        {viewingProfile ? (
                          <UserProfilePage
                            user={viewingProfile}
                            goBack={() => navProps.navigate(-1)}
                            ratings={ratings}
                            users={allUsers}
                          />
                        ) : (
                          <Navigate to="/" />
                        )}
                      </Layout>
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/admin"
                  element={
                    currentUser && isAdmin ? (
                      <Layout
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                        logout={logout}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        navItems={adminNavItems}
                      >
                        <AdminDashboardPage />
                      </Layout>
                    ) : (
                      <Navigate to="/" replace />
                    )
                  }
                />

                <Route
                  path="/privacy-policy"
                  element={
                    <Layout
                      currentUser={currentUser || undefined}
                      isAdmin={isAdmin}
                      logout={logout}
                      theme={theme}
                      toggleTheme={toggleTheme}
                      navItems={
                        currentUser
                          ? isAdmin
                            ? adminNavItems
                            : userNavItems
                          : []
                      }
                    >
                      <PrivacyPolicyPage />
                    </Layout>
                  }
                />
                <Route
                  path="/cookie-policy"
                  element={
                    <Layout
                      currentUser={currentUser || undefined}
                      isAdmin={isAdmin}
                      logout={logout}
                      theme={theme}
                      toggleTheme={toggleTheme}
                      navItems={
                        currentUser
                          ? isAdmin
                            ? adminNavItems
                            : userNavItems
                          : []
                      }
                    >
                      <CookiePolicyPage />
                    </Layout>
                  }
                />
                <Route
                  path="/terms-of-service"
                  element={
                    <Layout
                      currentUser={currentUser || undefined}
                      isAdmin={isAdmin}
                      logout={logout}
                      theme={theme}
                      toggleTheme={toggleTheme}
                      navItems={
                        currentUser
                          ? isAdmin
                            ? adminNavItems
                            : userNavItems
                          : []
                      }
                    >
                      <TermsOfServicePage />
                    </Layout>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </NavigationWrapper>

          {sessionToRate && targetUserForRating && (
            <RatingModal
              isOpen={!!sessionToRate}
              onClose={handleCloseRatingModal}
              session={sessionToRate}
              targetUser={targetUserForRating}
              onSubmit={handleSubmitRating}
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
              currentUser={currentUser!}
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
      </ErrorBoundary>
    </Router>
  );
};

export default App;
