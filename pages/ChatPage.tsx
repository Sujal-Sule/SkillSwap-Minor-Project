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
  MicrophoneIcon,
  SparklesIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
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

    return (
      <div className="my-2 p-4 bg-surface rounded-2xl max-w-sm border border-border shadow-sm">
        <h4 className="font-bold text-text-primary">
          {isPending ? "Session Proposed!" : "Session Scheduled"}
        </h4>
        <p className="text-sm text-text-muted mt-2">
          {isProposer
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

        {!isProposer && isPending && (
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
        {session.status === "scheduled" && (
          <div className="mt-4 text-center">
            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full border border-emerald-500/20">
              Accepted & Scheduled
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
    <div className="h-[calc(100vh-7rem)] w-full bg-background text-text-primary flex font-sans">
      {/* Left Panel: Conversation List */}
      <aside className="w-80 flex-shrink-0 bg-surface border-r border-border flex flex-col">
        <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-text-primary">
                {currentUser.name}
              </h2>
              <p className="text-xs text-emerald-500">Online</p>
            </div>
          </div>
          <button className="text-text-muted hover:text-text-primary">
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-4 flex-shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search for users or conversations"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-text-primary placeholder-text-muted border border-border"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {filteredConversations.map(({ user, lastMessage, unreadCount }) => (
              <li key={user.id}>
                <button
                  onClick={() => setActiveChatPartner(user)}
                  className={`w-full flex items-center gap-4 p-5 text-left transition-all duration-200 
                    ${
                      activeChatPartner?.id === user.id
                        ? "bg-surface-highlight border-l-4 border-sky-500 shadow-sm"
                        : "hover:bg-surface-hover hover:-translate-y-0.5"
                    }`}
                >
                  <div className="relative">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <p
                        className={`font-semibold truncate ${activeChatPartner?.id === user.id ? "text-sky-600 dark:text-sky-400" : "text-text-primary"}`}
                      >
                        {user.name}
                      </p>
                      <p className="text-xs text-text-muted flex-shrink-0 ml-2">
                        {lastMessage
                          ? formatRelativeTime(lastMessage.timestamp)
                          : "New"}
                      </p>
                    </div>
                    <div className="flex justify-between items-start mt-1">
                      <p
                        className={`text-sm truncate pr-2 ${unreadCount > 0 ? "text-text-primary font-medium" : "text-text-muted"}`}
                      >
                        {lastMessage
                          ? lastMessage.text
                          : "Start a conversation"}
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
      <main className="flex-1 flex flex-col bg-background/50">
        {activeChatPartner ? (
          <>
            <header className="p-5 border-b border-border flex justify-between items-center flex-shrink-0 bg-surface/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={activeChatPartner.avatarUrl}
                    alt={activeChatPartner.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {activeChatPartner.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full"></span>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary text-lg">
                    {activeChatPartner.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-emerald-500">Online</p>
                    {/* Shared skills tags */}
                    {activeChatPartner.skills?.slice(0, 2).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs bg-sky-500/10 text-sky-500 rounded border border-sky-500/20"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 relative">
                {/* Removed VideoCameraIcon */}
                <button
                  className="text-text-muted hover:text-text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                >
                  <EllipsisVerticalIcon className="w-6 h-6" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-surface border border-border rounded-md shadow-lg py-1 z-50">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-surface-hover"
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
              session={
                sessions.find(
                  (s) =>
                    (s.proposerId === currentUser.id &&
                      s.partnerId === activeChatPartner.id) ||
                    (s.partnerId === currentUser.id &&
                      s.proposerId === activeChatPartner.id),
                ) || null
              }
              partnerName={activeChatPartner.name}
              onProposeSession={openSchedulingModal}
            />
            {/* ... rest of render (messages map) can stay similar, just updated ... */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeConversationMessages.map((msg) => {
                const isSender = msg.senderId === currentUser.id;
                if (msg.messageType === "ai_suggestion") {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <button className="flex items-center gap-2 px-4 py-2 text-sm bg-surface-highlight border border-border rounded-full text-sky-500 hover:bg-surface-hover transition-colors shadow-sm">
                        <SparklesIcon className="w-4 h-4" />
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
                    className={`flex items-end gap-3 ${isSender ? "justify-end" : ""}`}
                  >
                    {!isSender && (
                      <img
                        src={activeChatPartner.avatarUrl}
                        alt={activeChatPartner.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div
                      className={`max-w-md px-5 py-3 rounded-2xl shadow-sm border ${
                        isSender
                          ? "bg-sky-500 text-white rounded-br-none border-sky-600"
                          : "bg-surface text-text-primary rounded-bl-none border-border"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 border-t border-border bg-surface/80 backdrop-blur-md shadow-lg flex-shrink-0">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-4"
              >
                <button
                  type="button"
                  className="p-2.5 text-text-muted hover:text-text-primary transition-colors"
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-background border border-border rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow text-text-primary placeholder-text-muted"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-sky-600 text-white rounded-full hover:bg-sky-700 disabled:bg-sky-800 disabled:opacity-50 shadow-md transition-colors"
                  disabled={!newMessage.trim()}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="max-w-md">
              <ChatBubbleLeftRightIcon className="w-20 h-20 text-slate-700 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-slate-300 mb-2">
                Choose a learning partner
              </h2>
              <p className="text-slate-400 mb-6">
                Select a conversation to coordinate sessions and share knowledge
              </p>
              <p className="text-sm text-slate-500 mb-3">
                Got some confusion? Ask the AI
              </p>
              <button
                onClick={onOpenCoach}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                Chat with AI
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
