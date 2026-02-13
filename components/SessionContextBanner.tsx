import React from "react";
import { Session } from "../types";
import {
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "./icons";

interface SessionContextBannerProps {
  session: Session | null;
  partnerName: string;
  onProposeSession: () => void;
}

const SessionContextBanner: React.FC<SessionContextBannerProps> = ({
  session,
  partnerName,
  onProposeSession,
}) => {
  // No session
  if (!session) {
    return (
      <div className="px-6 py-3 bg-sky-500/10 border-b border-sky-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="w-5 h-5 text-sky-400" />
          <p className="text-sm text-slate-300">
            No active session —{" "}
            <span className="text-sky-400">
              Propose one to start learning together
            </span>
          </p>
        </div>
        <button
          onClick={onProposeSession}
          className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Propose Session
        </button>
      </div>
    );
  }

  // Session pending
  if (session.status === "proposed") {
    return (
      <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-3">
        <ClockIcon className="w-5 h-5 text-amber-400" />
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-amber-400">Session Proposal</span>
          : {session.skill.name} — Awaiting confirmation
        </p>
      </div>
    );
  }

  // Session confirmed
  if (session.status === "scheduled") {
    const sessionDate = new Date(session.scheduledTime);
    const formattedDate = sessionDate.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });

    return (
      <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/30 flex items-center gap-3">
        <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-emerald-400">
            Session Scheduled
          </span>{" "}
          — {formattedDate}
        </p>
      </div>
    );
  }

  // Session declined
  if (session.status === "declined") {
    return (
      <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/30 flex items-center gap-3">
        <XCircleIcon className="w-5 h-5 text-red-400" />
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-red-400">Session Declined</span> —
          You can propose a new session
        </p>
      </div>
    );
  }

  return null;
};

export default SessionContextBanner;
