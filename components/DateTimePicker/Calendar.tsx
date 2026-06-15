import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "../icons";

interface CalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  minDate?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onSelect,
  minDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate) : new Date(),
  );

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate);
    return (
      d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    );
  };

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const current = new Date(year, month, day);
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    return current < min;
  };

  const renderDays = () => {
    const dayElements = [];
    // Padding for first day
    for (let i = 0; i < firstDay; i++) {
      dayElements.push(<div key={`pad-${i}`} className="h-9 w-9" />);
    }

    for (let day = 1; day <= days; day++) {
      const disabled = isDisabled(day);
      const selected = isSelected(day);

      dayElements.push(
        <button
          key={day}
          disabled={disabled}
          onClick={() => {
            const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            onSelect(formattedDate);
          }}
          className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all
            ${
              selected
                ? "bg-sky-500 text-white font-bold shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]"
                : disabled
                  ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40"
                  : "text-text-primary hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            }
          `}
        >
          {day}
        </button>,
      );
    }
    return dayElements;
  };

  return (
    <div className="w-full max-w-[288px] bg-background dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-text-primary uppercase tracking-wider text-xs">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-text-muted transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-text-muted transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WeekDays */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="h-8 w-9 flex items-center justify-center text-[10px] font-black text-text-muted uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  );
};

export default Calendar;
