import React, { useContext, useState, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import type { Skill, User, Rating, TokenTransaction } from "../types";
import SkillTag from "../components/SkillTag";
import DraggableTestimonials from "../components/DraggableTestimonials";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  SparklesIcon,
  AcademicCapIcon,
  ClockIcon,
  UserCircleIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BellIcon,
} from "../components/icons";

interface ProfilePageProps {
  ratings: Rating[];
  users: User[];
  tokenTransactions: TokenTransaction[];
  allSkills: Skill[];
  addNewSkill: (newSkill: Skill) => void;
  openEditModal: () => void;
}

const ensureDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? new Date() : val;
  }
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  if (val && typeof val === "object") {
    if (val.$date) {
      const d = new Date(val.$date);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    if (typeof val.toDate === "function") {
      const d = val.toDate();
      return isNaN(d.getTime()) ? new Date() : d;
    }
    if (val.seconds) {
      return new Date(val.seconds * 1000);
    }
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

const ProfilePage: React.FC<ProfilePageProps> = ({
  ratings,
  users,
  tokenTransactions,
  openEditModal,
}) => {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [tokenFilter, setTokenFilter] = useState<"all" | "earned" | "spent">(
    "all",
  );

  const toggleReminderEmails = async () => {
    if (!currentUser || !updateUser) return;
    const currentVal = currentUser.reminderEmailsEnabled !== false;
    await updateUser({
      ...currentUser,
      reminderEmailsEnabled: !currentVal,
    });
  };

  if (!currentUser) return null;

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

  const myTransactions = useMemo(() => {
    return tokenTransactions
      .filter((t) => t.userId === currentUser.id)
      .sort((a, b) => ensureDate(b.timestamp).getTime() - ensureDate(a.timestamp).getTime());
  }, [tokenTransactions, currentUser.id]);

  const filteredTransactions = myTransactions.filter((t) => {
    if (tokenFilter === "all") return true;
    return t.type === tokenFilter;
  });

  const lifetimeEarnings = myTransactions
    .filter((t) => t.type === "earned")
    .reduce((acc, t) => acc + t.amount, 0);

  const sessionsCompleted = Math.floor(myRatings.length * 1.5) || 0;
  const sessionsTaught = Math.floor(sessionsCompleted * 0.7);
  const sessionsLearned = sessionsCompleted - sessionsTaught;

  const currentMonthEarned = myTransactions
    .filter(
      (t) =>
        t.type === "earned" && ensureDate(t.timestamp).getMonth() === new Date().getMonth(),
    )
    .reduce((acc, t) => acc + t.amount, 0);

  const currentMonthSessions = myTransactions.filter(
    (t) =>
      t.description.toLowerCase().includes("session") &&
      ensureDate(t.timestamp).getMonth() === new Date().getMonth(),
  ).length;

  const swapperBadge = useMemo(() => {
    if (myRatings.length >= 10 && parseFloat(averageRating) >= 4.0) {
      return "Top Rated Mentor";
    } else if (myRatings.length >= 5) {
      return "Expert Swapper";
    }
    return "Verified Swapper";
  }, [myRatings.length, averageRating]);

  const renderStatCard = (
    label: string,
    value: string | number,
    subtext?: string,
    icon?: React.ReactNode,
    colorClass: string = "from-sky-500/10 to-indigo-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
  ) => {
    const textColors = colorClass.split(" ");
    const textColor = textColors[textColors.length - 1];
    
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        className="p-4 rounded-[20px] border border-slate-200/10 dark:border-slate-800/10 bg-background flex flex-col justify-between shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.55),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)] group relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2.5 relative z-10">
          <span className="text-[9px] text-text-muted uppercase tracking-widest font-black">
            {label}
          </span>
          {icon && (
            <div className={`p-1.5 rounded-lg bg-background border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_4px_rgba(163,177,198,0.2),_-2px_-2px_4px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.45)] ${textColor}`}>
              {icon}
            </div>
          )}
        </div>
        <div className="relative z-10">
          <span className="text-2xl font-black text-text-primary tracking-tight">{value}</span>
          {subtext && (
            <span className="text-[9px] text-text-muted mt-1 block font-bold uppercase tracking-wider">{subtext}</span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full bg-transparent transition-colors duration-300 relative">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto max-w-7xl py-6 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-8 border-b border-slate-200/40 dark:border-slate-800/40 mb-10"
        >
          <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1.5 font-bold">
            Manage your personal profile, credentials, analytics, and transaction log.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Sidebar (User Details, Skills, Reputation) */}
          <div className="lg:col-span-4 space-y-8">
            {/* User Profile Card */}
            <div className="p-6 rounded-[28px] border border-slate-200/10 dark:border-slate-800/10 bg-background shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.55),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)] flex flex-col items-center text-center">
              <div className="relative mb-5">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="w-32 h-32 rounded-full p-2 bg-background border border-slate-200/10 dark:border-slate-800/10 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),_inset_-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),_inset_-4px_-4px_8px_rgba(255,255,255,0.03)]"
                >
                  <img
                    src={
                      currentUser.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`
                    }
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover border border-slate-200/10 dark:border-slate-800/10"
                  />
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={openEditModal}
                  className="absolute bottom-1 right-1 p-2 bg-background dark:bg-[#121a2e] text-sky-500 border border-slate-200/10 dark:border-slate-800/10 rounded-full hover:text-sky-600 shadow-[2px_2px_5px_rgba(163,177,198,0.3),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4),_-2px_-2px_5px_rgba(255,255,255,0.02)] active:scale-95 transition-all"
                  title="Edit Profile"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              <h2 className="text-2xl font-black text-text-primary mb-1 tracking-tight">
                {currentUser.name}
              </h2>
              <div className="text-[11px] text-text-muted font-black uppercase tracking-wider mb-4">
                {currentUser.email}
              </div>

              <div className="flex items-center gap-1.5 bg-background px-4 py-1.5 rounded-full border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_5px_rgba(163,177,198,0.25),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4),_-2px_-2px_5px_rgba(255,255,255,0.02)] mb-4">
                <span className="text-amber-500 text-sm">★</span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-xs">
                  {averageRating}
                </span>
                <span className="text-text-muted text-[10px] ml-1 font-bold">
                  ({myRatings.length} reviews)
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed mb-6 font-semibold max-w-xs">
                {currentUser.bio || "No bio yet."}
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3.5 py-1.5 bg-background text-sky-600 dark:text-sky-400 text-[9px] rounded-full border border-slate-200/10 dark:border-slate-800/10 uppercase font-black tracking-widest shadow-[2px_2px_5px_rgba(163,177,198,0.25),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4),_-2px_-2px_5px_rgba(255,255,255,0.02)]">
                  {swapperBadge}
                </span>
                {currentUser.isAdmin && (
                  <span className="px-3.5 py-1.5 bg-background text-indigo-600 dark:text-indigo-400 text-[9px] rounded-full border border-slate-200/10 dark:border-slate-800/10 uppercase font-black tracking-widest shadow-[2px_2px_5px_rgba(163,177,198,0.25),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4),_-2px_-2px_5px_rgba(255,255,255,0.02)]">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Preferences Panel */}
            <div className="p-6 rounded-[28px] border border-slate-200/10 dark:border-slate-800/10 bg-background shadow-[6px_6px_16px_rgba(163,177,198,0.35),_-6px_-6px_16px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_16px_rgba(0,0,0,0.5),_-6px_-6px_16px_rgba(255,255,255,0.03)] space-y-4">
              <h3 className="text-xs font-black text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <BellIcon className="w-4 h-4 text-sky-500" />
                Notification Preferences
              </h3>
              <div className="flex items-center justify-between p-3.5 bg-background border border-slate-200/10 dark:border-slate-800/10 rounded-2xl shadow-[inset_2px_2px_5px_rgba(163,177,198,0.2),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.45),_inset_-2px_-2px_5px_rgba(255,255,255,0.02)]">
                <div className="flex-1 pr-2">
                  <div className="font-bold text-text-primary text-xs">
                    Reminder Emails
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5 leading-tight font-semibold">
                    Get email reminders for scheduled sessions and re-engagement updates
                  </div>
                </div>
                <button
                  onClick={toggleReminderEmails}
                  className={`w-10 h-6 rounded-full p-1 transition-all duration-300 relative ${
                    currentUser.reminderEmailsEnabled !== false
                      ? "bg-emerald-500 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]"
                      : "bg-slate-300 dark:bg-slate-700 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 transform ${
                      currentUser.reminderEmailsEnabled !== false
                        ? "translate-x-4"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Skills Panel */}
            <div className="p-6 rounded-[28px] border border-slate-200/10 dark:border-slate-800/10 bg-background shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.55),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)] space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <AcademicCapIcon className="w-4 h-4 text-sky-500" />
                    Skills I Teach
                  </h3>
                  <span className="text-[9px] font-black text-text-secondary bg-background px-2.5 py-1 rounded-full border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_4px_rgba(163,177,198,0.2)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
                    {currentUser.teaches.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {currentUser.teaches.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-3 bg-background border border-slate-200/10 dark:border-slate-800/10 rounded-xl shadow-[2px_2px_4px_rgba(163,177,198,0.15),_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.35)]"
                    >
                      <div className="font-bold text-text-primary text-xs truncate">
                        {skill.name}
                      </div>
                      <span className="text-[8px] text-sky-500 font-black uppercase tracking-wider">
                        Teacher
                      </span>
                    </div>
                  ))}
                  {currentUser.teaches.length === 0 && (
                    <div className="text-text-muted text-[10px] font-bold py-3 text-center">
                      No teaching skills listed.
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200/10 dark:border-slate-800/10 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <UserCircleIcon className="w-4 h-4 text-indigo-500" />
                    Skills to Learn
                  </h3>
                  <span className="text-[9px] font-black text-text-secondary bg-background px-2.5 py-1 rounded-full border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_4px_rgba(163,177,198,0.2)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
                    {currentUser.learns.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {currentUser.learns.map((skill) => (
                    <SkillTag key={skill.id} skill={skill} variant="learn" />
                  ))}
                  {currentUser.learns.length === 0 && (
                    <div className="text-text-muted text-[10px] font-bold py-3 text-center w-full">
                      No learning goals listed.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reputation Metrics */}
            <div className="p-6 rounded-[28px] border border-slate-200/10 dark:border-slate-800/10 bg-background shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.55),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
              <h3 className="text-xs font-black text-text-primary mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                <ChartBarIcon className="w-4 h-4 text-indigo-500" />
                Reputation Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-background border border-slate-200/10 dark:border-slate-800/10 p-3.5 rounded-xl shadow-[2px_2px_5px_rgba(163,177,198,0.15),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.35)]">
                  <div className="text-xl font-black text-text-primary mb-1">
                    {myRatings.length}
                  </div>
                  <div className="text-[8px] text-text-muted uppercase tracking-wider font-black">Reviews</div>
                </div>
                <div className="text-center bg-background border border-slate-200/10 dark:border-slate-800/10 p-3.5 rounded-xl shadow-[2px_2px_5px_rgba(163,177,198,0.15),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.35)]">
                  <div className="text-xl font-black text-amber-500 mb-1">
                    {averageRating}
                  </div>
                  <div className="text-[8px] text-text-muted uppercase tracking-wider font-black">Average</div>
                </div>
                <div className="text-center bg-background border border-slate-200/10 dark:border-slate-800/10 p-3.5 rounded-xl shadow-[2px_2px_5px_rgba(163,177,198,0.15),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.35)]">
                  <div className="text-xl font-black text-sky-500 mb-1">
                    {sessionsTaught}
                  </div>
                  <div className="text-[8px] text-text-muted uppercase tracking-wider font-black">Taught</div>
                </div>
                <div className="text-center bg-background border border-slate-200/10 dark:border-slate-800/10 p-3.5 rounded-xl shadow-[2px_2px_5px_rgba(163,177,198,0.15),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.35)]">
                  <div className="text-xl font-black text-indigo-500 mb-1">
                    {sessionsLearned}
                  </div>
                  <div className="text-[8px] text-text-muted uppercase tracking-wider font-black">Learned</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Primary Content Panel */}
          <div className="lg:col-span-8 space-y-8">
            {/* Analytics Dashboard Grid */}
            <div className="p-6 lg:p-8 rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 bg-background shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.55),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
              <h3 className="text-sm font-black text-text-primary mb-6 flex items-center gap-1.5 uppercase tracking-wider">
                <SparklesIcon className="w-4 h-4 text-sky-500" />
                Analytics Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Performance Grid */}
                <div className="md:col-span-7 space-y-3.5">
                  <div className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">
                    Performance Summary
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(
                      "Lifetime Earned",
                      lifetimeEarnings,
                      "Tokens",
                      <CurrencyDollarIcon className="w-4 h-4" />,
                      "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-500"
                    )}
                    {renderStatCard(
                      "Sessions",
                      sessionsCompleted,
                      "Completed",
                      <CheckCircleIcon className="w-4 h-4" />,
                      "from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-500"
                    )}
                    {renderStatCard(
                      "Reviews",
                      myRatings.length,
                      `★ ${averageRating} Avg`,
                      <SparklesIcon className="w-4 h-4" />,
                      "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-500"
                    )}
                    {renderStatCard(
                      "Response Rate",
                      "98%",
                      "Very Responsive",
                      <ShieldCheckIcon className="w-4 h-4" />,
                      "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-500"
                    )}
                  </div>
                </div>

                {/* Monthly Activity Stack */}
                <div className="md:col-span-5 space-y-3.5">
                  <div className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">
                    Active Month
                  </div>
                  <div className="space-y-4">
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-background border border-slate-200/10 dark:border-slate-800/10 p-4 rounded-[20px] flex items-center gap-4 shadow-[2px_2px_5px_rgba(163,177,198,0.15),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.35)]"
                    >
                      <div className="p-2 bg-background rounded-lg border border-slate-200/10 dark:border-slate-800/10 text-emerald-600 dark:text-emerald-400 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)]">
                        <ArrowUpIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-emerald-500 font-black text-xl tracking-tight">
                          +{currentMonthEarned}
                        </div>
                        <div className="text-text-muted text-[8px] font-black uppercase tracking-wider">
                          Tokens Earned This Month
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="bg-background border border-slate-200/10 dark:border-slate-800/10 p-4 rounded-[20px] flex items-center gap-4 shadow-[2px_2px_5px_rgba(163,177,198,0.15),_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.35)]"
                    >
                      <div className="p-2 bg-background rounded-lg border border-slate-200/10 dark:border-slate-800/10 text-sky-600 dark:text-sky-400 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)]">
                        <CheckCircleIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sky-500 font-black text-xl tracking-tight">
                          {currentMonthSessions}
                        </div>
                        <div className="text-text-muted text-[8px] font-black uppercase tracking-wider">
                          Sessions Completed
                        </div>
                      </div>
                    </motion.div>

                    <div className="bg-background border border-slate-200/10 dark:border-slate-800/10 p-3 rounded-[20px] flex flex-col justify-center shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.55)]">
                      <div className="text-text-primary font-bold text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3 text-indigo-500" /> Upcoming status
                      </div>
                      <div className="text-text-muted text-[8px] font-semibold">
                        No sessions scheduled for later today.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Token History Panel */}
            <div className="p-6 lg:p-8 rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 bg-background shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.55),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-baseline gap-4">
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    Token History
                  </h3>
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-background px-3 py-1 rounded-full border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_4px_rgba(163,177,198,0.15),_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.35)] uppercase tracking-wider">
                    Balance: {currentUser.tokens} S
                  </span>
                </div>
                
                <div className="inline-flex bg-background rounded-xl p-1 border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_4px_rgba(163,177,198,0.15),_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.35)]">
                  {(["all", "earned", "spent"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTokenFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${
                        tokenFilter === filter
                          ? "bg-background text-sky-600 dark:text-sky-400 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] border border-slate-200/10 dark:border-slate-800/10"
                          : "text-text-muted hover:text-text-primary"
                      } uppercase tracking-wider`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={transaction.id}
                        className="group flex items-center gap-4 p-3 bg-background border border-slate-200/10 dark:border-slate-800/10 rounded-xl shadow-[2px_2px_4px_rgba(163,177,198,0.1),_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.35)]"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${transaction.type === "earned" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`}
                        />

                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-slate-200/10 dark:border-slate-800/10 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] ${
                          transaction.type === "earned" ? "text-emerald-500" : "text-rose-500"
                        }`}>
                          {transaction.type === "earned" ? (
                            <ArrowUpIcon className="w-4 h-4" />
                          ) : (
                            <ArrowDownIcon className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-text-primary text-xs truncate">
                            {transaction.description}
                          </div>
                          <div className="text-[9px] text-text-muted mt-0.5 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                            <ClockIcon className="w-3 h-3 text-text-muted/80" />
                            {ensureDate(transaction.timestamp).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                            <span className="w-0.5 h-0.5 rounded-full bg-border" />
                            {ensureDate(transaction.timestamp).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        <div
                          className={`text-right font-mono font-extrabold text-xs ${transaction.type === "earned" ? "text-emerald-500" : "text-rose-500"}`}
                        >
                          {transaction.type === "earned" ? "+" : "-"}
                          {transaction.amount}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-background rounded-2xl border border-dashed border-slate-200/20 dark:border-slate-800/20 shadow-inner">
                      <p className="text-text-muted text-[9px] font-black uppercase tracking-wider">
                        No transactions found.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Testimonials Panel */}
            {myRatings.length > 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    What Others Say
                  </h3>
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                    Latest reviews
                  </span>
                </div>
                <DraggableTestimonials testimonials={myRatings} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

