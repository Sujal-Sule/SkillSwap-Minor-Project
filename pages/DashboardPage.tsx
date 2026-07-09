import React from "react";
import type { Session, User, Rating, ConnectionRequest } from "../types";
import { categories } from "../data/categories";
import ActivityFeed from "../components/ActivityFeed";
import MentorshipIllustration from "../components/MentorshipIllustration";
import {
  TokenIcon,
  UsersIcon,
  AcademicCapIcon,
  SparklesIcon,
  ClockIcon,
  VideoCameraIcon,
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

const SHADOW_TACTILE_BUTTON =
  "shadow-[4px_4px_8px_rgba(0,0,0,0.04),-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.02)] hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.04),inset_-3px_-3px_6px_#ffffff] dark:hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.02)]";

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
      if (s.status !== "scheduled" && s.status !== "active") return false;
      if (s.studentId !== currentUser.id && s.teacherId !== currentUser.id)
        return false;

      const scheduledTime = new Date(s.scheduledTime);
      const duration = s.duration || 60;
      const expiryTime = new Date(scheduledTime.getTime() + duration * 60000);

      return new Date() < expiryTime;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledTime).getTime() -
        new Date(b.scheduledTime).getTime(),
    );

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
    .slice(0, 4);

  const getUser = (id: string): User | undefined =>
    users.find((u) => u.id === id);

  const getSessionAccessState = (session: Session) => {
    const now = new Date();
    const scheduledTime = new Date(session.scheduledTime);
    const unlockTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);

    if (now < unlockTime) {
      return {
        locked: true,
        message: `Unlocks at ${unlockTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      };
    }
    return {
      locked: false,
      message: session.status === "active" ? "Rejoin Session" : "Join Session",
    };
  };

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
    <div className="w-full bg-transparent transition-colors duration-300">
      <div className="container mx-auto max-w-7xl py-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-200/40 dark:border-slate-800/40">
          <div>
            <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white">
              Workspace: <span className="text-sky-600 dark:text-sky-400">{currentUser.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1.5 font-bold flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              P2P Learning & Skill Exchange Network Node
            </p>
          </div>
          <button
            onClick={() => startChat && startChat(null)}
            className={`px-6 py-3 bg-slate-100/80 hover:bg-slate-200/50 dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-extrabold rounded-2xl ${SHADOW_TACTILE_BUTTON} transition-all duration-300 text-sm border border-slate-200/30 dark:border-slate-800/50`}
          >
            Schedule Session
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-b border-slate-200/40 dark:border-slate-800/40 mb-12">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <TokenIcon className="w-5.5 h-5.5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Available Tokens</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{currentUser.tokens}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center">
              <UsersIcon className="w-5.5 h-5.5 text-sky-500" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Active Connections</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{currentUser.connections?.length || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <AcademicCapIcon className="w-5.5 h-5.5 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Completed Sessions</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {sessions.filter((s) => s.status === "completed").length}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Node Completion</p>
              <span className="font-extrabold text-xs text-text-primary">{profileCompletion}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-655 rounded-full transition-all duration-550"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-14">
            
            {upcomingSessions.length > 0 ? (
              <div className="relative overflow-hidden py-10 px-8 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/40 rounded-[32px] shadow-sm">
                
                <div className="relative z-10 max-w-xl">
                  <div className="flex items-center flex-wrap gap-3 mb-5">
                    <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-indigo-200/20 dark:border-indigo-800/20">
                      Next Active Session
                    </span>
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs font-semibold">
                      <ClockIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {new Date(upcomingSessions[0].scheduledTime).toLocaleString(
                          undefined,
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-3xl sm:text-4.5xl font-black tracking-tight mb-3 text-slate-900 dark:text-white leading-none">
                    {upcomingSessions[0].skill.name}
                  </h2>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          (upcomingSessions[0].studentId === currentUser.id
                            ? getUser(upcomingSessions[0].teacherId)?.avatarUrl
                            : getUser(upcomingSessions[0].studentId)?.avatarUrl) || null
                        }
                        alt="avatar"
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/20"
                      />
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {upcomingSessions[0].studentId === currentUser.id
                          ? getUser(upcomingSessions[0].teacherId)?.name
                          : getUser(upcomingSessions[0].studentId)?.name}
                      </span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-xs sm:text-sm text-text-secondary font-medium">
                      {upcomingSessions[0].duration} min session duration
                    </span>
                  </div>

                  <button
                    onClick={() => startLiveSession(upcomingSessions[0])}
                    disabled={getSessionAccessState(upcomingSessions[0]).locked}
                    className={`px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:text-slate-950 font-extrabold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs sm:text-sm shadow-md active:scale-97`}
                  >
                    <VideoCameraIcon className="w-4.5 h-4.5" />
                    {getSessionAccessState(upcomingSessions[0]).message}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden py-10 px-8 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/40 rounded-[32px] shadow-sm">
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-md">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded-lg text-[10px] font-extrabold uppercase tracking-wider mb-4 border border-sky-200/20 dark:border-sky-800/20">
                      <SparklesIcon className="w-3.5 h-3.5 text-sky-500" /> Peer Exchange Hub
                    </span>
                    <h2 className="text-3xl sm:text-4.5xl font-black tracking-tight mb-3 text-slate-900 dark:text-white leading-none">
                      Ready for your next learning session?
                    </h2>
                    <p className="text-slate-650 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                      Connect with an expert mentor, swap skills, and accelerate your growth on the network.
                    </p>
                    <button
                      onClick={() => onCategorySelect("")}
                      className={`px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 font-extrabold rounded-xl transition-all text-xs sm:text-sm shadow-md active:scale-97`}
                    >
                      Find a Mentor
                    </button>
                  </div>
                  
                  <div className="relative w-full md:w-auto flex justify-center">
                    <MentorshipIllustration className="w-44 h-auto filter brightness-110 drop-shadow-lg" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-xl font-black text-text-primary tracking-tight">
                Explore Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {categories
                  .filter((c) => c.id !== "c5")
                  .map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => onCategorySelect(cat.id)}
                      className={`flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/60 ${SHADOW_TACTILE_BUTTON} cursor-pointer transition-all duration-300 border border-slate-200/30 dark:border-slate-800/40 group`}
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${
                        cat.color === "sky"
                          ? "from-sky-400 to-sky-600"
                          : cat.color === "purple"
                            ? "from-purple-400 to-purple-600"
                            : cat.color === "emerald"
                              ? "from-emerald-400 to-emerald-600"
                              : "from-rose-400 to-rose-600"
                      } flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <cat.icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm sm:text-base text-slate-855 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {cat.name}
                        </p>
                        <span className="text-[10px] text-text-muted mt-0.5 inline-block font-semibold">
                          Explore
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
                <h2 className="text-xl font-black text-text-primary tracking-tight">Your Network</h2>
                <div className="flex gap-3 text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider">
                  <span>{currentUser.connections?.length || 0} connections</span>
                  <span>•</span>
                  <span>
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
                <div className="divide-y divide-slate-200/30 dark:divide-slate-800/30">
                  {suggestedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-6 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.avatarUrl || null}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                          {user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse shadow-sm" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm sm:text-base text-text-primary truncate">{user.name}</p>
                          <p className="text-xs text-text-muted mt-0.5 font-medium line-clamp-1">{user.bio || "Member at SkillSwap"}</p>
                          
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {user.teaches && user.teaches.length > 0 ? (
                              user.teaches.slice(0, 2).map((skill) => (
                                <span
                                  key={skill.id}
                                  className="text-[9px] font-extrabold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-900/60 text-text-secondary rounded-lg border border-slate-200/20 dark:border-slate-800/30"
                                >
                                  {skill.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] font-bold text-text-muted uppercase">P2P Learner</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => sendConnectionRequest(user.id)}
                        className={`px-4 py-2 bg-slate-100/80 hover:bg-slate-200/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl transition-all active:scale-97 text-xs border border-slate-200/30 dark:border-slate-800/50 ${SHADOW_TACTILE_BUTTON}`}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4">
                  <p className="text-xs sm:text-sm text-text-muted">
                    Check back soon for new recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 lg:pl-8 lg:border-l border-slate-200/40 dark:border-slate-800/40 space-y-12">
            
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200/30 dark:border-slate-800/30">
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || null}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-full border border-white dark:border-slate-800 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-text-primary truncate">
                  {currentUser.name}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted truncate font-medium">
                  {currentUser.bio || "No biography added"}
                </p>
              </div>
            </div>

            <div>
              <ActivityFeed
                sessions={sessions}
                connectionRequests={connectionRequests}
                users={users}
                currentUser={currentUser}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
