import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User, ConnectionRequest, Notification } from "../types";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
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
    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all relative ${
      activeTab === id
        ? "bg-surface text-text-primary shadow-lg shadow-sky-500/10"
        : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {icon}
    {label}
    {count !== undefined && count > 0 && (
      <span
        className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
          activeTab === id
            ? "bg-text-primary text-background"
            : "bg-surface-highlight text-text-muted"
        }`}
      >
        {count}
      </span>
    )}
    {activeTab === id && (
      <motion.div
        layoutId="activeNotificationTab"
        className="absolute inset-0 rounded-full border border-border -z-10 bg-surface"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
        const res = await fetch(`http://localhost:8000/notifications`, {
          headers: {
            Authorization: `Bearer ${currentUserId}`, // In real app, use proper token
          },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
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

  // Helper to get icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "connection_request":
        return <InboxIcon className="w-5 h-5 text-sky-500" />;
      case "connection_accepted":
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
      case "session_proposed":
        return <CalendarIcon className="w-5 h-5 text-purple-500" />;
      case "new_match":
        return <BellIcon className="w-5 h-5 text-amber-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-slate-500" />;
    }
  };

  const getUser = (id: string): User | undefined =>
    users.find((u) => u.id === id);

  /* TabButton component moved outside */

  return (
    <div className="pt-0 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center md:text-left"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 tracking-tight">
          Notifications
        </h1>
        <p className="text-text-muted text-lg">
          Stay updated on your connections and requests.
        </p>
      </motion.div>

      {/* Tabs */}
      <LayoutGroup>
        <div className="flex flex-wrap gap-2 mb-10 bg-surface/50 p-1.5 rounded-full border border-border w-full md:w-fit mx-auto md:mx-0 backdrop-blur-sm">
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
            <div className="space-y-4">
              {incoming.length > 0 ? (
                incoming.map((req) => {
                  const sender = getUser(req.senderId);
                  if (!sender) return null;
                  return (
                    <div
                      key={req.id}
                      className="bg-surface backdrop-blur-md rounded-2xl p-5 border border-border shadow-sm hover:border-sky-500/30 transition-all flex flex-col md:flex-row items-center gap-6"
                    >
                      <div
                        className="flex items-center gap-4 flex-1 w-full"
                        onClick={() => viewUserProfile(sender)}
                      >
                        <div className="relative cursor-pointer">
                          <img
                            src={sender.avatarUrl}
                            alt={sender.name}
                            className="w-14 h-14 rounded-full object-cover ring-2 ring-border"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-sky-500 text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold border-2 border-surface">
                            New
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-text-primary hover:text-sky-500 cursor-pointer transition-colors">
                            {sender.name}
                          </h3>
                          <p className="text-text-muted text-sm">
                            Wants to connect with you.
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-muted bg-surface-highlight px-2 py-0.5 rounded-full border border-border">
                              Application Developer
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={() => handleRequest(req.id, "accepted")}
                          className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 transition-all active:scale-95"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequest(req.id, "declined")}
                          className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold bg-surface-highlight text-text-muted rounded-xl hover:bg-surface-hover hover:text-text-primary transition-colors border border-border"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-surface/50 rounded-3xl border border-dashed border-border flex flex-col items-center">
                  <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4">
                    <InboxIcon className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    No new requests yet
                  </h3>
                  <p className="text-text-muted max-w-sm mx-auto mb-6">
                    When someone wants to learn from you, you'll see it here.
                  </p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-sky-500 font-bold text-sm hover:text-sky-400 transition-colors"
                  >
                    Update your profile to attract matches →
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div className="space-y-4">
              {outgoing.length > 0 ? (
                outgoing.map((req) => {
                  const receiver = getUser(req.receiverId);
                  if (!receiver) return null;
                  return (
                    <div
                      key={req.id}
                      className="bg-surface backdrop-blur-md rounded-2xl p-5 border border-border shadow-sm hover:border-sky-500/30 transition-all flex flex-col md:flex-row items-center gap-4 md:justify-between"
                    >
                      <div
                        className="flex items-center gap-4 w-full md:w-auto"
                        onClick={() => viewUserProfile(receiver)}
                      >
                        <img
                          src={receiver.avatarUrl}
                          alt={receiver.name}
                          className="w-12 h-12 rounded-full object-cover opacity-80 cursor-pointer"
                        />
                        <div>
                          <h3 className="font-bold text-text-primary hover:text-sky-500 cursor-pointer transition-colors">
                            {receiver.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <ClockIcon className="w-3.5 h-3.5 text-text-muted" />
                            <span className="text-xs text-text-muted font-medium">
                              Invitation sent 2 hours ago
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-16 md:pl-0">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-wide">
                          Pending
                        </span>
                        <button
                          onClick={() => cancelRequest(req.id)}
                          className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-hover"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-surface/50 rounded-3xl border border-dashed border-border flex flex-col items-center">
                  <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4">
                    <PaperAirplaneIcon className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    No pending invitations
                  </h3>
                  <p className="text-text-muted max-w-sm mx-auto">
                    You haven't sent any connection requests recently.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="relative">
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-border/50"></div>
              <div className="space-y-8">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="relative pl-16 group">
                      <div className="absolute left-3 top-1 w-6 h-6 -translate-x-1/2 bg-surface border border-border rounded-full flex items-center justify-center z-10 group-hover:border-sky-500 transition-colors">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="bg-surface rounded-2xl p-4 border border-border hover:bg-surface-hover transition-all shadow-sm">
                        <p className="text-text-primary font-medium">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-text-muted">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-text-muted">No recent activity.</p>
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
