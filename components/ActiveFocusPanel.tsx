import React from "react";
import { motion } from "framer-motion";
import type { Session, User } from "../types";
import { AcademicCapIcon, SparklesIcon, ClockIcon } from "./icons";
import SkillTag from "./SkillTag";

interface ActiveFocusPanelProps {
  nextSession?: Session;
  mentor?: User;
  onJoinSession: (session: Session) => void;
  onFindMentor: () => void;
}

const ActiveFocusPanel: React.FC<ActiveFocusPanelProps> = ({
  nextSession,
  mentor,
  onJoinSession,
  onFindMentor,
}) => {
  // Calculate countdown for next session
  const getCountdown = (scheduledTime: string) => {
    const now = new Date();
    const sessionTime = new Date(scheduledTime);
    const diff = sessionTime.getTime() - now.getTime();

    if (diff < 0) return "Session time passed";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return sessionTime.toLocaleDateString([], {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }

    if (hours > 0) {
      return `Starts in ${hours}h ${minutes}m`;
    }
    return `Starts in ${minutes}m`;
  };

  const isUrgent = (scheduledTime: string) => {
    const diff = new Date(scheduledTime).getTime() - new Date().getTime();
    return diff < 60 * 60 * 1000; // Less than 1 hour
  };

  // Has upcoming session
  if (nextSession && mentor) {
    const countdown = getCountdown(nextSession.scheduledTime);
    const urgent = isUrgent(nextSession.scheduledTime);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Your Next Session
            </h3>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-slate-500" />
              <p
                className={`text-sm font-medium ${urgent ? "text-orange-600 dark:text-orange-400" : "text-slate-600 dark:text-slate-400"}`}
              >
                {countdown}
              </p>
            </div>
          </div>
          {urgent && (
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full">
              SOON
            </span>
          )}
        </div>

        <div className="flex items-center gap-6 mb-6">
          <img
            src={mentor.avatarUrl}
            alt={mentor.name}
            className="w-20 h-20 rounded-2xl border-2 border-slate-300 dark:border-slate-600"
          />
          <div className="flex-1">
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {mentor.name}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {nextSession.studentId === mentor.id
                ? "Learning from you"
                : "Teaching you"}
            </p>
            <SkillTag skill={nextSession.skill} />
          </div>
        </div>

        <button
          onClick={() => onJoinSession(nextSession)}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
        >
          Join Session
        </button>
      </motion.div>
    );
  }

  // No upcoming session - CTA
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center shadow-md"
    >
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 rounded-2xl bg-sky-500/10 flex items-center justify-center">
          <AcademicCapIcon className="w-10 h-10 text-sky-500" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
        Ready for your next session?
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Connect with skilled mentors and start learning something new today
      </p>
      <button
        onClick={onFindMentor}
        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
      >
        <SparklesIcon className="w-5 h-5" />
        Find a Mentor
      </button>
    </motion.div>
  );
};

export default ActiveFocusPanel;
