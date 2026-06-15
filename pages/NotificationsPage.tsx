import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User, ConnectionRequest, Notification } from "../types";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { api } from "../services/api";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  InboxIcon,
  PaperAirplaneIcon,
  BellIcon,
  CalendarIcon,
} from "../components/icons";

interface NotificationsPageProps {
  requests: ConnectionRequest[];
  handleRequest: (requestId: string, status: "accepted" | "declined") => void;
  cancelRequest: (requestId: string) => void;
  users: User[];
  currentUserId: string;
  viewUserProfile: (user: User) => void;
}

type TabType = "incoming" | "sent" | "activity";

const TabButton = ({
  id,
  activeTab,
  setActiveTab,
  label,
  count,
  icon,
}: {
  id: TabType;
  activeTab: TabType;
  setActiveTab: (id: TabType) => void;
  label: string;
  count?: number;
  icon: React.ReactNode;
}) => (
  <motion.button
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold transition-all relative ${
      activeTab === id
        ? "text-sky-600 dark:text-sky-400"
        : "text-text-muted hover:text-text-primary"
    }`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="relative z-10 flex items-center gap-2">
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`ml-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide ${
            activeTab === id
              ? "bg-sky-500 text-white"
              : "bg-slate-300/50 dark:bg-slate-800/50 text-text-muted"
          }`}
        >
          {count}
        </span>
      )}
    </span>
    {activeTab === id && (
      <motion.div
        layoutId="activeNotificationTab"
        className="absolute inset-0 rounded-full bg-[#e8edf2] dark:bg-[#121a2e] border border-white/20 dark:border-white/5 shadow-[3px_3px_8px_rgba(163,177,198,0.35),_-3px_-3px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.02)] z-0"
        transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
      />
    )}
  </motion.button>
);

const NotificationsPage: React.FC<NotificationsPageProps> = ({
  requests,
  handleRequest,
  cancelRequest,
  users,
  currentUserId,
  viewUserProfile,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("incoming");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await api.get("/notifications", { skipCache: true });
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();
  }, [currentUserId]);

  const incoming = requests.filter(
    (r) => r.receiverId === currentUserId && r.status === "pending",
  );
  const outgoing = requests.filter(
    (r) => r.senderId === currentUserId && r.status === "pending",
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "connection_request":
        return <InboxIcon className="w-4 h-4 text-sky-500" />;
      case "connection_accepted":
        return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
      case "session_proposed":
        return <CalendarIcon className="w-4 h-4 text-purple-500" />;
      case "new_match":
        return <BellIcon className="w-4 h-4 text-amber-500" />;
      default:
        return <BellIcon className="w-4 h-4 text-slate-500" />;
    }
  };

  const getUser = (id: string): User | undefined =>
    users.find((u) => u.id === id);

  return (
    <div className="pt-10 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-10 border-b border-slate-200/40 dark:border-slate-800/40 mb-10 text-center md:text-left"
      >
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Notifications
        </h1>
        <p className="text-text-muted text-sm font-bold">
          Stay updated on your connections and requests.
        </p>
      </motion.div>

      {/* Tabs */}
      <LayoutGroup>
        <div className="flex flex-wrap gap-2 mb-10 bg-[#e8edf2] dark:bg-[#121a2e] p-1.5 rounded-full border border-slate-200/10 dark:border-slate-800/10 w-full md:w-fit mx-auto md:mx-0 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.45),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
          <TabButton
            id="incoming"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            label="Incoming"
            count={incoming.length}
            icon={<InboxIcon className="w-4 h-4" />}
          />
          <TabButton
            id="sent"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            label="Sent"
            count={outgoing.length}
            icon={<PaperAirplaneIcon className="w-4 h-4" />}
          />
          <TabButton
            id="activity"
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            label="All Activity"
            icon={<BellIcon className="w-4 h-4" />}
          />
        </div>
      </LayoutGroup>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "incoming" && (
            <div className="space-y-6">
              {incoming.length > 0 ? (
                incoming.map((req) => {
                  const sender = getUser(req.senderId);
                  if (!sender) return null;
                  return (
                    <div
                      key={req.id}
                      className="bg-background rounded-2xl p-5 border border-slate-200/10 dark:border-slate-800/10 shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.03)] hover:scale-[1.01] transition-all flex flex-col md:flex-row items-center gap-6"
                    >
                      <div
                        className="flex items-center gap-4 flex-1 w-full cursor-pointer"
                        onClick={() => viewUserProfile(sender)}
                      >
                        <div className="relative p-0.5 rounded-full bg-[#e8edf2] dark:bg-[#121a2e] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),_inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.45),_inset_-2px_-2px_4px_rgba(255,255,255,0.02)]">
                          <img
                            src={sender.avatarUrl}
                            alt={sender.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-sky-500 text-[9px] px-1.5 py-0.5 rounded-full text-white font-black border border-white dark:border-slate-900 shadow-sm uppercase tracking-wider">
                            New
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-text-primary hover:text-sky-500 transition-colors">
                            {sender.name}
                          </h3>
                          <p className="text-text-muted text-xs font-bold mt-0.5">
                            Wants to connect with you.
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-text-muted bg-slate-200/40 dark:bg-slate-800/40 px-2.5 py-0.5 rounded-full border border-slate-200/10 dark:border-slate-800/10 font-bold uppercase tracking-wider">
                              Application Developer
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                        <button
                          onClick={() => handleRequest(req.id, "accepted")}
                          className="flex-1 md:flex-none px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl shadow-[3px_3px_8px_rgba(14,165,233,0.3),_inset_-2px_-2px_4px_rgba(255,255,255,0.2)] hover:from-sky-400 hover:to-blue-500 transition-all active:scale-95"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequest(req.id, "declined")}
                          className="flex-1 md:flex-none px-6 py-2.5 text-xs font-bold text-text-muted hover:text-rose-500 transition-colors px-4 py-2.5 rounded-xl bg-background shadow-[3px_3px_6px_rgba(163,177,198,0.3),_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.4),_-3px_-3px_6px_rgba(255,255,255,0.02)] border border-slate-200/10 dark:border-slate-800/10 hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_#ffffff] dark:hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),_inset_-2px_-2px_5px_rgba(255,255,255,0.02)] active:scale-95"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-background rounded-3xl border border-slate-300/10 dark:border-slate-800/10 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.45),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)] flex flex-col items-center max-w-2xl mx-auto px-6">
                  <div className="w-16 h-16 bg-[#e8edf2] dark:bg-[#121a2e] rounded-full flex items-center justify-center mb-4 shadow-[3px_3px_8px_rgba(163,177,198,0.35),_-3px_-3px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.02)]">
                    <InboxIcon className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                    No new requests yet
                  </h3>
                  <p className="text-text-muted max-w-sm mx-auto mb-6 text-sm font-bold">
                    When someone wants to learn from you, you'll see it here.
                  </p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-sky-500 font-bold text-sm hover:text-sky-400 transition-colors uppercase tracking-wider"
                  >
                    Update your profile to attract matches →
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div className="space-y-6">
              {outgoing.length > 0 ? (
                outgoing.map((req) => {
                  const receiver = getUser(req.receiverId);
                  if (!receiver) return null;
                  return (
                    <div
                      key={req.id}
                      className="bg-background rounded-2xl p-5 border border-slate-200/10 dark:border-slate-800/10 shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.03)] hover:scale-[1.01] transition-all flex flex-col md:flex-row items-center gap-4 md:justify-between"
                    >
                      <div
                        className="flex items-center gap-4 w-full md:w-auto cursor-pointer"
                        onClick={() => viewUserProfile(receiver)}
                      >
                        <div className="relative p-0.5 rounded-full bg-[#e8edf2] dark:bg-[#121a2e] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),_inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.45),_inset_-2px_-2px_4px_rgba(255,255,255,0.02)]">
                          <img
                            src={receiver.avatarUrl}
                            alt={receiver.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-primary hover:text-sky-500 transition-colors">
                            {receiver.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 text-text-muted font-bold text-xs">
                            <ClockIcon className="w-3.5 h-3.5" />
                            <span>Invitation sent 2 hours ago</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-16 md:pl-0">
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
                          Pending
                        </span>
                        <button
                          onClick={() => cancelRequest(req.id)}
                          className="text-xs font-bold text-text-muted hover:text-rose-500 transition-colors px-4 py-2 rounded-xl bg-background shadow-[3px_3px_6px_rgba(163,177,198,0.3),_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.4),_-3px_-3px_6px_rgba(255,255,255,0.02)] border border-slate-200/10 dark:border-slate-800/10 hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_#ffffff] dark:hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),_inset_-2px_-2px_5px_rgba(255,255,255,0.02)] active:scale-95"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-background rounded-3xl border border-slate-300/10 dark:border-slate-800/10 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.45),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)] flex flex-col items-center max-w-2xl mx-auto px-6">
                  <div className="w-16 h-16 bg-[#e8edf2] dark:bg-[#121a2e] rounded-full flex items-center justify-center mb-4 shadow-[3px_3px_8px_rgba(163,177,198,0.35),_-3px_-3px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.02)]">
                    <PaperAirplaneIcon className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                    No pending invitations
                  </h3>
                  <p className="text-text-muted max-w-sm mx-auto text-sm font-bold">
                    You haven't sent any connection requests recently.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="relative">
              <div className="absolute left-6 top-4 bottom-4 w-[2px] bg-slate-300 dark:bg-slate-800 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]"></div>
              <div className="space-y-8">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="relative pl-16 group">
                      <div className="absolute left-3 top-2.5 w-7 h-7 -translate-x-1/2 bg-background border border-slate-200/10 dark:border-slate-800/10 rounded-full flex items-center justify-center z-10 shadow-[2px_2px_5px_rgba(163,177,198,0.3),_-2px_-2px_5px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.45),_-2px_-2px_5px_rgba(255,255,255,0.02)] transition-all">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="bg-background rounded-2xl p-5 border border-slate-200/10 dark:border-slate-800/10 shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.03)] hover:scale-[1.01] transition-all">
                        <p className="text-text-primary font-bold text-sm">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-text-muted font-bold">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {!notification.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-background rounded-3xl border border-slate-300/10 dark:border-slate-800/10 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.45),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)] flex flex-col items-center max-w-2xl mx-auto px-6">
                    <div className="w-16 h-16 bg-[#e8edf2] dark:bg-[#121a2e] rounded-full flex items-center justify-center mb-4 shadow-[3px_3px_8px_rgba(163,177,198,0.35),_-3px_-3px_8px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),_-3px_-3px_8px_rgba(255,255,255,0.02)]">
                      <BellIcon className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                      No activity yet
                    </h3>
                    <p className="text-text-muted max-w-sm mx-auto text-sm font-bold">
                      Your historical notification logs will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
