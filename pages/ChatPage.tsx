import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";
import { motion } from "framer-motion";
import type { User, Message, Session } from "../types";
// FIX: Imported `ChatBubbleLeftRightIcon` to resolve usage error.
import {
  PaperAirplaneIcon,
  AcademicCapIcon,
  SparklesIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from "../components/icons";
import SessionContextBanner from "../components/SessionContextBanner";

interface ChatPageProps {
  currentUser: User;
  allUsers: User[];
  activeChatPartner: User | null;
  setActiveChatPartner: (user: User | null) => void;
  messages: Message[];
  sessions: Session[];
  sendMessage: (text: string, receiverId: string) => void;
  openSchedulingModal: () => void;
  handleSessionResponse: (
    sessionId: string,
    response: "accepted" | "declined",
  ) => void;
  setCurrentPage: (page: string) => void;
  markAsRead: (partnerId: string) => void;
  clearChat: (partnerId: string) => void;
  onOpenCoach: () => void;
}

const formatRelativeTime = (date: Date) => {
  // Ensure date is valid
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Recently";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If future date or invalid, fallback
  if (diffMs < 0) {
    return "Just now";
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return seconds === 1 ? "1s ago" : `${seconds}s ago`;
  if (minutes < 60) return minutes === 1 ? "1m ago" : `${minutes}m ago`;
  if (hours < 24) return hours === 1 ? "1h ago" : `${hours}h ago`;
  if (days < 7) return days === 1 ? "1d ago" : `${days}d ago`;
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
  clearChat,
  onOpenCoach,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMenu, setShowMenu] = useState(false); // For three dots menu
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const conversations = useMemo(() => {
    const convos: {
      [key: string]: {
        user: User;
        lastMessage: Message | null;
        unreadCount: number;
      };
    } = {};

    // 1. Add all connections first
    currentUser.connections.forEach((connId) => {
      const partner = allUsers.find((u) => u.id === connId);
      if (partner) {
        convos[connId] = {
          user: partner,
          lastMessage: null,
          unreadCount: 0,
        };
      }
    });

    // 2. Update with actual messages
    messages.forEach((msg) => {
      const partnerId =
        msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      if (partnerId === currentUser.id) return;

      if (!convos[partnerId]) {
        const partner = allUsers.find((u) => u.id === partnerId);
        if (partner)
          convos[partnerId] = {
            user: partner,
            lastMessage: msg,
            unreadCount: 0,
          };
        else return;
      }

      const current = convos[partnerId];
      if (
        !current.lastMessage ||
        msg.timestamp > current.lastMessage.timestamp
      ) {
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

  const filteredConversations = conversations.filter((convo) =>
    convo.user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeConversationMessages = messages.filter(
    (msg) =>
      (msg.senderId === currentUser.id &&
        msg.receiverId === activeChatPartner?.id) ||
      (msg.senderId === activeChatPartner?.id &&
        msg.receiverId === currentUser.id),
  );

  // Mark as read when active chat changes or new messages arrive
  useEffect(() => {
    if (activeChatPartner) {
      // Check if there are any unread messages from this partner
      const hasUnread = activeConversationMessages.some(
        (m) => m.senderId === activeChatPartner.id && !m.isRead,
      );
      if (hasUnread) {
        markAsRead(activeChatPartner.id);
      }
    }
  }, [activeChatPartner, activeConversationMessages, markAsRead]);

  // Close menu when clicking outside (simple fake implementation or just toggle)
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [activeConversationMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !activeChatPartner) return;
    sendMessage(newMessage, activeChatPartner.id);
    setNewMessage("");
  };

  // ... renderSessionCard logic is same ...
  const renderSessionCard = (session: Session) => {
    const isProposer = session.proposerId === currentUser.id;
    const isPending = session.status === "proposed";
    const isExpired = new Date().getTime() > new Date(session.scheduledTime).getTime();

    return (
      <div className="my-2 p-4 bg-surface rounded-2xl max-w-sm border border-border shadow-sm">
        <h4 className="font-bold text-text-primary">
          {isPending
            ? isExpired
              ? "Session Proposed (Expired)"
              : "Session Proposed!"
            : isExpired
              ? "Session Scheduled (Passed)"
              : "Session Scheduled"}
        </h4>
        <p className="text-sm text-text-muted mt-2">
          {isPending && isExpired
            ? "This session proposal has expired."
            : isProposer
              ? `You proposed this session. Waiting for response.`
              : `Proposed a session with you.`}
        </p>
        <div className="mt-3 pt-3 border-t border-border space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Skill:</span>
            <span className="font-medium text-text-primary">
              {session.skill.name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Duration:</span>
            <span className="font-medium text-text-primary">
              {session.duration} minutes
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Date:</span>
            <span className="font-medium text-text-primary">
              {new Date(session.scheduledTime).toLocaleString([], {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        {!isProposer && isPending && !isExpired && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleSessionResponse(session.id, "accepted")}
              className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Accept
            </button>
            <button
              onClick={() => handleSessionResponse(session.id, "declined")}
              className="flex-1 px-3 py-2 bg-surface-highlight text-text-primary text-sm font-semibold rounded-lg hover:bg-surface-hover border border-border transition-colors"
            >
              Decline
            </button>
          </div>
        )}
        {isPending && isExpired && (
          <div className="mt-4 text-center">
            <span className="inline-block px-3 py-1 bg-slate-500/10 text-slate-500 text-xs font-semibold rounded-full border border-slate-500/20">
              Expired
            </span>
          </div>
        )}
        {session.status === "scheduled" && (
          <div className="mt-4 text-center">
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${
              isExpired
                ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}>
              {isExpired ? "Passed" : "Accepted & Scheduled"}
            </span>
          </div>
        )}
        {session.status === "declined" && (
          <div className="mt-4 text-center">
            <span className="inline-block px-3 py-1 bg-red-500/10 text-red-500 text-xs font-semibold rounded-full border border-red-500/20">
              Session Declined
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-[#e8edf2] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 flex pt-28 pb-6 px-6 font-sans">
      {/* Unified Chat Workspace Container */}
      <div className="flex-1 flex bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/20 dark:border-slate-800/10 rounded-[32px] shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.02)] overflow-hidden">
        
        {/* Left Panel: Conversation List */}
        <aside className="w-80 flex-shrink-0 border-r border-slate-200/30 dark:border-slate-800/40 flex flex-col bg-[#e8edf2]/30 dark:bg-[#121a2e]/30">
          <header className="p-5 border-b border-slate-200/30 dark:border-slate-800/40 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
              />
              <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {currentUser.name}
                </h2>
                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Online</p>
              </div>
            </div>
            <button className="p-2 bg-[#e8edf2] dark:bg-[#121a2e] rounded-xl hover:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.45),_inset_-2px_-2px_4px_rgba(255,255,255,0.02)] text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-shadow">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </header>
          
          <div className="p-4 flex-shrink-0">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search for users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#e8edf2] dark:bg-[#121a2e] rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200/30 dark:border-slate-800/20 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.25),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),_inset_-2px_-2px_5px_rgba(255,255,255,0.01)]"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
            <ul className="space-y-2">
              {filteredConversations.map(({ user, lastMessage, unreadCount }) => (
                <li key={user.id}>
                  <button
                    onClick={() => setActiveChatPartner(user)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 
                      ${
                        activeChatPartner?.id === user.id
                          ? "bg-gradient-to-r from-sky-500/5 to-indigo-500/5 border-l-4 border-sky-500 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.25),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35),_inset_-2px_-2px_5px_rgba(255,255,255,0.01)] text-slate-800 dark:text-slate-100"
                          : "hover:bg-slate-200/30 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200/40 dark:border-slate-800/40"
                      />
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#e8edf2] dark:border-[#121a2e] rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <p
                          className={`font-semibold text-xs sm:text-sm truncate ${
                            activeChatPartner?.id === user.id
                              ? "text-sky-600 dark:text-sky-400"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">
                          {lastMessage
                            ? formatRelativeTime(lastMessage.timestamp)
                            : "New"}
                        </p>
                      </div>
                      <div className="flex justify-between items-start mt-1">
                        <p
                          className={`text-xs truncate pr-2 ${
                            unreadCount > 0
                              ? "text-slate-900 dark:text-slate-100 font-bold"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {lastMessage
                            ? lastMessage.text
                            : "Start a conversation"}
                        </p>
                        {unreadCount > 0 && (
                          <span className="flex-shrink-0 min-w-[18px] h-4.5 px-1 bg-gradient-to-tr from-sky-500 to-indigo-500 text-white text-[9px] rounded-full flex items-center justify-center font-black">
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

        {/* Right Panel: Active Chat / Empty State */}
        <main className="flex-1 flex flex-col bg-[#e8edf2]/10 dark:bg-[#121a2e]/10">
          {activeChatPartner ? (
            <>
              <header className="p-5 border-b border-slate-200/30 dark:border-slate-800/40 flex justify-between items-center flex-shrink-0 bg-[#e8edf2]/50 dark:bg-[#121a2e]/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={activeChatPartner.avatarUrl}
                      alt={activeChatPartner.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200/40 dark:border-slate-800/40"
                    />
                    {activeChatPartner.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#e8edf2] dark:border-[#121a2e] rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                      {activeChatPartner.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Online</p>
                      {/* Shared skills tags */}
                      {activeChatPartner.teaches?.slice(0, 2).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[9px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full border border-sky-500/25"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative">
                  <button
                    onClick={openSchedulingModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[2px_2px_5px_rgba(14,165,233,0.2)] hover:shadow-sky-500/30 active:scale-95"
                  >
                    <ClockIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Propose Session</span>
                  </button>
                  <button
                    className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-12 w-48 bg-[#e8edf2] dark:bg-[#1e293b] border border-slate-200/30 dark:border-slate-800/30 rounded-xl shadow-lg py-1.5 z-50">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 font-semibold border-b border-slate-200/10 dark:border-slate-800/10"
                        onClick={() => {
                          openSchedulingModal();
                          setShowMenu(false);
                        }}
                      >
                        Propose Session
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 font-semibold"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to clear this chat? This cannot be undone.",
                            )
                          ) {
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

              {/* Session Context Banner */}
              <SessionContextBanner
                session={(() => {
                  const chatSessions = sessions.filter(
                    (s) =>
                      (s.studentId === currentUser.id && s.teacherId === activeChatPartner.id) ||
                      (s.studentId === activeChatPartner.id && s.teacherId === currentUser.id) ||
                      (s.proposerId === currentUser.id && s.teacherId === activeChatPartner.id) ||
                      (s.proposerId === activeChatPartner.id && s.teacherId === currentUser.id)
                  );
                  
                  // Find first active (not expired) session
                  const active = chatSessions.find((s) => {
                    const isExpired = new Date().getTime() > new Date(s.scheduledTime).getTime();
                    return !isExpired && (s.status === "proposed" || s.status === "scheduled" || s.status === "active");
                  });

                  // Fallback to the latest session
                  return active || [...chatSessions].sort(
                    (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
                  )[0] || null;
                })()}
                partnerName={activeChatPartner.name}
                onProposeSession={openSchedulingModal}
              />

              {/* Message Body area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {activeConversationMessages.map((msg) => {
                  const isSender = msg.senderId === currentUser.id;
                  if (msg.messageType === "ai_suggestion") {
                    return (
                      <div key={msg.id} className="flex justify-center animate-fade-in">
                        <button className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-tr from-sky-400/10 to-purple-500/10 border border-sky-400/20 rounded-full text-sky-600 dark:text-sky-400 hover:opacity-95 transition-all shadow-[2px_2px_6px_rgba(163,177,198,0.25),_-2px_-2px_6px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.35),_-2px_-2px_6px_rgba(255,255,255,0.01)]">
                          <SparklesIcon className="w-4 h-4 text-sky-500" />
                          <span>{msg.text}</span>
                        </button>
                      </div>
                    );
                  }
                  if (msg.messageType === "session_card" && msg.session) {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        {renderSessionCard(msg.session)}
                      </div>
                    );
                  }
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-end gap-3.5 ${isSender ? "justify-end" : "justify-start"}`}
                    >
                      {!isSender && (
                        <img
                          src={activeChatPartner.avatarUrl}
                          alt={activeChatPartner.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200/30 dark:border-slate-800/30"
                        />
                      )}
                      <div
                        className={`max-w-md px-5 py-3.5 rounded-[22px] border ${
                          isSender
                            ? "bg-gradient-to-tr from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10 border-sky-400/30 dark:border-sky-500/20 text-slate-850 dark:text-slate-100 rounded-br-none shadow-[3px_3px_8px_rgba(163,177,198,0.3),_-3px_-3px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.03)]"
                            : "bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/20 dark:border-slate-800/10 text-slate-900 dark:text-slate-100 rounded-bl-none shadow-[3px_3px_8px_rgba(163,177,198,0.35),_-3px_-3px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.02)]"
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar container */}
              <div className="p-5 border-t border-slate-200/30 dark:border-slate-800/40 bg-[#e8edf2]/50 dark:bg-[#121a2e]/50 backdrop-blur-sm flex-shrink-0">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-4"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#e8edf2] dark:bg-[#121a2e] rounded-2xl px-5 py-3.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200/30 dark:border-slate-800/20 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.25),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35),_inset_-2px_-2px_5px_rgba(255,255,255,0.01)]"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    className="p-3.5 bg-gradient-to-tr from-sky-500 to-indigo-600 text-white rounded-full hover:opacity-95 disabled:opacity-50 shadow-[3px_3px_8px_rgba(163,177,198,0.35),_-3px_-3px_8px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.02)] transition-opacity"
                    disabled={!newMessage.trim()}
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div className="max-w-md animate-fade-in p-8 rounded-[32px] bg-[#e8edf2]/30 dark:bg-[#121a2e]/30 border border-slate-200/20 dark:border-slate-800/10 shadow-[inset_3px_3px_8px_rgba(163,177,198,0.25),_inset_-3px_-3px_8px_rgba(255,255,255,0.65)] dark:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.35),_inset_-3px_-3px_8px_rgba(255,255,255,0.01)]">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-sky-500/80 mx-auto mb-4" />
                <h2 className="text-xl font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                  Choose a learning partner
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
                  Select a conversation to coordinate sessions and share knowledge
                </p>
                <div className="w-full h-px bg-slate-200/50 dark:bg-slate-800/50 my-5" />
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3.5 uppercase tracking-wider">
                  Got some confusion? Ask the AI
                </p>
                <button
                  onClick={onOpenCoach}
                  className="px-6 py-3 bg-gradient-to-tr from-sky-500 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-[4px_4px_12px_rgba(163,177,198,0.35),_-4px_-4px_12px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_12px_rgba(0,0,0,0.45),_-4px_-4px_12px_rgba(255,255,255,0.02)]"
                >
                  Chat with AI
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
