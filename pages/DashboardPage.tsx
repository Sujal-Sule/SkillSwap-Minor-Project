import React from "react";
import { motion } from "framer-motion";
import type { Session, User, Rating, ConnectionRequest } from "../types";
import { categories } from "../data/categories";
import CategoryCard from "../components/CategoryCard";
import UserSuggestionCard from "../components/UserSuggestionCard";
import SkillTag from "../components/SkillTag";
import ControlPanel from "../components/ControlPanel";
import ActiveFocusPanel from "../components/ActiveFocusPanel";
import ActivityFeed from "../components/ActivityFeed";
import {
  TokenIcon,
  UsersIcon,
  AcademicCapIcon,
  SparklesIcon,
  ClockIcon,
} from "../components/icons";

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

const DashboardPage: React.FC<DashboardPageProps> = ({
  sessions,
  ratings,
  users,
  openRatingModal,
  completeSession,
  startLiveSession,
  currentUser,
  connectionRequests,
  sendConnectionRequest,
  startChat,
  onCategorySelect,
}) => {
  if (!currentUser) return null;

  const upcomingSessions = sessions
    .filter((s) => {
      if (s.status !== "scheduled") return false;
      if (s.studentId !== currentUser.id && s.teacherId !== currentUser.id)
        return false;

      const scheduledTime = new Date(s.scheduledTime);
      const duration = s.duration || 60;
      const expiryTime = new Date(scheduledTime.getTime() + duration * 60000);

      // Filter out expired sessions
      return new Date() < expiryTime;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledTime).getTime() -
        new Date(b.scheduledTime).getTime(),
    );

  // Suggest users who the current user is not connected with and has no pending requests with
  const connectedUserIds = new Set(currentUser.connections);
  const pendingRequestUserIds = new Set(
    connectionRequests
      .filter(
        (r) =>
          r.status === "pending" &&
          (r.senderId === currentUser.id || r.receiverId === currentUser.id),
      )
      .flatMap((r) => [r.senderId, r.receiverId]),
  );
  const suggestedUsers = users
    .filter(
      (u) =>
        u.id !== currentUser.id &&
        !connectedUserIds.has(u.id) &&
        !pendingRequestUserIds.has(u.id),
    )
    .slice(0, 5); // Limit suggestions

  const getUser = (id: string): User | undefined =>
    users.find((u) => u.id === id);

  // Helper to check lock status
  const getSessionAccessState = (session: Session) => {
    const now = new Date();
    const scheduledTime = new Date(session.scheduledTime);
    const unlockTime = new Date(scheduledTime.getTime() - 60 * 60 * 1000); // 1 hour before

    if (now < unlockTime) {
      return {
        locked: true,
        message: `Unlocks at ${unlockTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      };
    }
    return { locked: false, message: "Join Session" };
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (user: User): number => {
    const fields = [
      user.name,
      user.avatarUrl,
      user.bio,
      user.teaches?.length > 0,
      user.learns?.length > 0,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion(currentUser);

  return (
    <div className="container mx-auto space-y-20">
      {/* Enhanced Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome back, {currentUser.name.split(" ")[0]}!
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <ClockIcon className="w-4 h-4" />
            <p>
              {upcomingSessions.length > 0
                ? `Next session: ${new Date(upcomingSessions[0].scheduledTime).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                : "No upcoming sessions"}
            </p>
          </div>
        </div>
        <button
          onClick={() => startChat && startChat(currentUser)}
          className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
        >
          Schedule Session
        </button>
      </div>

      {/* Control Panel - Unified Stats Strip */}
      <ControlPanel
        tokens={currentUser.tokens}
        profileCompletion={profileCompletion}
        connections={currentUser.connections?.length || 0}
        upcomingSessions={upcomingSessions.length}
      />

      {/* Active Focus Panel - Dynamic Heartbeat */}
      <ActiveFocusPanel
        nextSession={upcomingSessions[0]}
        mentor={
          upcomingSessions[0]
            ? getUser(
                upcomingSessions[0].studentId === currentUser.id
                  ? upcomingSessions[0].teacherId
                  : upcomingSessions[0].studentId,
              )
            : undefined
        }
        onJoinSession={startLiveSession}
        onFindMentor={() => onCategorySelect("")}
      />

      {/* Activity Feed */}
      <ActivityFeed
        sessions={sessions}
        connectionRequests={connectionRequests}
        users={users}
        currentUser={currentUser}
      />

      {/* Grow your network */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Your Network
          </h2>
          <div className="flex gap-6 text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {currentUser.connections?.length || 0} connections
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {
                connectionRequests.filter(
                  (r) =>
                    r.status === "pending" && r.receiverId === currentUser.id,
                ).length
              }{" "}
              pending
            </span>
          </div>
        </div>
        {suggestedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {suggestedUsers.map((user) => (
              <UserSuggestionCard
                key={user.id}
                user={user}
                onConnect={() => sendConnectionRequest(user.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <UsersIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Building your network
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We're finding the perfect people for you to connect with!
            </p>
          </div>
        )}
      </div>

      {/* Explore Skills - Compact Horizontal Strip */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-slate-100">
          Explore Skills
        </h2>
        <div className="flex space-x-6 overflow-x-auto pb-4 -mx-8 px-8">
          {categories
            .filter((c) => c.id !== "c5")
            .map((cat) => (
              <motion.div
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className={`relative w-64 h-24 flex-shrink-0 bg-gradient-to-br ${
                  cat.color === "sky"
                    ? "from-sky-500/20 to-sky-600/30 dark:from-sky-500/10 dark:to-sky-600/20 border-sky-400/50"
                    : cat.color === "purple"
                      ? "from-purple-500/20 to-purple-600/30 dark:from-purple-500/10 dark:to-purple-600/20 border-purple-400/50"
                      : cat.color === "emerald"
                        ? "from-emerald-500/20 to-emerald-600/30 dark:from-emerald-500/10 dark:to-emerald-600/20 border-emerald-400/50"
                        : "from-rose-500/20 to-rose-600/30 dark:from-rose-500/10 dark:to-rose-600/20 border-rose-400/50"
                } border-2 rounded-2xl cursor-pointer group overflow-hidden hover:shadow-xl transition-shadow duration-300`}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glassmorphism overlay centered at bottom-right corner */}
                <div className="absolute bottom-0 right-0 w-36 h-36 translate-x-1/2 translate-y-1/2 bg-gradient-to-br from-white/30 via-white/20 to-white/10 dark:from-white/20 dark:via-white/10 dark:to-white/5 backdrop-blur-lg rounded-full border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-500 ease-out group-hover:w-[600px] group-hover:h-[500px]" />

                {/* Content - horizontal layout */}
                <div className="relative z-10 flex items-center gap-4 h-full px-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color === "sky" ? "from-sky-400 to-sky-600" : cat.color === "purple" ? "from-purple-400 to-purple-600" : cat.color === "emerald" ? "from-emerald-400 to-emerald-600" : "from-rose-400 to-rose-600"} flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {cat.name}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
