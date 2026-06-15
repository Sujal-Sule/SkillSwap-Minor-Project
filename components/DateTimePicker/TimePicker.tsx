import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TimePickerProps {
  selectedTime: string;
  onSelect: (time: string) => void;
}

const Clock: React.FC<TimePickerProps> = ({ selectedTime, onSelect }) => {
  const [mode, setMode] = useState<"hours" | "minutes">("hours");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [tempHours, setTempHours] = useState(12);
  const [tempMinutes, setTempMinutes] = useState(0);
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(":").map(Number);
      setPeriod(h >= 12 ? "PM" : "AM");
      setTempHours(h % 12 || 12);
      setTempMinutes(m);
    }
  }, [selectedTime]);

  const updateTime = (h: number, m: number, p: "AM" | "PM") => {
    let finalH = h === 12 ? 0 : h;
    if (p === "PM") finalH += 12;
    const formatted = `${String(finalH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onSelect(formatted);
  };

  const handleDialClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    // Calculate angle in degrees from top (0 deg)
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    if (mode === "hours") {
      // 360 / 12 = 30 degrees per hour
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      if (h > 12) h = 12;
      setTempHours(h);
      updateTime(h, tempMinutes, period);
      // Wait a bit before switching to minutes for better UX
      setTimeout(() => setMode("minutes"), 300);
    } else {
      // 360 / 60 = 6 degrees per minute
      let m = Math.round(angle / 6);
      if (m === 60) m = 0;
      // Snap to 5 minute intervals for the "Series A" feel
      m = Math.round(m / 5) * 5;
      if (m === 60) m = 0;
      setTempMinutes(m);
      updateTime(tempHours, m, period);
    }
  };

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="w-full max-w-[288px] bg-background dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 flex flex-col items-center select-none">
      {/* Time Display */}
      <div className="flex items-center justify-center p-3 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 w-full shadow-inner gap-3">
        <div className="flex items-center bg-background dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-850 p-1">
          <button
            onClick={() => setMode("hours")}
            className={`px-3 py-2 text-3xl font-bold rounded-lg transition-all ${mode === "hours" ? "bg-sky-500 text-white shadow-md" : "text-text-muted hover:text-text-primary hover:bg-slate-200/30 dark:hover:bg-slate-800/30"}`}
          >
            {String(tempHours).padStart(2, "0")}
          </button>
          <span className="text-3xl font-bold text-text-muted mx-1">
            :
          </span>
          <button
            onClick={() => setMode("minutes")}
            className={`px-3 py-2 text-3xl font-bold rounded-lg transition-all ${mode === "minutes" ? "bg-sky-500 text-white shadow-md" : "text-text-muted hover:text-text-primary hover:bg-slate-200/30 dark:hover:bg-slate-800/30"}`}
          >
            {String(tempMinutes).padStart(2, "0")}
          </button>
        </div>

        <div className="flex flex-col bg-slate-200/30 dark:bg-slate-800/30 rounded-xl p-1 gap-1">
          <button
            onClick={() => {
              setPeriod("AM");
              updateTime(tempHours, tempMinutes, "AM");
            }}
            className={`text-[10px] font-black px-2 py-1.5 rounded-lg transition-all uppercase tracking-tighter ${period === "AM" ? "bg-background dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm" : "text-text-muted"}`}
          >
            AM
          </button>
          <button
            onClick={() => {
              setPeriod("PM");
              updateTime(tempHours, tempMinutes, "PM");
            }}
            className={`text-[10px] font-black px-2 py-1.5 rounded-lg transition-all uppercase tracking-tighter ${period === "PM" ? "bg-background dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm" : "text-text-muted"}`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock Face */}
      <div
        ref={clockRef}
        onClick={handleDialClick}
        className="relative w-48 h-48 bg-slate-100/50 dark:bg-slate-950/50 rounded-full border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center cursor-pointer active:scale-98 transition-transform overflow-hidden"
      >
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-sky-500 rounded-full z-30 shadow-sm" />

        {/* Selector Arm */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 bg-sky-500 z-10 transition-transform duration-300"
          style={{
            height: "72px",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) translateY(-100%) rotate(${mode === "hours" ? (tempHours % 12) * 30 : tempMinutes * 6}deg)`,
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-sky-500 bg-sky-500/20 shadow-md shadow-sky-500/20" />
        </div>

        {/* Numbers/Dots */}
        {(mode === "hours" ? hours : minutes).map((val, i) => {
          const angle = (i / 12) * 360 - 90;
          const radius = 72;
          const x = radius * Math.cos((angle * Math.PI) / 180);
          const y = radius * Math.sin((angle * Math.PI) / 180);
          const isSelected =
            mode === "hours" ? val === tempHours : val === tempMinutes;

          return (
            <div
              key={val}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs font-black transition-all rounded-full
                  ${isSelected ? "text-white" : "text-text-muted"}
                `}
              >
                {val}
              </div>
            </div>
          );
        })}

        {/* Hour/Minute Markers for premium feel */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className={`absolute top-1/2 left-1/2 w-0.5 origin-bottom ${i % 5 === 0 ? "h-2 bg-slate-350 dark:bg-slate-700" : "h-1 bg-slate-300/30 dark:bg-slate-700/30"}`}
            style={{
              bottom: "50%",
              transform: `translateX(-50%) rotate(${i * 6}deg) translateY(-88px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Clock;
