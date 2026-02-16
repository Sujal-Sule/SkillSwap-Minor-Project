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
import MentorshipIllustration from "../components/MentorshipIllustration";
import {
  TokenIcon,
  UsersIcon,
  AcademicCapIcon,
  SparklesIcon,
  ClockIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
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
  startChat: (user?: User | null) => void;
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {currentUser.name.split(" ")[0]}!
          </h1>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <ClockIcon className="w-4 h-4" />
            <p>
              {upcomingSessions.length > 0
                ? `Next session: ${new Date(upcomingSessions[0].scheduledTime).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                : "No upcoming sessions"}
            </p>
          </div>
        </div>
        <button
          onClick={() => startChat && startChat(null)}
          className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
        >
          Schedule Session
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tokens Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <TokenIcon className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-text-primary">
                {currentUser.tokens}
              </h2>
              <p className="text-text-secondary font-medium">Tokens</p>
              <p className="text-xs text-text-muted mt-1">Available Balance</p>
            </div>
          </div>
        </motion.div>

        {/* Connections Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <UsersIcon className="w-8 h-8 text-sky-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-text-primary">
                {currentUser.connections?.length || 0}
              </h2>
              <p className="text-text-secondary font-medium">Connections</p>
              <p className="text-xs text-text-muted mt-1">Active Members</p>
            </div>
          </div>
        </motion.div>

        {/* Sessions Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <AcademicCapIcon className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-text-primary">
                {sessions.filter((s) => s.status === "completed").length}
              </h2>
              <p className="text-text-secondary font-medium">Sessions</p>
              <p className="text-xs text-text-muted mt-1">
                Completed this month
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profile Optimization Section */}
      <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Profile Optimized
          </h2>
        </div>
        <div className="relative w-full h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${profileCompletion}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-purple-600 flex items-center justify-end pr-4 rounded-full"
          >
            {profileCompletion === 100 && (
              <div className="w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </motion.div>
          <div className="absolute inset-0 flex items-center pl-6 text-white font-bold z-10">
            {profileCompletion}%
          </div>
        </div>
        <p className="text-text-muted text-sm">
          {profileCompletion === 100
            ? "Excellent! Your profile is fully optimized for maximum visibility."
            : "Complete your profile to increase your visibility and get more matches."}
        </p>
      </div>

      {/* Dynamic Session Banner */}
      {upcomingSessions.length > 0 ? (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-900 dark:to-purple-900 p-8 md:p-10 rounded-3xl border border-indigo-500/30 shadow-lg shadow-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group text-white">
          <div className="relative z-10 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                Upcoming Session
              </span>
              <div className="flex items-center gap-1.5 text-indigo-100 text-sm font-medium">
                <ClockIcon className="w-4 h-4" />
                {new Date(upcomingSessions[0].scheduledTime).toLocaleString(
                  undefined,
                  {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {upcomingSessions[0].skill.name}
            </h2>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                  <span className="font-bold text-sm">
                    {upcomingSessions[0].studentId === currentUser.id
                      ? getUser(upcomingSessions[0].teacherId)?.name.charAt(0)
                      : getUser(upcomingSessions[0].studentId)?.name.charAt(0)}
                  </span>
                </div>
                <span className="text-lg text-indigo-100">
                  with{" "}
                  {upcomingSessions[0].studentId === currentUser.id
                    ? getUser(upcomingSessions[0].teacherId)?.name
                    : getUser(upcomingSessions[0].studentId)?.name}
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-indigo-200">
                {upcomingSessions[0].duration} min session
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => startLiveSession(upcomingSessions[0])}
                disabled={getSessionAccessState(upcomingSessions[0]).locked}
                className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <VideoCameraIcon className="w-5 h-5" />
                {getSessionAccessState(upcomingSessions[0]).message}
              </button>
              {getSessionAccessState(upcomingSessions[0]).locked && (
                <div className="px-4 py-3.5 text-indigo-200 text-sm font-medium flex items-center">
                  Starts in{" "}
                  {Math.round(
                    (new Date(upcomingSessions[0].scheduledTime).getTime() -
                      new Date().getTime()) /
                      (1000 * 60),
                  )}{" "}
                  mins
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 hidden md:block">
            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border border-white/20 animate-[ping_3s_ease-in-out_infinite]" />
              <div className="absolute inset-2 rounded-full border border-white/40 animate-[spin_10s_linear_infinite]" />
              <SparklesIcon className="w-12 h-12 text-white/80" />
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
        </div>
      ) : (
        <div className="bg-surface p-10 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Ready for your next session?
            </h2>
            <p className="text-text-muted mb-8 text-lg">
              Connect with an expert mentor to accelerate your learning and
              growth.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onCategorySelect("")}
                className="px-8 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-500/30"
              >
                Find a Mentor
              </button>
            </div>
          </div>

          {/* Illustration Area */}
          <div className="relative z-10 w-full md:w-auto flex justify-center md:mr-10">
            <MentorshipIllustration className="w-64 h-auto drop-shadow-xl" />
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        </div>
      )}

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
          <h2 className="text-2xl font-bold text-text-primary">Your Network</h2>
          <div className="flex gap-6 text-sm">
            <span className="text-text-secondary">
              {currentUser.connections?.length || 0} connections
            </span>
            <span className="text-text-secondary">
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
          <div className="text-center py-16 px-6 bg-surface/50 border border-dashed border-border rounded-2xl">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <UsersIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <p className="text-lg font-semibold text-text-primary mb-2">
              Building your network
            </p>
            <p className="text-sm text-text-muted">
              We're finding the perfect people for you to connect with!
            </p>
          </div>
        )}
      </div>

      {/* Explore Skills - Compact Horizontal Strip */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-text-primary">
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
