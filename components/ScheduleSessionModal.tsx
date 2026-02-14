import React, { useState, useEffect } from "react";
import type { User, Skill } from "../types";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  TokenIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "./icons";

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  targetUser: User;
  onSubmit: (teacher: User, skill: Skill, time: Date, duration: number) => void;
}

const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetUser,
  onSubmit,
}) => {
  // Determine default skill (first one they teach)
  const defaultSkillId = targetUser.teaches[0]?.id || "";

  // State
  const [selectedSkillId, setSelectedSkillId] =
    useState<string>(defaultSkillId);
  const [duration, setDuration] = useState<number>(60);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Reset state when modal opens or target user changes
  useEffect(() => {
    if (isOpen) {
      setSelectedSkillId(targetUser.teaches[0]?.id || "");
      setDuration(60);
      setDate("");
      setTime("");
    }
  }, [isOpen, targetUser]);

  const handleSubmit = () => {
    if (!date || !time || !selectedSkillId) return;

    const selectedSkill = targetUser.teaches.find(
      (s) => s.id === selectedSkillId,
    );
    if (selectedSkill) {
      const dateTime = new Date(`${date}T${time}`);
      onSubmit(targetUser, selectedSkill, dateTime, duration);
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedSkill = targetUser.teaches.find(
    (s) => s.id === selectedSkillId,
  );
  const hasTokens = currentUser.tokens >= 1; // Assuming 1 token cost
  const remainingTokens = currentUser.tokens - 1;

  // Helper to format date for display
  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "Select date";
  const formattedTime = time
    ? new Date(`2000-01-01T${time}`).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : "Select time";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        {/* 1. Header with Context */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    targetUser.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.id}`
                  }
                  alt={targetUser.name}
                  className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Schedule with {targetUser.name}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5 text-sky-500" />
                  Learn {selectedSkill?.name || "a new skill"} from{" "}
                  {targetUser.name.split(" ")[0]}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Skill Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide opacity-80">
              Select Topic
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {targetUser.teaches.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    selectedSkillId === skill.id
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-md ring-1 ring-sky-500 ring-opacity-50"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sky-300 dark:hover:border-sky-700"
                  }`}
                >
                  <div className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                    {skill.name}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Advanced Level
                  </div>
                  {selectedSkillId === skill.id && (
                    <div className="absolute top-4 right-4 text-sky-500">
                      <CheckCircleIcon className="w-5 h-5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & DateTime Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Duration */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide opacity-80">
                Duration
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {[15,30,45,60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      duration === mins
                        ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm ring-1 ring-black/5"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Info Strip */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide opacity-80">
                Session Cost
              </label>
              <div
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  hasTokens
                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${hasTokens ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                >
                  <TokenIcon className="w-5 h-5" />
                </div>
                <div>
                  <div
                    className={`font-bold ${hasTokens ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}
                  >
                    1 Token
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {hasTokens
                      ? `You'll have ${remainingTokens} tokens left.`
                      : "Insufficient balance."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide opacity-80">
              When works for you?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none dark:text-white"
                />
                <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                  <CalendarIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none dark:text-white"
                />
                <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                  <ClockIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 ml-1">
              Choose a time that works for both of you.{" "}
              {targetUser.name.split(" ")[0]} will confirm availability.
            </p>
          </div>

          {/* Confirmation Summary Box */}
          {selectedSkillId && date && time && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Summary
                </div>
                <div className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                  <span className="font-bold">{selectedSkill?.name}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                  <span>{duration} mins</span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  {formattedDate} at {formattedTime}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  Total
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  1 Token
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-8 py-5 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <p className="text-xs text-center text-slate-500 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <CheckCircleIcon className="w-3.5 h-3.5 text-slate-400" />
            Tokens are only deducted once the session is accepted.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!date || !time || !selectedSkillId || !hasTokens}
              className="px-8 py-3 rounded-xl bg-sky-600 text-white font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-500 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full sm:w-auto text-center"
            >
              Propose Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;
