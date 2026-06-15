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
import { CustomDatePicker, CustomTimePicker } from "./DateTimePicker";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-background dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        {/* 1. Header with Context */}
        <div className="bg-background px-8 py-6 border-b border-slate-200/10 dark:border-slate-800/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    targetUser.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.id}`
                  }
                  alt={targetUser.name}
                  className="w-14 h-14 rounded-full border-2 border-background dark:border-slate-800 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background dark:border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h2 className="text-xl font-black text-text-primary tracking-tight">
                  Schedule with {targetUser.name}
                </h2>
                <p className="text-text-muted text-xs font-semibold mt-0.5 flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                  Learn {selectedSkill?.name || "a new skill"} from{" "}
                  {targetUser.name.split(" ")[0]}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-background border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 text-text-muted hover:text-text-primary transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-background">
          {/* Skill Selection */}
          <div>
            <label className="block text-xs font-black text-text-muted mb-3 uppercase tracking-wider">
              Select Topic
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {targetUser.teaches.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={`relative p-5 rounded-2xl border text-left transition-all ${
                    selectedSkillId === skill.id
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 shadow-sm ring-1 ring-sky-500"
                      : "border-slate-200 dark:border-slate-800 bg-background shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="font-bold text-text-primary text-base mb-1">
                    {skill.name}
                  </div>
                  <div className="text-xs font-semibold text-text-muted">
                    Advanced Level
                  </div>
                  {selectedSkillId === skill.id && (
                    <div className="absolute top-5 right-5 text-sky-500">
                      <CheckCircleIcon className="w-5 h-5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & DateTime Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div>
              <label className="block text-xs font-black text-text-muted mb-3 uppercase tracking-wider">
                Duration
              </label>
              <div className="flex bg-slate-100/50 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      duration === mins
                        ? "bg-background text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-800 shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Info Strip */}
            <div>
              <label className="block text-xs font-black text-text-muted mb-3 uppercase tracking-wider">
                Session Cost
              </label>
              <div
                className={`p-4 rounded-2xl border flex items-center gap-4 transition-colors ${
                  hasTokens
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20 shadow-[inset_2px_2px_5px_rgba(16,185,129,0.05)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]"
                    : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/20 shadow-[inset_2px_2px_5px_rgba(244,63,94,0.05)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${hasTokens ? "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600" : "bg-rose-100/50 dark:bg-rose-900/30 text-rose-600"}`}
                >
                  <TokenIcon className="w-5 h-5" />
                </div>
                <div>
                  <div
                    className={`font-black text-base ${hasTokens ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                  >
                    1 Token
                  </div>
                  <div className="text-xs font-semibold text-text-muted mt-0.5">
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
            <label className="block text-xs font-black text-text-muted mb-3 uppercase tracking-wider">
              When works for you?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <CustomDatePicker
                value={date}
                onChange={setDate}
                minDate={new Date().toISOString().split("T")[0]}
              />
              <CustomTimePicker value={time} onChange={setTime} />
            </div>
            <p className="text-xs font-semibold text-text-muted mt-3 ml-1">
              Choose a time that works for both of you.{" "}
              {targetUser.name.split(" ")[0]} will confirm availability.
            </p>
          </div>

          {/* Confirmation Summary Box */}
          {selectedSkillId && date && time && (
            <div className="bg-slate-100/30 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.02)]">
              <div>
                <div className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1">
                  Summary
                </div>
                <div className="text-text-primary font-bold flex items-center gap-2 text-base">
                  <span>{selectedSkill?.name}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                  <span className="text-sm text-text-muted">{duration} mins</span>
                </div>
                <div className="text-xs font-semibold text-text-muted mt-0.5">
                  {formattedDate} at {formattedTime}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-1">
                  Total Cost
                </div>
                <div className="text-xl font-black text-text-primary">
                  1 Token
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Footer Actions */}
        <div className="bg-background px-8 py-5 border-t border-slate-200/10 dark:border-slate-800/10 flex flex-col gap-4">
          <p className="text-xs text-center font-semibold text-text-muted flex items-center justify-center gap-1.5">
            <CheckCircleIcon className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
            Tokens are only deducted once the session is accepted.
          </p>
          <div className="flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-background border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 text-text-muted hover:text-text-primary font-bold transition-all w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!date || !time || !selectedSkillId || !hasTokens}
              className="px-8 py-3 rounded-2xl bg-sky-600 text-white font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-500 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full sm:w-auto text-center"
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
