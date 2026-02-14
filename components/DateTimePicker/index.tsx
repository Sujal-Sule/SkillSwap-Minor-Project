import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarIcon, ClockIcon } from "../icons";
import Calendar from "./Calendar";
import TimePicker from "./TimePicker";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  placeholder?: string;
}

export const CustomDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  placeholder = "Select date",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDisplay = value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all hover:border-sky-400 dark:hover:border-sky-500 group"
      >
        <span
          className={`text-sm ${value ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}`}
        >
          {formattedDisplay}
        </span>
        <CalendarIcon className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 top-full z-[60]"
          >
            <Calendar
              selectedDate={value}
              onSelect={(date) => {
                onChange(date);
                setIsOpen(false);
              }}
              minDate={minDate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
}

export const CustomTimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDisplay = value
    ? new Date(`2000-01-01T${value}`).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all hover:border-sky-400 dark:hover:border-sky-500 group"
      >
        <span
          className={`text-sm ${value ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}`}
        >
          {formattedDisplay}
        </span>
        <ClockIcon className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full z-[60]"
          >
            <TimePicker selectedTime={value} onSelect={onChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
