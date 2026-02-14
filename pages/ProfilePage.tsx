import React, { useContext, useState, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import type { Skill, User, Rating, TokenTransaction } from "../types";
import SkillTag from "../components/SkillTag";
import DraggableTestimonials from "../components/DraggableTestimonials";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  SparklesIcon,
  AcademicCapIcon,
  ClockIcon,
  UserCircleIcon,
  ChartBarIcon,
  FunnelIcon,
} from "../components/icons";

interface ProfilePageProps {
  ratings: Rating[];
  users: User[];
  tokenTransactions: TokenTransaction[];
  allSkills: Skill[];
  addNewSkill: (newSkill: Skill) => void;
  openEditModal: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  ratings,
  users,
  tokenTransactions,
  openEditModal,
}) => {
  const { currentUser } = useContext(AuthContext);
  const [tokenFilter, setTokenFilter] = useState<"all" | "earned" | "spent">(
    "all",
  );

  if (!currentUser) return null;

  // --- Derived Data & Stats ---

  const myRatings = useMemo(() => {
    return ratings
      .filter((r) => r.ratedId === currentUser.id)
      .map((rating) => ({
        ...rating,
        rater: users.find((u) => u.id === rating.raterId),
      }))
      .filter((r) => r.rater) as (Rating & { rater: User })[];
  }, [ratings, users, currentUser.id]);

  const averageRating =
    myRatings.length > 0
      ? (
          myRatings.reduce((acc, r) => acc + r.stars, 0) / myRatings.length
        ).toFixed(1)
      : "New";

  const positiveReviewsPct =
    myRatings.length > 0
      ? Math.round(
          (myRatings.filter((r) => r.stars >= 4).length / myRatings.length) *
            100,
        )
      : 100;

  const myTransactions = useMemo(() => {
    return tokenTransactions
      .filter((t) => t.userId === currentUser.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [tokenTransactions, currentUser.id]);

  const filteredTransactions = myTransactions.filter((t) => {
    if (tokenFilter === "all") return true;
    return t.type === tokenFilter;
  });

  const lifetimeEarnings = myTransactions
    .filter((t) => t.type === "earned")
    .reduce((acc, t) => acc + t.amount, 0);

  // Mock/Estimated Stats
  const sessionsCompleted = Math.floor(myRatings.length * 1.5) || 0; // Estimation
  const sessionsTaught = Math.floor(sessionsCompleted * 0.7);
  const sessionsLearned = sessionsCompleted - sessionsTaught;

  const currentMonthEarned = myTransactions
    .filter(
      (t) =>
        t.type === "earned" && t.timestamp.getMonth() === new Date().getMonth(),
    )
    .reduce((acc, t) => acc + t.amount, 0);

  const currentMonthSessions = myTransactions.filter(
    (t) =>
      t.description.toLowerCase().includes("session") &&
      t.timestamp.getMonth() === new Date().getMonth(),
  ).length;

  // --- Render Helpers ---

  const renderStatCard = (
    label: string,
    value: string | number,
    subtext?: string,
    highlight?: boolean,
  ) => (
    <div
      className={`p-4 rounded-xl border ${highlight ? "bg-sky-500/10 border-sky-500/30" : "bg-surface border-border"} flex flex-col`}
    >
      <span className="text-2xl font-bold text-text-primary mb-1">{value}</span>
      <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
        {label}
      </span>
      {subtext && (
        <span className="text-xs text-text-muted mt-2">{subtext}</span>
      )}
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-20">
      {/* --- 1. Header Section --- */}
      <div className="relative mb-16">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-l from-sky-500/10 to-transparent rounded-3xl -z-10 blur-3xl opacity-50 pointer-events-none" />

        <div className="bg-surface backdrop-blur-md rounded-3xl border border-border p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sky-500/5 to-transparent -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Identity (7 cols) */}
            <div className="lg:col-span-7 flex flex-col md:flex-row items-start gap-8">
              <div className="relative flex-shrink-0">
                <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-sky-400 to-indigo-500 shadow-2xl">
                  <img
                    src={
                      currentUser.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`
                    }
                    alt={currentUser.name}
                    className="w-full h-full rounded-full bg-surface object-cover border-4 border-surface"
                  />
                </div>
                <button
                  onClick={openEditModal}
                  className="absolute bottom-2 right-2 p-2 bg-surface text-sky-500 border border-border rounded-full hover:bg-surface-hover hover:text-sky-600 transition-all shadow-lg"
                  title="Edit Profile"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 pt-2">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-text-primary tracking-tight mb-3">
                    {currentUser.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-text-secondary">
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      <span className="text-amber-500 text-lg">★</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {averageRating}
                      </span>
                      <span className="text-text-muted text-xs ml-1">
                        ({myRatings.length})
                      </span>
                    </div>
                    <span className="hidden md:inline text-text-muted">•</span>
                    <span className="text-text-muted">
                      {currentUser.email || "Digital Creator"}
                    </span>
                  </div>
                </div>

                <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
                  {currentUser.bio || "No bio yet."}
                </p>

                <div className="flex gap-3 pt-2">
                  {currentUser.isAdmin && (
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs rounded border border-indigo-500/30 uppercase font-bold tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Stats Strip (5 cols) */}
            <div className="lg:col-span-5 h-full flex flex-col justify-center lg:border-l lg:border-border lg:pl-12">
              <div className="flex items-center gap-2 mb-8 text-text-muted text-sm font-semibold uppercase tracking-wider">
                <ChartBarIcon className="w-4 h-4" /> Performance
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderStatCard(
                  "Lifetime Earned",
                  lifetimeEarnings,
                  "Tokens",
                  true,
                )}
                {renderStatCard("Sessions", sessionsCompleted, "Completed")}

                {/* Reviews Card */}
                <div className="p-4 rounded-xl border bg-surface border-border flex flex-col">
                  <span className="text-2xl font-bold text-text-primary mb-1">
                    {myRatings.length}
                  </span>
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    Reviews
                  </span>
                  <span className="text-xs text-amber-500 font-bold mt-2 flex items-center gap-1">
                    ★ {averageRating} Rating
                  </span>
                </div>

                {renderStatCard("Response Rate", "98%", "Very Responsive")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Divider --- */}

      {/* --- 7. Activity Summary (New) --- */}
      <div className="bg-surface backdrop-blur-md rounded-3xl border border-border p-8 lg:p-12 shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent -z-10" />
        <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-sky-500" />
          Monthly Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-6 rounded-2xl">
            <div className="text-emerald-500 font-bold text-3xl mb-1">
              +{currentMonthEarned}
            </div>
            <div className="text-text-muted text-sm font-medium">
              Tokens Earned this month
            </div>
          </div>
          <div className="bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/20 p-6 rounded-2xl">
            <div className="text-sky-500 font-bold text-3xl mb-1">
              {currentMonthSessions}
            </div>
            <div className="text-text-muted text-sm font-medium">
              Sessions Completed
            </div>
          </div>
          <div className="bg-surface border border-border p-6 rounded-2xl flex flex-col justify-center">
            <div className="text-text-primary font-semibold mb-1">Upcoming</div>
            <div className="text-text-muted text-sm">
              No sessions scheduled for later today.
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. Skills Section --- */}
      <div className="bg-surface backdrop-blur-md rounded-3xl border border-border p-8 lg:p-12 shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-indigo-500/5 to-transparent -z-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Teaching (Dominant) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <AcademicCapIcon className="w-6 h-6 text-sky-500" />
                Skills I Teach
              </h3>
              <span className="text-xs font-mono text-text-muted bg-surface-highlight/50 px-2 py-1 rounded">
                {currentUser.teaches.length} SKILLS
              </span>
            </div>
            <div className="space-y-3">
              {currentUser.teaches.map((skill) => (
                <div
                  key={skill.id}
                  className="group relative flex items-center justify-between p-4 bg-surface border border-border hover:border-sky-500/50 rounded-xl transition-all hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <AcademicCapIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">
                        {skill.name}
                      </div>
                      <div className="text-xs text-sky-500/80 font-medium mt-0.5">
                        Advanced • 12 Sessions
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Edit or Manage icon could go here */}
                  </div>
                </div>
              ))}
              {currentUser.teaches.length === 0 && (
                <div className="text-text-muted italic p-4 border border-dashed border-border rounded-xl">
                  No teaching skills listed yet.
                </div>
              )}
            </div>
          </div>

          {/* Learning */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-text-secondary flex items-center gap-2">
                <UserCircleIcon className="w-6 h-6 text-text-muted" />
                Skills I Want to Learn
              </h3>
              <span className="text-xs font-mono text-text-muted bg-surface-highlight/50 px-2 py-1 rounded">
                {currentUser.learns.length} SKILLS
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser.learns.map((skill) => (
                <SkillTag key={skill.id} skill={skill} variant="learn" />
              ))}
              {currentUser.learns.length === 0 && (
                <div className="text-text-muted italic w-full p-4">
                  No learning goals listed yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- 5. Reputation Metrics --- */}
      <div className="bg-surface backdrop-blur-md rounded-3xl border border-border p-8 lg:p-12 shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 p-32 bg-sky-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

        <h3 className="text-xl font-semibold text-text-primary mb-8 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-indigo-500" />
          Reputation Impact
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-text-primary mb-2">
              {myRatings.length}
            </div>
            <div className="text-sm text-text-muted">Total Reviews</div>
          </div>
          <div className="text-center border-l border-border">
            <div className="text-4xl font-bold text-amber-500 mb-2">
              {averageRating}
            </div>
            <div className="text-sm text-text-muted">Average Rating</div>
          </div>
          <div className="text-center border-l border-border">
            <div className="text-4xl font-bold text-sky-500 mb-2">
              {sessionsTaught}
            </div>
            <div className="text-sm text-text-muted">Sessions Taught</div>
          </div>
          <div className="text-center border-l border-border">
            <div className="text-4xl font-bold text-indigo-500 mb-2">
              {sessionsLearned}
            </div>
            <div className="text-sm text-text-muted">Sessions Learned</div>
          </div>
        </div>
      </div>

      {/* --- 3. Token History --- */}
      <div className="bg-surface backdrop-blur-md rounded-3xl border border-border p-8 lg:p-12 shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-baseline gap-4">
            <h3 className="text-2xl font-semibold text-text-primary">
              Token History
            </h3>
            <span className="text-sm font-mono text-text-muted">
              Balance:{" "}
              <span className="text-emerald-500 font-bold">
                {currentUser.tokens}
              </span>
            </span>
          </div>
          <div className="inline-flex bg-surface-highlight rounded-lg p-1 border border-border">
            {(["all", "earned", "spent"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTokenFilter(filter)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tokenFilter === filter
                    ? "bg-slate-700 text-white shadow-sm dark:bg-slate-600"
                    : "text-text-muted hover:text-text-primary"
                } capitalize`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, idx) => (
              <div
                key={transaction.id}
                className="group flex items-center gap-6 p-4 rounded-xl hover:bg-surface-hover transition-colors border border-transparent hover:border-border"
              >
                <div
                  className={`w-2 h-2 rounded-full ${transaction.type === "earned" ? "bg-emerald-500" : "bg-red-500"}`}
                />

                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-surface-highlight border border-border text-text-muted group-hover:scale-105 transition-transform">
                  {transaction.type === "earned" ? (
                    <ArrowUpIcon className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ArrowDownIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-primary truncate">
                    {transaction.description}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                    <ClockIcon className="w-3 h-3" />
                    {transaction.timestamp.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    <span className="w-1 h-1 rounded-full bg-border" />
                    {transaction.timestamp.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div
                  className={`text-right font-mono font-bold text-lg ${transaction.type === "earned" ? "text-emerald-500" : "text-text-muted"}`}
                >
                  {transaction.type === "earned" ? "+" : "-"}
                  {transaction.amount}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-surface/30 rounded-2xl border border-dashed border-border">
              <p className="text-text-muted">
                No transactions found for this filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- 4. Testimonials --- */}
      {myRatings.length > 0 && (
        <div className="bg-surface backdrop-blur-md rounded-3xl border border-border p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/5 to-transparent -z-10" />
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-semibold text-text-primary">
              What Others Say
            </h3>
            <span className="text-sm text-text-muted">
              Latest from your sessions
            </span>
          </div>
          <DraggableTestimonials testimonials={myRatings} />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
